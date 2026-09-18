import { getDb } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { comparePassword, hashPassword, signAdminToken, signToken, toPublicUser } from '../lib/auth.js'

async function handleLogin(req, res) {
  const { email, password } = req.body || {}
  const db = await getDb()

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email || ''] })
  const user = result.rows[0]

  if (!user || !comparePassword(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
  }

  const token = signToken(Number(user.id))
  res.json({ token, user: toPublicUser(user) })
}

async function handleRegister(req, res) {
  const { email, password, name, lastName, docType, cpf, rg } = req.body || {}

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' })
  }

  const db = await getDb()

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] })
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' })
  }

  const passwordHash = hashPassword(password)
  const insert = await db.execute({
    sql: `INSERT INTO users (email, password_hash, name, last_name, doc_type, cpf, rg)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [email, passwordHash, name || '', lastName || '', docType || 'Pessoa Física', cpf || '', rg || ''],
  })

  const fullName = [name, lastName].filter(Boolean).join(' ') || email.split('@')[0]
  const existingCustomer = await db.execute({ sql: 'SELECT id FROM crm_customers WHERE email = ?', args: [email] })
  if (existingCustomer.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO crm_customers (name, email, status) VALUES (?, ?, ?)',
      args: [fullName, email, 'ativo'],
    })
  }

  const created = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [insert.lastInsertRowid],
  })
  const user = created.rows[0]
  const token = signToken(Number(user.id))
  res.status(201).json({ token, user: toPublicUser(user) })
}

async function handleAdminLogin(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor.' })
  }

  const { password } = req.body || {}
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }

  const token = signAdminToken()
  res.json({ token })
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const action = req.query?.action
  if (action === 'login') return handleLogin(req, res)
  if (action === 'register') return handleRegister(req, res)
  if (action === 'admin-login') return handleAdminLogin(req, res)
  return res.status(400).json({ error: 'Ação inválida.' })
}

export default withErrorHandler(handler)
