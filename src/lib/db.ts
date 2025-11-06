import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let _db: Database | null = null;

async function initDb(db: Database) {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT NOT NULL UNIQUE,
      direccion TEXT,
      litros_mes REAL NOT NULL,
      litros_disponibles REAL NOT NULL,
      activo INTEGER DEFAULT 1,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      nombre TEXT NOT NULL,
      es_admin INTEGER DEFAULT 0,
      cliente_id INTEGER,
      activo INTEGER DEFAULT 1,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    );

    CREATE TABLE IF NOT EXISTS retiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      litros REAL NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    );
  `);
}

export async function getDb() {
  if (_db) return _db;
  _db = await open({
    filename: path.join(process.cwd(), 'database.db'),
    driver: sqlite3.Database,
  });
  await initDb(_db);

  // Asegurar admin por defecto (usuario: admin, contrasena: 1230 ya se establece en backend, aquí solo garantizamos entrada si no existe)
  const admin = await _db.get<{ id: number }>(`SELECT id FROM usuarios WHERE usuario = ?`, ['admin']);
  if (!admin) {
    // hash '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH.3xPb1Qpz7F3ihzmJxq5sVqoQ8qQe' corresponde a "password"; el backend Node ya actualiza a 1230.
    await _db.run(
      `INSERT INTO usuarios (usuario, contrasena, nombre, es_admin) VALUES (?, ?, ?, 1)`,
      ['admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MH.3xPb1Qpz7F3ihzmJxq5sVqoQ8qQe', 'Administrador']
    );
  }
  return _db;
}

export const db = {
  async get<T = any>(sql: string, params: any[] = []) {
    const database = await getDb();
    return database.get<T>(sql, params);
  },
  async all<T = any>(sql: string, params: any[] = []) {
    const database = await getDb();
    return database.all<T>(sql, params);
  },
  async run(sql: string, params: any[] = []) {
    const database = await getDb();
    return database.run(sql, params);
  },
  async exec(sql: string) {
    const database = await getDb();
    return database.exec(sql);
  },
};
