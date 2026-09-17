import { useEffect, useMemo, useState } from 'react'
import { formatMoney } from './adminApi'

const statusOptions = ['Aguardando pagamento', 'Pendente', 'Aguardando link de pagamento', 'Processando', 'Enviado', 'Entregue', 'Cancelado']

export default function Pedidos({ orders, onUpdateOrder, onCreateOrder }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'todos' && o.status !== statusFilter) return false
      if (!term) return true
      return (
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term)
      )
    })
  }, [orders, search, statusFilter])

  function exportCsv() {
    const header = ['Pedido', 'Data', 'Status', 'Total', 'Cliente', 'E-mail', 'Telefone', 'Endereço', 'Pagamento', 'Itens']
    const rows = filtered.map((o) => [
      o.id, o.date, o.status, o.total.toFixed(2), o.customerName, o.customerEmail,
      o.customerPhone, o.customerAddress, o.paymentMethod,
      o.items.map((i) => `${i.qty}x ${i.name}`).join(' | '),
    ])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="crm-page">
      <div className="crm-page-head">
        <div>
          <h2>Pedidos</h2>
          <p>{orders.length} pedido{orders.length === 1 ? '' : 's'} registrado{orders.length === 1 ? '' : 's'}</p>
        </div>
        <div className="crm-page-head-actions">
          <button type="button" className="btn btn-outline" onClick={exportCsv}>Exportar CSV</button>
          <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>+ Novo Pedido</button>
        </div>
      </div>

      <div className="crm-toolbar">
        <div className="crm-search-wrap">
          <span className="crm-search-icon" aria-hidden="true">⌕</span>
          <input type="text" placeholder="Buscar por número ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos os status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="crm-panel crm-list-panel">
        {filtered.length === 0 ? (
          <div className="crm-empty-block">
            <span className="crm-empty-icon" aria-hidden="true">🛒</span>
            <strong>Nenhum pedido encontrado</strong>
            <p>Crie um novo pedido para começar.</p>
          </div>
        ) : (
          <div className="admin-orders">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={onUpdateOrder} />
            ))}
          </div>
        )}
      </div>

      {showForm && <NovoPedidoModal onClose={() => setShowForm(false)} onCreate={onCreateOrder} />}
    </div>
  )
}

export function OrderCard({ order, onUpdate }) {
  const [notes, setNotes] = useState(order.notes || '')

  useEffect(() => {
    setNotes(order.notes || '')
  }, [order.notes])

  return (
    <article className="admin-order-card">
      <div className="admin-order-top">
        <div>
          <strong>#{order.id}</strong>
          <span className="admin-order-date"> · {order.date}</span>
        </div>
        <strong>{formatMoney(order.total)}</strong>
      </div>

      <div className="admin-order-customer">
        <span>{order.customerName || 'Cliente não identificado'}</span>
        {order.customerEmail && <span>{order.customerEmail}</span>}
        {order.customerPhone && <span>{order.customerPhone}</span>}
        {order.customerAddress && <span>{order.customerAddress}</span>}
      </div>

      <ul className="admin-order-items">
        {order.items.map((item, idx) => (
          <li key={idx}>{item.qty}× {item.name} — {formatMoney(item.price * item.qty)}</li>
        ))}
      </ul>

      <div className="field admin-order-notes">
        <label htmlFor={`notes-${order.id}`}>Notas internas</label>
        <textarea
          id={`notes-${order.id}`}
          rows={2}
          value={notes}
          placeholder="Ex: cliente pediu para entregar após as 18h..."
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (order.notes || '')) onUpdate(order.id, { notes })
          }}
        />
      </div>

      <div className="admin-order-bottom">
        <span className="admin-order-payment">{order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cartao' ? 'Cartão' : order.paymentMethod || '—'}</span>
        <select value={order.status} onChange={(e) => onUpdate(order.id, { status: e.target.value })}>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {order.status !== 'Cancelado' && (
          <button
            type="button"
            className="btn btn-outline btn-danger"
            onClick={() => {
              if (window.confirm(`Cancelar o pedido #${order.id}? Essa ação marcará o pedido como cancelado.`)) {
                onUpdate(order.id, { status: 'Cancelado' })
              }
            }}
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </article>
  )
}

function NovoPedidoModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', itemNome: '', itemQtd: 1, itemPreco: '', pagamento: 'pix' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const preco = Number(form.itemPreco)
    const qtd = Number(form.itemQtd) || 1
    if (!form.nome.trim() || !form.itemNome.trim() || !preco) {
      setError('Preencha nome do cliente, item e preço.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const total = round2(preco * qtd)
      await onCreate({
        id: `BS-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'Processando',
        total,
        subtotal: total,
        shipping: 0,
        items: [{ name: form.itemNome, qty: qtd, price: preco }],
        customer: { nome: form.nome, email: form.email, telefone: form.telefone },
        paymentMethod: form.pagamento,
      })
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
        <div className="crm-modal-body">
          <h2>Novo pedido</h2>
          <div className="field">
            <label htmlFor="p-nome">Nome do cliente</label>
            <input id="p-nome" type="text" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} autoFocus />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="p-email">E-mail</label>
              <input id="p-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="p-telefone">Telefone</label>
              <input id="p-telefone" type="tel" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-item">Item</label>
            <input id="p-item" type="text" value={form.itemNome} onChange={(e) => setForm((f) => ({ ...f, itemNome: e.target.value }))} placeholder="Ex: Ovo de dragão" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="p-qtd">Quantidade</label>
              <input id="p-qtd" type="number" min="1" value={form.itemQtd} onChange={(e) => setForm((f) => ({ ...f, itemQtd: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="p-preco">Preço unitário (R$)</label>
              <input id="p-preco" type="number" step="0.01" min="0" value={form.itemPreco} onChange={(e) => setForm((f) => ({ ...f, itemPreco: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="p-pagamento">Pagamento</label>
            <select id="p-pagamento" value={form.pagamento} onChange={(e) => setForm((f) => ({ ...f, pagamento: e.target.value }))}>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>
          {error && <p className="field-error">{error}</p>}
        </div>
        <div className="crm-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Salvando...' : 'Criar pedido'}</button>
        </div>
      </form>
    </div>
  )
}

function round2(n) {
  return Math.round(n * 100) / 100
}
