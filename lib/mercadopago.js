const MP_API = 'https://api.mercadopago.com'

function getToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado.')
  return token
}

export async function createPixPayment({ orderId, amount, description, payer, notificationUrl }) {
  const res = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      'X-Idempotency-Key': orderId,
    },
    body: JSON.stringify({
      transaction_amount: Number(amount.toFixed(2)),
      description,
      payment_method_id: 'pix',
      external_reference: orderId,
      notification_url: notificationUrl,
      payer,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || 'Não foi possível criar o pagamento Pix no Mercado Pago.')
  }
  return data
}

export async function getPayment(paymentId) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || 'Não foi possível consultar o pagamento no Mercado Pago.')
  }
  return data
}

export function mapMpStatusToOrderStatus(mpStatus) {
  if (mpStatus === 'approved') return 'Pago'
  if (mpStatus === 'rejected' || mpStatus === 'cancelled') return 'Cancelado'
  return 'Aguardando pagamento'
}
