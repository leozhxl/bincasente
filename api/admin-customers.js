import { getDb } from '../lib/db.js'
import { requireAdmin } from '../lib/auth.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  const db = await getDb()

  if (req.method === 'GET') {
    const result = await db.execute('SELECT * FROM crm_customers ORDER BY created_at DESC')
    return res.json({
      customers: result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        company: r.company,
        status: r.status,
        notes: r.notes,
        createdAt: r.created_at,
      })),
    })
  }

  if (req.method === 'POST') {
    const { name, email, phone, company, status, notes } = req.body || {}
    if (!name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório.' })

    const result = await db.execute({
      sql: `INSERT INTO crm_customers (name, email, phone, company, status, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [name.trim(), email || '', phone || '', company || '', status || 'lead', notes || ''],
    })
    return res.status(201).json({ id: Number(result.lastInsertRowid) })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Id é obrigatório.' })
    await db.execute({ sql: 'DELETE FROM crm_customers WHERE id = ?', args: [id] })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}
