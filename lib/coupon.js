import { calcDiscount, getCouponRate, normalizeCoupon } from '../src/utils/coupons.js'

// Confere o cupom e o total enviados pelo site, para que ninguém consiga
// mandar um desconto maior do que o cupom permite.
export function validateCouponTotals({ coupon, subtotal, shipping, total }) {
  const code = normalizeCoupon(coupon)
  if (code && !getCouponRate(code)) return { error: 'Cupom de desconto inválido.' }

  const discount = code ? calcDiscount(Number(subtotal) || 0, code) : 0
  if (code) {
    const expected = Math.round(((Number(subtotal) || 0) - discount + (Number(shipping) || 0)) * 100) / 100
    if (Math.abs(expected - Number(total)) > 0.01) return { error: 'O total do pedido não confere com o cupom aplicado.' }
  }

  return { coupon: code, discount }
}
