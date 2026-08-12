const PIX_KEY = '+5548992011374'
const MERCHANT_NAME = 'JOSIANE VARGAS DELFINO'
const MERCHANT_CITY = 'SOMBRIO'

function tlv(id, value) {
  const length = String(value.length).padStart(2, '0')
  return `${id}${length}${value}`
}

function crc16(payload) {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function sanitize(text, maxLength) {
  return text
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLength)
}

export function orderToTxid(orderNumber) {
  return orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || 'PEDIDO'
}

export function buildPixPayload({ amount, txid }) {
  const merchantAccountInfo =
    tlv('00', 'br.gov.bcb.pix') +
    tlv('01', PIX_KEY)

  const additionalData = tlv('05', sanitize(txid, 25) || '***')

  const payloadWithoutCrc =
    tlv('00', '01') +
    tlv('01', '11') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', amount.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', sanitize(MERCHANT_NAME, 25)) +
    tlv('60', sanitize(MERCHANT_CITY, 15)) +
    tlv('62', additionalData) +
    '6304'

  return payloadWithoutCrc + crc16(payloadWithoutCrc)
}
