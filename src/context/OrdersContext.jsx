import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from './AuthContext'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!user) {
      setOrders([])
      return
    }
    api('/orders')
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
  }, [user])

  async function addOrder(order) {
    await api('/orders', { method: 'POST', body: order })
    setOrders((prev) => [order, ...prev])
  }

  return <OrdersContext.Provider value={{ orders, addOrder }}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders deve ser usado dentro de OrdersProvider')
  return ctx
}
