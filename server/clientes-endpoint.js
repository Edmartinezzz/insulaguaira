// Este archivo documenta el endpoint que debe agregarse a server/index.js

// POST /api/clientes - Registrar nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, telefono, litros_mes } = req.body;

    // Validaciones
    if (!nombre || !telefono || litros_mes === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
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
      `INSERT INTO clientes (nombre, telefono, litros_mes, litros_disponibles, activo)
       VALUES (?, ?, ?, ?, 1)`,
      [nombre, telefono, litros_mes, litros_mes]
    );

    // Crear usuario para el cliente (el teléfono será el usuario y contraseña)
    const hashedPassword = await bcrypt.hash(telefono, 10);
    await db.run(
      `INSERT INTO usuarios (usuario, contrasena, nombre, es_admin, cliente_id)
       VALUES (?, ?, ?, 0, ?)`,
      [telefono, hashedPassword, nombre, result.lastID]
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
