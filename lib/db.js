import { createClient } from '@libsql/client'

let client
let ready

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url) {
      throw new Error('TURSO_DATABASE_URL não configurada. Veja o README para criar o banco no Turso.')
    }
    client = createClient({ url, authToken })
  }
  return client
}

async function migrate(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      doc_type TEXT NOT NULL DEFAULT 'Pessoa Física',
      cpf TEXT NOT NULL DEFAULT '',
      rg TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      items TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export async function getDb() {
  const db = getClient()
  if (!ready) ready = migrate(db)
  await ready
  return db
}
