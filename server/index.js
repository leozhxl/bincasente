import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.js'

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'brinca-e-sente-dev-secret-change-in-production'

app.use(cors())
app.use(express.json())

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    lastName: row.last_name,
    docType: row.doc_type,
    cpf: row.cpf,
    rg: row.rg,
    displayName: [row.name, row.last_name].filter(Boolean).join(' ') || row.email.split('@')[0],
  }
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
  }
}

app.post('/api/register', (req, res) => {
  const { email, password, name, lastName, docType, cpf, rg } = req.body || {}

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare(
      `INSERT INTO users (email, password_hash, name, last_name, doc_type, cpf, rg)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(email, passwordHash, name || '', lastName || '', docType || 'Pessoa Física', cpf || '', rg || '')

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  const token = signToken(user.id)
  res.status(201).json({ token, user: toPublicUser(user) })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
  }

  const token = signToken(user.id)
  res.json({ token, user: toPublicUser(user) })
})

app.get('/api/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })
  res.json({ user: toPublicUser(user) })
})

app.put('/api/me', requireAuth, (req, res) => {
  const { name, lastName, docType, cpf, rg } = req.body || {}
  db.prepare(
    `UPDATE users SET name = ?, last_name = ?, doc_type = ?, cpf = ?, rg = ? WHERE id = ?`
  ).run(name || '', lastName || '', docType || 'Pessoa Física', cpf || '', rg || '', req.userId)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  res.json({ user: toPublicUser(user) })
})

app.delete('/api/me', requireAuth, (req, res) => {
  db.prepare('DELETE FROM orders WHERE user_id = ?').run(req.userId)
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId)
  res.status(204).end()
})

app.get('/api/orders', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId)
  res.json({
    orders: rows.map((r) => ({
      id: r.id,
      date: r.date,
      status: r.status,
      total: r.total,
      items: JSON.parse(r.items),
    })),
  })
})

app.post('/api/orders', requireAuth, (req, res) => {
  const { id, date, status, total, items } = req.body || {}
  if (!id || total == null) return res.status(400).json({ error: 'Pedido inválido.' })

  db.prepare(
    `INSERT INTO orders (id, user_id, date, status, total, items) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, req.userId, date, status || 'Processando', total, JSON.stringify(items || []))

  res.status(201).json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Brinca e Sente API rodando em http://localhost:${PORT}`)
})
