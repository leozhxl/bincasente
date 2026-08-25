import { useEffect, useState } from 'react'
import { formatMoney } from './adminApi'

export default function Financeiro({ orders, dre, settings, onSaveSettings }) {
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await onSaveSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const sortedOrders = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <div className="crm-page admin-finance">
      <section className="admin-dre card">
        <h2>Resumo financeiro (DRE)</h2>
        <p className="field-hint">
          Estimativa com base nas taxas configuradas abaixo. Aplicado sobre o valor dos produtos (sem frete).
        </p>
        <dl className="admin-dre-list">
          <div><dt>Receita bruta (produtos)</dt><dd>{formatMoney(dre.grossRevenue)}</dd></div>
          <div><dt>Frete cobrado dos clientes</dt><dd>{formatMoney(dre.shippingRevenue)}</dd></div>
          <div className="admin-dre-negative"><dt>(–) Tarifas de pagamento</dt><dd>-{formatMoney(dre.tariff)}</dd></div>
          <div className="admin-dre-negative"><dt>(–) Custo dos produtos</dt><dd>-{formatMoney(dre.cost)}</dd></div>
          <div className="admin-dre-negative"><dt>(–) Impostos</dt><dd>-{formatMoney(dre.tax)}</dd></div>
          <div className="admin-dre-total"><dt>(=) Lucro líquido</dt><dd>{formatMoney(dre.netProfit)}</dd></div>
        </dl>
      </section>

      <form className="admin-settings card" onSubmit={handleSave}>
        <h2>Taxas usadas no cálculo</h2>
        <p className="field-hint">Ajuste conforme a realidade do seu negócio. Isso recalcula o resumo acima e o lucro de cada pedido.</p>
        <div className="admin-settings-grid">
          <div className="field">
            <label htmlFor="costRate">Custo do produto (% do preço)</label>
            <input id="costRate" type="number" step="0.1" min="0" max="100" value={form.costRate} onChange={(e) => setForm((f) => ({ ...f, costRate: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="taxRate">Imposto (% da receita)</label>
            <input id="taxRate" type="number" step="0.1" min="0" max="100" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="pixFeeRate">Tarifa Pix (%)</label>
            <input id="pixFeeRate" type="number" step="0.01" min="0" max="100" value={form.pixFeeRate} onChange={(e) => setForm((f) => ({ ...f, pixFeeRate: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="cardFeeRate">Tarifa cartão (%)</label>
            <input id="cardFeeRate" type="number" step="0.01" min="0" max="100" value={form.cardFeeRate} onChange={(e) => setForm((f) => ({ ...f, cardFeeRate: e.target.value }))} />
          </div>
        </div>
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? 'Salvando...' : saved ? 'Salvo ✔' : 'Salvar taxas'}
        </button>
      </form>

      <section className="admin-finance-table-wrap">
        <h2>Lucro por venda</h2>
        <div className="admin-finance-table-scroll">
          <table className="admin-finance-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Receita</th>
                <th>Frete</th>
                <th>Tarifa</th>
                <th>Custo</th>
                <th>Imposto</th>
                <th>Lucro líquido</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.date}</td>
                  <td>{formatMoney(o.finance.subtotal)}</td>
                  <td>{formatMoney(o.finance.shipping)}</td>
                  <td>-{formatMoney(o.finance.tariff)}</td>
                  <td>-{formatMoney(o.finance.cost)}</td>
                  <td>-{formatMoney(o.finance.tax)}</td>
                  <td className={o.finance.netProfit >= 0 ? 'admin-profit-positive' : 'admin-profit-negative'}>
                    {formatMoney(o.finance.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedOrders.length === 0 && <p>Nenhum pedido ainda.</p>}
      </section>
    </div>
  )
}
