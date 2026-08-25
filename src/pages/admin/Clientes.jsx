import { useMemo, useState } from 'react'
import { formatMoney } from './adminApi'

const statusLabels = { lead: 'Lead', ativo: 'Ativo', inativo: 'Inativo', cliente: 'Cliente' }

export default function Clientes({ customers, onCreateCustomer }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (statusFilter !== 'todos' && (c.status || 'cliente') !== statusFilter) return false
      if (!term) return true
      return (
        c.name.toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.company || '').toLowerCase().includes(term)
      )
    })
  }, [customers, search, statusFilter])

  if (selected) {
    return <ClienteDetail customer={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="crm-page">
      <div className="crm-page-head">
        <div>
          <h2>Clientes</h2>
          <p>{customers.length} cliente{customers.length === 1 ? '' : 's'} cadastrado{customers.length === 1 ? '' : 's'}</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>+ Novo Cliente</button>
      </div>

      <div className="crm-toolbar">
        <div className="crm-search-wrap">
          <span className="crm-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="lead">Lead</option>
          <option value="ativo">Ativo</option>
          <option value="cliente">Cliente</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="crm-panel crm-list-panel">
        {filtered.length === 0 ? (
          <div className="crm-empty-block">
            <span className="crm-empty-icon" aria-hidden="true">⌕</span>
            <strong>Nenhum cliente encontrado</strong>
            <p>Tente ajustar a busca ou cadastre um novo cliente.</p>
          </div>
        ) : (
          <ul className="crm-entity-list">
            {filtered.map((c) => (
              <li key={c.key || c.id} onClick={() => setSelected(c)}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.email}{c.phone ? ` · ${c.phone}` : ''}</span>
                </div>
                <div className="crm-entity-side">
                  {c.orders && <span>{c.orders.length} pedido{c.orders.length === 1 ? '' : 's'}</span>}
                  <span className={`crm-badge crm-badge-${c.status || 'cliente'}`}>{statusLabels[c.status || 'cliente']}</span>
                  {c.totalSpent != null && <strong>{formatMoney(c.totalSpent)}</strong>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && <NovoClienteModal onClose={() => setShowForm(false)} onCreate={onCreateCustomer} />}
    </div>
  )
}

function ClienteDetail({ customer, onBack }) {
  return (
    <div className="crm-page">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Voltar para clientes</button>
      <div className="crm-panel">
        <h2>{customer.name}</h2>
        <p>{customer.email} {customer.phone && `· ${customer.phone}`}</p>
        {customer.company && <p>{customer.company}</p>}
        {customer.address && <p>{customer.address}</p>}
        {customer.notes && <p className="field-hint">{customer.notes}</p>}
        {customer.orders && (
          <div className="crm-customer-orders">
            <h3>Pedidos ({customer.orders.length})</h3>
            <ul className="crm-mini-list">
              {customer.orders.map((o) => (
                <li key={o.id}>
                  <span>#{o.id} · {o.date}</span>
                  <strong>{formatMoney(o.total)}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function NovoClienteModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'lead' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Informe o nome do cliente.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onCreate(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <form className="crm-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Novo cliente</h2>
        <div className="field">
          <label htmlFor="c-name">Nome</label>
          <input id="c-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="c-email">E-mail</label>
          <input id="c-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="c-phone">Telefone</label>
            <input id="c-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="c-company">Empresa</label>
            <input id="c-company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="c-status">Status</label>
          <select id="c-status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="lead">Lead</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="crm-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
        </div>
      </form>
    </div>
  )
}
