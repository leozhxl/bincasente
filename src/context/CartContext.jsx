import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { calcDiscount, getCouponRate, normalizeCoupon } from '../utils/coupons'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem('bes_cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem('bes_wishlist')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('bes_coupon') || ''
      return getCouponRate(saved) ? saved : ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    localStorage.setItem('bes_cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    try {
      if (coupon) localStorage.setItem('bes_coupon', coupon)
      else localStorage.removeItem('bes_coupon')
    } catch {
      // armazenamento indisponível, o cupom vale só nesta sessão
    }
  }, [coupon])

  useEffect(() => {
    localStorage.setItem('bes_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  function addItem(product, options = {}) {
    const { color = product.colorOptions?.[0] ?? 'Padrão', qty = 1 } = options
    setItems((prev) => {
      const key = `${product.id}-${color}`
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: product.image,
          benefits: product.benefits || [],
          color,
          qty,
        },
      ]
    })
  }

  function updateQty(key, qty) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)))
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function clearCart() {
    setItems([])
    setCoupon('')
  }

  // Retorna true se o cupom for válido e foi aplicado.
  function applyCoupon(code) {
    const normalized = normalizeCoupon(code)
    if (!getCouponRate(normalized)) return false
    setCoupon(normalized)
    return true
  }

  function removeCoupon() {
    setCoupon('')
  }

  function toggleWishlist(product) {
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    )
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
  const discount = useMemo(() => calcDiscount(subtotal, coupon), [subtotal, coupon])
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    coupon,
    couponRate: getCouponRate(coupon),
    discount,
    applyCoupon,
    removeCoupon,
    count,
    wishlist,
    toggleWishlist,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
