import { getDb } from '../lib/db.js'
import { requireAuth, toPublicUser } from '../lib/auth.js'

export default async function handler(req, res) {
  const userId = requireAuth(req, res)
  if (!userId) return

  const db = await getDb()

  if (req.method === 'GET') {
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })
    return res.json({ user: toPublicUser(user) })
  }

  if (req.method === 'PUT') {
    const { name, lastName, docType, cpf, rg } = req.body || {}
    await db.execute({
      sql: `UPDATE users SET name = ?, last_name = ?, doc_type = ?, cpf = ?, rg = ? WHERE id = ?`,
      args: [name || '', lastName || '', docType || 'Pessoa Física', cpf || '', rg || '', userId],
    })
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
    return res.json({ user: toPublicUser(result.rows[0]) })
  }

  if (req.method === 'DELETE') {
    await db.execute({ sql: 'DELETE FROM orders WHERE user_id = ?', args: [userId] })
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] })
    return res.status(204).end()
  }

  res.status(405).json({ error: 'Método não permitido.' })
}
