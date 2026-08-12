import { getDb } from '../lib/db.js'
import { requireAuth } from '../lib/auth.js'

export default async function handler(req, res) {
  const userId = requireAuth(req, res)
  if (!userId) return

  const db = await getDb()

  if (req.method === 'GET') {
    const result = await db.execute({
      sql: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId],
    })
    return res.json({
      orders: result.rows.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        total: r.total,
        items: JSON.parse(r.items),
      })),
    })
  }

  if (req.method === 'POST') {
    const { id, date, status, total, items } = req.body || {}
    if (!id || total == null) return res.status(400).json({ error: 'Pedido inválido.' })

    await db.execute({
      sql: `INSERT INTO orders (id, user_id, date, status, total, items) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, userId, date, status || 'Processando', total, JSON.stringify(items || [])],
    })
    return res.status(201).json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}
