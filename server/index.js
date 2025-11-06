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
      telefono TEXT,
      categoria TEXT NOT NULL DEFAULT 'Persona Natural',
      litros_mes REAL DEFAULT 0,
      litros_disponibles REAL DEFAULT 0,
      activo BOOLEAN DEFAULT 1
    );

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

// Ruta protegida de ejemplo
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard' });
});

// Registrar nuevo cliente (requiere autenticación)
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, telefono, litros_mes, categoria = 'Persona Natural' } = req.body;

    // Validaciones
    if (!nombre || !telefono || litros_mes === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (categoria !== 'Persona Natural' && categoria !== 'Gobernación') {
      return res.status(400).json({ error: 'Categoría no válida. Debe ser "Persona Natural" o "Gobernación"' });
    }

    if (isNaN(litros_mes) || litros_mes <= 0) {
      return res.status(400).json({ error: 'La cantidad de litros debe ser mayor a cero' });
    }

    // Verificar si el teléfono ya está registrado
    const existingClient = await db.get(
      'SELECT id FROM clientes WHERE telefono = ?',
      [telefono]
    );

    if (existingClient) {
      return res.status(400).json({ error: 'El número telefónico ya está registrado' });
    }

    // Crear el cliente en la base de datos
    const result = await db.run(
      `INSERT INTO clientes (nombre, telefono, categoria, litros_mes, litros_disponibles, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, telefono, categoria, litros_mes, litros_mes]
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
app.post('/api/retiros', async (req, res) => {
  try {
    const { cliente_id, litros } = req.body;

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
      [cliente_id, 1, litros] // usuario_id = 1 (admin por defecto)
    );

    // Actualizar litros disponibles del cliente
    await db.run(
      'UPDATE clientes SET litros_disponibles = litros_disponibles - ? WHERE id = ?',
      [litros, cliente_id]
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
      litrosHoy: hoy.total,
      litrosMes: esteMes.total,
      litrosAno: esteAno.total,
      clientesHoy: clientesHoy.total,
      litrosPorMes,
      retirosPorDia
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
