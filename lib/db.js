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
      user_id INTEGER REFERENCES users(id),
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      items TEXT NOT NULL,
      customer_name TEXT NOT NULL DEFAULT '',
      customer_email TEXT NOT NULL DEFAULT '',
      customer_phone TEXT NOT NULL DEFAULT '',
      customer_address TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      subtotal REAL NOT NULL DEFAULT 0,
      shipping REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS crm_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'lead',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      customer_name TEXT NOT NULL DEFAULT '',
      value REAL NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'Novo',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const info = await db.execute('PRAGMA table_info(orders)')
  const columns = info.rows.map((r) => r.name)
  const userIdCol = info.rows.find((r) => r.name === 'user_id')

  const missing = [
    ['customer_name', "TEXT NOT NULL DEFAULT ''"],
    ['customer_email', "TEXT NOT NULL DEFAULT ''"],
    ['customer_phone', "TEXT NOT NULL DEFAULT ''"],
    ['customer_address', "TEXT NOT NULL DEFAULT ''"],
    ['payment_method', "TEXT NOT NULL DEFAULT ''"],
    ['notes', "TEXT NOT NULL DEFAULT ''"],
    ['subtotal', 'REAL NOT NULL DEFAULT 0'],
    ['shipping', 'REAL NOT NULL DEFAULT 0'],
  ].filter(([name]) => !columns.includes(name))

  for (const [name, def] of missing) {
    await db.execute(`ALTER TABLE orders ADD COLUMN ${name} ${def}`)
  }

  if (userIdCol && userIdCol.notnull) {
    await db.execute(`
      CREATE TABLE orders_new (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        total REAL NOT NULL,
        items TEXT NOT NULL,
        customer_name TEXT NOT NULL DEFAULT '',
        customer_email TEXT NOT NULL DEFAULT '',
        customer_phone TEXT NOT NULL DEFAULT '',
        customer_address TEXT NOT NULL DEFAULT '',
        payment_method TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        subtotal REAL NOT NULL DEFAULT 0,
        shipping REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    await db.execute(`
      INSERT INTO orders_new (id, user_id, date, status, total, items, customer_name, customer_email, customer_phone, customer_address, payment_method, notes, subtotal, shipping, created_at)
      SELECT id, user_id, date, status, total, items, customer_name, customer_email, customer_phone, customer_address, payment_method, notes, subtotal, shipping, created_at FROM orders
    `)
    await db.execute('DROP TABLE orders')
    await db.execute('ALTER TABLE orders_new RENAME TO orders')
  }
}

export async function getDb() {
  const db = getClient()
  if (!ready) ready = migrate(db)
  await ready
  return db
}

const DEFAULT_SETTINGS = {
  costRate: 40,
  taxRate: 6,
  pixFeeRate: 0.99,
  cardFeeRate: 4.99,
}

export async function getFinanceSettings() {
  const db = await getDb()
  const result = await db.execute('SELECT key, value FROM settings')
  const stored = Object.fromEntries(result.rows.map((r) => [r.key, Number(r.value)]))
  return { ...DEFAULT_SETTINGS, ...stored }
}

export async function setFinanceSettings(updates) {
  const db = await getDb()
  const keys = Object.keys(DEFAULT_SETTINGS)
  for (const key of keys) {
    if (updates[key] == null) continue
    const value = Number(updates[key])
    if (Number.isNaN(value)) continue
    await db.execute({
      sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      args: [key, String(value)],
    })
  }
  return getFinanceSettings()
}
