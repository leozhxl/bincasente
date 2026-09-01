import { getDb, getFinanceSettings } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { requireAdmin } from '../lib/auth.js'

function feeRateFor(paymentMethod, settings) {
  if (paymentMethod === 'pix') return settings.pixFeeRate
  if (paymentMethod === 'cartao') return settings.cardFeeRate
  return 0
}

function computeFinance(order, settings) {
  const subtotal = order.subtotal || order.total
  const shipping = order.shipping || 0
  const feeRate = feeRateFor(order.paymentMethod, settings)

  const tariff = round2((subtotal * feeRate) / 100)
  const cost = round2((subtotal * settings.costRate) / 100)
  const tax = round2((subtotal * settings.taxRate) / 100)
  const netProfit = round2(subtotal - tariff - cost - tax)

  return { subtotal, shipping, tariff, cost, tax, netProfit }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  const db = await getDb()

  if (req.method === 'GET') {
    const [result, settings] = await Promise.all([
      db.execute('SELECT * FROM orders ORDER BY created_at DESC'),
      getFinanceSettings(),
    ])

    const orders = result.rows.map((r) => {
      const base = {
        id: r.id,
        date: r.date,
        status: r.status,
        total: r.total,
        subtotal: r.subtotal || r.total,
        shipping: r.shipping || 0,
        items: JSON.parse(r.items),
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone,
        customerAddress: r.customer_address,
        paymentMethod: r.payment_method,
        notes: r.notes,
        createdAt: r.created_at,
      }
      return { ...base, finance: computeFinance(base, settings) }
    })

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    function createdOf(o) {
      return new Date(o.createdAt.replace(' ', 'T') + 'Z')
    }

    function revenueSince(since) {
      return orders.reduce((sum, o) => (createdOf(o) >= since ? sum + o.total : sum), 0)
    }

    function ordersBetween(since, until) {
      return orders.filter((o) => {
        const created = createdOf(o)
        return created >= since && (!until || created < until)
      })
    }

    const thisMonthOrders = ordersBetween(startOfMonth)
    const prevMonthOrders = ordersBetween(startOfPrevMonth, startOfMonth)
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0)
    const prevMonthRevenue = prevMonthOrders.reduce((s, o) => s + o.total, 0)

    function pctChange(current, previous) {
      if (!previous) return null
      return round2(((current - previous) / previous) * 100)
    }

    const revenueSeries = []
    for (let i = 13; i >= 0; i--) {
      const day = new Date(startOfDay)
      day.setDate(startOfDay.getDate() - i)
      const nextDay = new Date(day)
      nextDay.setDate(day.getDate() + 1)
      const total = ordersBetween(day, nextDay).reduce((s, o) => s + o.total, 0)
      revenueSeries.push({ date: `${String(day.getDate()).padStart(2, '0')}/${day.getMonth() + 1}`, total: round2(total) })
    }

    const dre = orders.reduce(
      (acc, o) => {
        acc.grossRevenue += o.subtotal
        acc.shippingRevenue += o.shipping
        acc.tariff += o.finance.tariff
        acc.cost += o.finance.cost
        acc.tax += o.finance.tax
        acc.netProfit += o.finance.netProfit
        return acc
      },
      { grossRevenue: 0, shippingRevenue: 0, tariff: 0, cost: 0, tax: 0, netProfit: 0 }
    )
    Object.keys(dre).forEach((k) => (dre[k] = round2(dre[k])))

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      revenueToday: revenueSince(startOfDay),
      revenueWeek: revenueSince(startOfWeek),
      revenueMonth: revenueSince(startOfMonth),
      byStatus: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
      }, {}),
      dre,
      revenueSeries,
      revenueChangePct: pctChange(thisMonthRevenue, prevMonthRevenue),
      ordersChangePct: pctChange(thisMonthOrders.length, prevMonthOrders.length),
    }

    return res.json({ orders, stats, settings })
  }

  if (req.method === 'PATCH') {
    const { id, status, notes } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Dados inválidos.' })
    if (status == null && notes == null) return res.status(400).json({ error: 'Nada para atualizar.' })

    if (status != null) {
      await db.execute({ sql: 'UPDATE orders SET status = ? WHERE id = ?', args: [status, id] })
    }
    if (notes != null) {
      await db.execute({ sql: 'UPDATE orders SET notes = ? WHERE id = ?', args: [notes, id] })
    }
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Método não permitido.' })
}

export default withErrorHandler(handler)
