import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'brinca-e-sente-dev-secret-change-in-production'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

export function toPublicUser(row) {
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

export function getUserId(req) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return payload.userId
  } catch {
    return null
  }
}

export function requireAuth(req, res) {
  const userId = getUserId(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return null
  }
  return userId
}
