import { getDb } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { getUserId, requireAuth } from '../lib/auth.js'

async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    const userId = requireAuth(req, res)
    if (!userId) return

    const userResult = await db.execute({ sql: 'SELECT email FROM users WHERE id = ?', args: [userId] })
    const email = userResult.rows[0]?.email || ''

    const result = await db.execute({
      sql: 'SELECT * FROM orders WHERE user_id = ? OR (user_id IS NULL AND customer_email = ?) ORDER BY created_at DESC',
      args: [userId, email],
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
    const { id, date, status, total, items, customer, paymentMethod, subtotal, shipping } = req.body || {}
    if (!id || total == null) return res.status(400).json({ error: 'Pedido inválido.' })

    const userId = getUserId(req)
    const address = customer?.entrega === 'retirada'
      ? 'Retirar no local'
      : customer
        ? [customer.endereco, customer.numero, customer.cidade, customer.estado].filter(Boolean).join(', ')
        : ''

    await db.execute({
      sql: `INSERT INTO orders (id, user_id, date, status, total, items, customer_name, customer_email, customer_phone, customer_address, payment_method, subtotal, shipping)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        userId || null,
        date,
        status || 'Processando',
        total,
        JSON.stringify(items || []),
        customer?.nome || '',
        customer?.email || '',
        customer?.telefone || '',
        address,
        paymentMethod || '',
        subtotal ?? total,
        shipping ?? 0,
      ],
    })
    return res.status(201).json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}

export default withErrorHandler(handler)
