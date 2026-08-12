import { getDb } from '../lib/db.js'
import { hashPassword, signToken, toPublicUser } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

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

  const created = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [insert.lastInsertRowid],
  })
  const user = created.rows[0]
  const token = signToken(Number(user.id))
  res.status(201).json({ token, user: toPublicUser(user) })
}
