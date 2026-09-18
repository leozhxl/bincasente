import { getDb } from '../lib/db.js'
import { withErrorHandler } from '../lib/withErrorHandler.js'
import { requireAuth } from '../lib/auth.js'
import { createPixPayment, mapMpStatusToOrderStatus } from '../lib/mercadopago.js'

const SITE_URL = process.env.SITE_URL || 'https://brincaesente.com'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const userId = requireAuth(req, res)
  if (!userId) return

  const { id, date, total, items, customer, subtotal, shipping } = req.body || {}
  if (!id || total == null) return res.status(400).json({ error: 'Pedido inválido.' })

  const [firstName, ...rest] = (customer?.nome || 'Cliente').trim().split(' ')

  let payment
  try {
    payment = await createPixPayment({
      orderId: id,
      amount: total,
      description: `Pedido ${id} - Brinca e Sente`,
      notificationUrl: `${SITE_URL}/api/mercadopago-webhook`,
      payer: {
        email: customer?.email || undefined,
        first_name: firstName || 'Cliente',
        last_name: rest.join(' ') || '-',
      },
    })
  } catch (err) {
    return res.status(502).json({ error: err.message || 'Não foi possível gerar o Pix.' })
  }

  const qrData = payment.point_of_interaction?.transaction_data
  if (!qrData?.qr_code) {
    return res.status(502).json({ error: 'Mercado Pago não retornou o QR Code do Pix.' })
  }

  const status = mapMpStatusToOrderStatus(payment.status)
  const address = customer?.entrega === 'retirada'
    ? 'Retirar no local'
    : customer
      ? [customer.endereco, customer.numero, customer.cidade, customer.estado].filter(Boolean).join(', ')
      : ''

  const db = await getDb()
  await db.execute({
    sql: `INSERT INTO orders (id, user_id, date, status, total, items, customer_name, customer_email, customer_phone, customer_address, payment_method, subtotal, shipping, mp_payment_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pix', ?, ?, ?)`,
    args: [
      id,
      userId,
      date,
      status,
      total,
      JSON.stringify(items || []),
      customer?.nome || '',
      customer?.email || '',
      customer?.telefone || '',
      address,
      subtotal ?? total,
      shipping ?? 0,
      String(payment.id),
    ],
  })

  return res.status(201).json({
    ok: true,
    status,
    qrCode: qrData.qr_code,
    qrCodeBase64: qrData.qr_code_base64,
  })
}

export default withErrorHandler(handler)
