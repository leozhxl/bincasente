import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

  useEffect(() => {
    localStorage.setItem('bes_cart', JSON.stringify(items))
  }, [items])

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
  }

  function toggleWishlist(product) {
    setWishlist((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    )
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
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
