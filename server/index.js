require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Configuración de la base de datos SQLite
let db;
async function initDB() {
  db = await open({
    filename: './gas_delivery.db',
    driver: sqlite3.Database
  });

  // Crear tablas si no existen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      contrasena TEXT NOT NULL,
      nombre TEXT NOT NULL,
      es_admin BOOLEAN DEFAULT 0,
      activo BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT NOT NULL,
      cedula TEXT UNIQUE NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'Persona Natural',
      litros_mes REAL DEFAULT 0,
      litros_disponibles REAL DEFAULT 0,
      activo BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Crear índice para búsquedas por cédula
    CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
    
    -- Crear índice para búsquedas por teléfono
    CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

    -- Tabla de inventario
    CREATE TABLE IF NOT EXISTS inventario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      litros_ingresados REAL NOT NULL,
      litros_disponibles REAL NOT NULL,
      fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      usuario_id INTEGER,
      observaciones TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    );

    -- Índice para búsquedas por fecha
    CREATE INDEX IF NOT EXISTS idx_inventario_fecha ON inventario(fecha_ingreso);

    CREATE TABLE IF NOT EXISTS retiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      litros REAL NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    );
  `);

  // Crear o actualizar usuario administrador
  const hashedPassword = await bcrypt.hash('1230', 10);
  await db.run(`
    INSERT OR REPLACE INTO usuarios (usuario, contrasena, nombre, es_admin)
    VALUES (?, ?, ?, ?)
  `, ['admin', hashedPassword, 'Administrador', 1]);
  
  console.log('Usuario administrador actualizado');
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Se requieren usuario y contraseña' });
    }

    const user = await db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    
    if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, es_admin: user.es_admin },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        es_admin: user.es_admin === 1
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para autenticación por cédula
app.post('/api/clientes/login', async (req, res) => {
  try {
    const { cedula } = req.body;

    // Validar que se proporcione la cédula
    if (!cedula) {
      return res.status(400).json({ error: 'La cédula es requerida' });
    }

    // Buscar al cliente por cédula
    const cliente = await db.get(
      'SELECT * FROM clientes WHERE cedula = ? AND activo = 1',
      [cedula]
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado o inactivo' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: cliente.id, 
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        tipo: 'cliente' 
      },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '8h' }
    );

    // Devolver información del cliente (sin datos sensibles)
    res.json({
      token,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        telefono: cliente.telefono,
        categoria: cliente.categoria,
        litros_disponibles: cliente.litros_disponibles,
        litros_mes: cliente.litros_mes
      }
    });
  } catch (error) {
    console.error('Error en autenticación de cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta protegida de ejemplo
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard' });
});

// Registrar nuevo cliente (requiere autenticación)
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, telefono, cedula, litros_mes, categoria = 'Persona Natural' } = req.body;

    // Validaciones
    if (!nombre || !telefono || !cedula || litros_mes === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (categoria !== 'Persona Natural' && categoria !== 'Gobernación') {
      return res.status(400).json({ error: 'Categoría no válida. Debe ser "Persona Natural" o "Gobernación"' });
    }

    if (isNaN(litros_mes) || litros_mes <= 0) {
      return res.status(400).json({ error: 'La cantidad de litros debe ser mayor a cero' });
    }

    // Validar formato de cédula venezolana (7 u 8 dígitos)
    const cedulaRegex = /^[0-9]{7,8}$/;
    if (!cedulaRegex.test(cedula)) {
      return res.status(400).json({ error: 'La cédula debe tener 7 u 8 dígitos numéricos' });
    }

    // Verificar si el teléfono o la cédula ya están registrados
    const existingClient = await db.get(
      'SELECT id FROM clientes WHERE telefono = ? OR cedula = ?',
      [telefono, cedula]
    );

    if (existingClient) {
      return res.status(400).json({ error: 'El número telefónico o cédula ya están registrados' });
    }

    // Crear el cliente en la base de datos
    const result = await db.run(
      `INSERT INTO clientes (nombre, telefono, cedula, categoria, litros_mes, litros_disponibles, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, telefono, cedula, categoria, litros_mes, litros_mes]
    );

    // Crear usuario para el cliente (el teléfono será el usuario y contraseña)
    const hashedPassword = await bcrypt.hash(telefono, 10);
    await db.run(
      `INSERT INTO usuarios (usuario, contrasena, nombre, es_admin)
       VALUES (?, ?, ?, 0)`,
      [telefono, hashedPassword, nombre]
    );

    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      clienteId: result.lastID
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registrar retiro de combustible
app.post('/api/retiros', authenticateToken, async (req, res) => {
  try {
    const { cliente_id, litros } = req.body;
    
    // Verificar que hay suficiente inventario
    const inventario = await db.get('SELECT litros_disponibles FROM inventario ORDER BY id DESC LIMIT 1');
    if (!inventario || inventario.litros_disponibles < litros) {
      return res.status(400).json({ error: 'No hay suficiente combustible disponible en inventario' });
    }

    if (!cliente_id || !litros) {
      return res.status(400).json({ error: 'Cliente ID y litros son requeridos' });
    }

    if (isNaN(litros) || litros <= 0) {
      return res.status(400).json({ error: 'La cantidad de litros debe ser mayor a cero' });
    }

    // Obtener datos del cliente
    const cliente = await db.get(
      'SELECT litros_disponibles FROM clientes WHERE id = ? AND activo = 1',
      [cliente_id]
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (litros > cliente.litros_disponibles) {
      return res.status(400).json({ 
        error: `No hay suficientes litros disponibles. Disponible: ${cliente.litros_disponibles}` 
      });
    }

    // Registrar el retiro
    const result = await db.run(
      'INSERT INTO retiros (cliente_id, usuario_id, litros) VALUES (?, ?, ?)',
      [cliente_id, req.user.id, litros]
    );

    // Actualizar litros disponibles del cliente
    await db.run(
      'UPDATE clientes SET litros_disponibles = litros_disponibles - ? WHERE id = ?',
      [litros, cliente_id]
    );

    // Actualizar el inventario
    await db.run(
      'UPDATE inventario SET litros_disponibles = litros_disponibles - ? WHERE id = (SELECT id FROM inventario ORDER BY id DESC LIMIT 1)',
      [litros]
    );

    res.status(201).json({
      message: 'Retiro registrado exitosamente',
      retiroId: result.lastID
    });
  } catch (error) {
    console.error('Error al registrar retiro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener retiros de un cliente
app.get('/api/retiros/cliente/:clienteId', async (req, res) => {
  try {
    const { clienteId } = req.params;
    const retiros = await db.all(
      'SELECT id, litros, fecha FROM retiros WHERE cliente_id = ? ORDER BY fecha DESC LIMIT 50',
      [clienteId]
    );

    res.json(retiros);
  } catch (error) {
    console.error('Error al obtener retiros:', error);
    res.status(500).json({ error: 'Error al obtener los retiros' });
  }
});

// Obtener todos los retiros (para admin)
app.get('/api/retiros', async (req, res) => {
  try {
    const retiros = await db.all(`
      SELECT 
        r.id, 
        r.litros, 
        r.fecha,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono
      FROM retiros r
      JOIN clientes c ON r.cliente_id = c.id
      ORDER BY r.fecha DESC
      LIMIT 100
    `);

    res.json(retiros);
  } catch (error) {
    console.error('Error al obtener retiros:', error);
    res.status(500).json({ error: 'Error al obtener los retiros' });
  }
});

// Obtener estadísticas generales para el dashboard
app.get('/api/estadisticas', async (req, res) => {
  try {
    // Obtener total de clientes activos
    const clientesActivos = await db.get(
      'SELECT COUNT(*) as total FROM clientes WHERE activo = 1'
    );

    // Obtener total de litros entregados (todos los retiros)
    const litrosEntregados = await db.get(
      'SELECT COALESCE(SUM(litros), 0) as total FROM retiros'
    );

    // Obtener el inventario actual
    const inventario = await db.get(
      'SELECT litros_disponibles FROM inventario ORDER BY id DESC LIMIT 1'
    );

    // Obtener el próximo vencimiento (podrías implementar esta lógica según tus necesidades)
    const proximoVencimiento = 0; // Por ahora lo dejamos en 0

    res.json({
      totalClientes: clientesActivos?.total || 0,
      totalLitrosEntregados: litrosEntregados?.total || 0,
      inventarioActual: inventario?.litros_disponibles || 0,
      proximoVencimiento: proximoVencimiento
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

// Obtener estadísticas de retiros por día, mes y año
app.get('/api/estadisticas/retiros', async (req, res) => {
  try {
    // Litros retirados hoy
    const hoy = await db.get(`
      SELECT COALESCE(SUM(litros), 0) as total
      FROM retiros
      WHERE DATE(fecha) = DATE('now', 'localtime')
    `);

    // Litros retirados este mes
    const esteMes = await db.get(`
      SELECT COALESCE(SUM(litros), 0) as total
      FROM retiros
      WHERE strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now', 'localtime')
    `);

    // Litros retirados este año
    const esteAno = await db.get(`
      SELECT COALESCE(SUM(litros), 0) as total
      FROM retiros
      WHERE strftime('%Y', fecha) = strftime('%Y', 'now', 'localtime')
    `);

    // Clientes únicos que retiraron hoy
    const clientesHoy = await db.get(`
      SELECT COUNT(DISTINCT cliente_id) as total
      FROM retiros
      WHERE DATE(fecha) = DATE('now', 'localtime')
    `);

    // Litros por mes (últimos 12 meses)
    const litrosPorMes = await db.all(`
      SELECT 
        strftime('%Y-%m', fecha) as mes,
        SUM(litros) as total
      FROM retiros
      WHERE fecha >= date('now', '-12 months', 'localtime')
      GROUP BY strftime('%Y-%m', fecha)
      ORDER BY mes ASC
    `);

    // Retiros por día (últimos 7 días)
    const retirosPorDia = await db.all(`
      SELECT 
        DATE(fecha) as dia,
        SUM(litros) as total,
        COUNT(DISTINCT cliente_id) as clientes
      FROM retiros
      WHERE fecha >= date('now', '-7 days', 'localtime')
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `);

    res.json({
      litrosHoy: hoy?.total || 0,
      litrosMes: esteMes?.total || 0,
      litrosAno: esteAno?.total || 0,
      clientesHoy: clientesHoy?.total || 0,
      litrosPorMes: litrosPorMes || [],
      retirosPorDia: retirosPorDia || []
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de retiros:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Buscar cliente por teléfono (sin autenticación)
app.get('/api/clientes/telefono/:telefono', async (req, res) => {
  try {
    const { telefono } = req.params;
    const cliente = await db.get(
      'SELECT id, nombre, direccion, telefono, litros_mes as litrosMes, litros_disponibles as litrosDisponibles, activo FROM clientes WHERE telefono = ? AND activo = 1',
      [telefono]
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({
      id: cliente.id,
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      litros_mes: cliente.litrosMes,
      litros_disponibles: cliente.litrosDisponibles,
      activo: cliente.activo === 1
    });
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar el cliente' });
  }
});

// Rutas de inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const inventario = await db.get('SELECT * FROM inventario ORDER BY id DESC LIMIT 1');
    res.json(inventario || { litros_disponibles: 0 });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
});

app.get('/api/inventario/historial', async (req, res) => {
  try {
    const historial = await db.all(`
      SELECT i.*, u.usuario as usuario_nombre 
      FROM inventario i 
      LEFT JOIN usuarios u ON i.usuario_id = u.id 
      ORDER BY i.fecha_ingreso DESC
    `);
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial de inventario:', error);
    res.status(500).json({ error: 'Error al obtener el historial de inventario' });
  }
});

app.post('/api/inventario', authenticateToken, async (req, res) => {
  try {
    const { litros_ingresados, observaciones } = req.body;
    const usuario_id = req.user.id;

    if (!litros_ingresados || isNaN(litros_ingresados) || litros_ingresados <= 0) {
      return res.status(400).json({ error: 'Ingrese una cantidad válida de litros' });
    }

    // Obtener el inventario actual
    const inventarioActual = await db.get('SELECT * FROM inventario ORDER BY id DESC LIMIT 1');
    const litros_disponibles = (inventarioActual?.litros_disponibles || 0) + parseFloat(litros_ingresados);

    // Insertar nuevo registro de inventario
    const result = await db.run(
      'INSERT INTO inventario (litros_ingresados, litros_disponibles, usuario_id, observaciones) VALUES (?, ?, ?, ?)',
      [parseFloat(litros_ingresados), litros_disponibles, usuario_id, observaciones || null]
    );

    res.status(201).json({
      id: result.lastID,
      litros_ingresados: parseFloat(litros_ingresados),
      litros_disponibles,
      usuario_id,
      observaciones: observaciones || null
    });
  } catch (error) {
    console.error('Error al actualizar inventario:', error);
    res.status(500).json({ error: 'Error al actualizar el inventario' });
  }
});

// Iniciar servidor
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Servidor Node.js ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
