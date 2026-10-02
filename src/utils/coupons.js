// Cupons de desconto válidos. O percentual é aplicado sobre o subtotal dos
// produtos (o frete não recebe desconto). Usado no site e no servidor.
export const COUPONS = {
  MAIARA10: 0.25,
  NATALIA10: 0.25,
}

export function normalizeCoupon(code) {
  return String(code || '').trim().toUpperCase()
}

export function getCouponRate(code) {
  return COUPONS[normalizeCoupon(code)] || 0
}

export function calcDiscount(subtotal, code) {
  return Math.round(subtotal * getCouponRate(code) * 100) / 100
}
