import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { products as fallbackProducts, categories, conditions } from '../data/products'

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (Array.isArray(data?.products) && data.products.length) {
        setProducts(data.products)
      }
    } catch {
      // mantém o catálogo padrão caso a API esteja indisponível
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <ProductsContext.Provider value={{ products, categories, conditions, loading, refetch }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts deve ser usado dentro de ProductsProvider')
  return ctx
}
