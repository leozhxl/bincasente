import { getDb } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { getPayment, mapMpStatusToOrderStatus } from '../lib/mercadopago.js'

async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const paymentId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id
  const type = req.body?.type || req.query?.type || req.query?.topic

  // Mercado Pago também manda notificações de outros tópicos (merchant_order, etc);
  // só nos interessa payment, e sempre respondemos 200 pra ele parar de reenviar.
  if (type !== 'payment' || !paymentId) {
    return res.status(200).json({ ok: true, ignored: true })
  }

  const payment = await getPayment(paymentId)
  const orderId = payment.external_reference
  if (!orderId) return res.status(200).json({ ok: true, ignored: true })

  const status = mapMpStatusToOrderStatus(payment.status)
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE orders SET status = ? WHERE id = ? AND mp_payment_id = ?',
    args: [status, orderId, String(payment.id)],
  })

  return res.status(200).json({ ok: true })
}

export default withErrorHandler(handler)
