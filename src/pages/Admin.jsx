import { useEffect, useState } from 'react'
import { adminApi, getAdminToken, setAdminToken } from './admin/adminApi'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Clientes from './admin/Clientes'
import Pedidos from './admin/Pedidos'
import Produtos from './admin/Produtos'
import Pipeline from './admin/Pipeline'
import Financeiro from './admin/Financeiro'
import './Admin.css'

export default function Admin() {
  const [token, setTokenState] = useState(getAdminToken())

  function handleLogin(newToken) {
    setAdminToken(newToken)
    setTokenState(newToken)
  }

  function handleLogout() {
    setAdminToken(null)
    setTokenState(null)
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />
  return <AdminDashboard onLogout={handleLogout} />
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminApi('/admin-login', { method: 'POST', body: { password } })
      onLogin(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>Painel de vendas</h1>
        <p className="admin-hint">Acesso restrito. Informe a senha de administrador.</p>
        <div className="field">
          <label htmlFor="admin-password">Senha</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

const emptyDre = { grossRevenue: 0, shippingRevenue: 0, tariff: 0, cost: 0, tax: 0, netProfit: 0 }
const emptyStats = { totalOrders: 0, totalRevenue: 0, revenueToday: 0, revenueWeek: 0, revenueMonth: 0, byStatus: {}, dre: emptyDre, revenueSeries: [] }

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(emptyStats)
  const [settings, setSettings] = useState(null)
  const [manualCustomers, setManualCustomers] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const [ordersData, customersData, dealsData] = await Promise.all([
        adminApi('/admin-orders'),
        adminApi('/admin-customers'),
        adminApi('/admin-deals'),
      ])
      setOrders(ordersData.orders)
      setStats(ordersData.stats)
      setSettings(ordersData.settings)
      setManualCustomers(customersData.customers)
      setDeals(dealsData.deals)
    } catch (err) {
      setError(err.message)
      if (err.message.toLowerCase().includes('autenticado')) onLogout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateOrder(id, changes) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...changes } : o)))
    try {
      await adminApi('/admin-orders', { method: 'PATCH', body: { id, ...changes } })
    } catch {
      loadAll()
    }
  }

  async function createOrder(order) {
    await adminApi('/orders', { method: 'POST', body: order })
    await loadAll()
  }

  async function saveSettings(newSettings) {
    const data = await adminApi('/admin-settings', { method: 'PUT', body: newSettings })
    setSettings(data.settings)
    loadAll()
  }

  async function createCustomer(customer) {
    await adminApi('/admin-customers', { method: 'POST', body: customer })
    await loadAll()
  }

  async function createDeal(deal) {
    await adminApi('/admin-deals', { method: 'POST', body: deal })
    await loadAll()
  }

  async function updateDeal(id, changes) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)))
    try {
      await adminApi('/admin-deals', { method: 'PATCH', body: { id, ...changes } })
    } catch {
      loadAll()
    }
  }

  const orderCustomers = buildCustomersFromOrders(orders)
  const mergedCustomers = mergeCustomers(orderCustomers, manualCustomers)

  return (
    <AdminLayout active={tab} onChangeTab={setTab} onLogout={onLogout}>
      {loading && orders.length === 0 && manualCustomers.length === 0 ? (
        <p className="crm-loading">Carregando...</p>
      ) : (
        <>
          {error && <p className="field-error">{error}</p>}
          {tab === 'dashboard' && (
            <Dashboard orders={orders} stats={stats} customers={mergedCustomers} deals={deals} />
          )}
          {tab === 'clientes' && (
            <Clientes customers={mergedCustomers} onCreateCustomer={createCustomer} />
          )}
          {tab === 'pedidos' && (
            <Pedidos orders={orders} onUpdateOrder={updateOrder} onCreateOrder={createOrder} />
          )}
          {tab === 'produtos' && <Produtos />}
          {tab === 'pipeline' && (
            <Pipeline deals={deals} onCreateDeal={createDeal} onUpdateDeal={updateDeal} />
          )}
          {tab === 'financeiro' && settings && (
            <Financeiro orders={orders} dre={stats.dre || emptyDre} settings={settings} onSaveSettings={saveSettings} />
          )}
        </>
      )}
    </AdminLayout>
  )
}

function buildCustomersFromOrders(orders) {
  const map = new Map()
  for (const o of orders) {
    const key = o.customerEmail || o.customerName || 'sem-identificacao'
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: o.customerName || 'Cliente não identificado',
        email: o.customerEmail,
        phone: o.customerPhone,
        address: o.customerAddress,
        status: 'cliente',
        orders: [],
        totalSpent: 0,
        createdAt: o.createdAt,
      })
    }
    const entry = map.get(key)
    entry.orders.push(o)
    entry.totalSpent += o.total
    if (o.createdAt > entry.createdAt) entry.createdAt = o.createdAt
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent)
}

function mergeCustomers(orderCustomers, manualCustomers) {
  const manualMapped = manualCustomers.map((c) => ({
    key: `manual-${c.id}`,
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    status: c.status,
    notes: c.notes,
    createdAt: c.createdAt,
  }))
  return [...manualMapped, ...orderCustomers]
}
