import { getDb } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { requireAdmin } from '../lib/auth.js'

async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  const db = await getDb()

  if (req.method === 'GET') {
    const result = await db.execute('SELECT * FROM deals ORDER BY created_at DESC')
    return res.json({
      deals: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        customerName: r.customer_name,
        value: r.value,
        stage: r.stage,
        notes: r.notes,
        createdAt: r.created_at,
      })),
    })
  }

  if (req.method === 'POST') {
    const { title, customerName, value, stage, notes } = req.body || {}
    if (!title?.trim()) return res.status(400).json({ error: 'Título é obrigatório.' })

    const result = await db.execute({
      sql: `INSERT INTO deals (title, customer_name, value, stage, notes) VALUES (?, ?, ?, ?, ?)`,
      args: [title.trim(), customerName || '', Number(value) || 0, stage || 'Novo', notes || ''],
    })
    return res.status(201).json({ id: Number(result.lastInsertRowid) })
  }

  if (req.method === 'PATCH') {
    const { id, stage, value, notes } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Id é obrigatório.' })
    if (stage != null) await db.execute({ sql: 'UPDATE deals SET stage = ? WHERE id = ?', args: [stage, id] })
    if (value != null) await db.execute({ sql: 'UPDATE deals SET value = ? WHERE id = ?', args: [Number(value) || 0, id] })
    if (notes != null) await db.execute({ sql: 'UPDATE deals SET notes = ? WHERE id = ?', args: [notes, id] })
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Id é obrigatório.' })
    await db.execute({ sql: 'DELETE FROM deals WHERE id = ?', args: [id] })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}

export default withErrorHandler(handler)
