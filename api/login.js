import { getDb } from '../lib/db.js'
import { comparePassword, signToken, toPublicUser } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

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
