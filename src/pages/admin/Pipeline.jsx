import { useState } from 'react'
import { formatMoney } from './adminApi'

const stages = ['Novo', 'Contato', 'Proposta', 'Negociação', 'Ganho', 'Perdido']

export default function Pipeline({ deals, onCreateDeal, onUpdateDeal }) {
  const [showForm, setShowForm] = useState(false)
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="crm-page">
      <div className="crm-page-head">
        <div>
          <h2>Pipeline</h2>
          <p>{deals.length} negócio{deals.length === 1 ? '' : 's'} · {formatMoney(totalValue)} no total</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => setShowForm(true)}>+ Novo Negócio</button>
      </div>

      {deals.length === 0 ? (
        <div className="crm-panel crm-list-panel">
          <div className="crm-empty-block">
            <span className="crm-empty-icon" aria-hidden="true">▤</span>
            <strong>Nenhum negócio no pipeline</strong>
            <p>Crie um novo negócio para começar a acompanhar suas vendas em andamento.</p>
          </div>
        </div>
      ) : (
        <div className="crm-kanban">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage)
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
            return (
              <div className="crm-kanban-col" key={stage}>
                <div className="crm-kanban-head">
                  <strong>{stage}</strong>
                  <span>{stageDeals.length} · {formatMoney(stageValue)}</span>
                </div>
                <div className="crm-kanban-cards">
                  {stageDeals.map((deal) => (
                    <div className="crm-deal-card" key={deal.id}>
                      <strong>{deal.title}</strong>
                      {deal.customerName && <span>{deal.customerName}</span>}
                      <span className="crm-deal-value">{formatMoney(deal.value)}</span>
                      <select value={deal.stage} onChange={(e) => onUpdateDeal(deal.id, { stage: e.target.value })}>
                        {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <NovoNegocioModal onClose={() => setShowForm(false)} onCreate={onCreateDeal} />}
    </div>
  )
}

function NovoNegocioModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', customerName: '', value: '', stage: 'Novo' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Informe o título do negócio.')
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
        <h2>Novo negócio</h2>
        <div className="field">
          <label htmlFor="d-title">Título</label>
          <input id="d-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Pedido corporativo - clínica X" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="d-customer">Cliente</label>
          <input id="d-customer" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="d-value">Valor estimado (R$)</label>
            <input id="d-value" type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="d-stage">Etapa</label>
            <select id="d-stage" value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}>
              {stages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="crm-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Salvando...' : 'Criar negócio'}</button>
        </div>
      </form>
    </div>
  )
}
