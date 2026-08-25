import { formatMoney, formatPct } from './adminApi'

const coreStatuses = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado']

export default function Dashboard({ orders, stats, customers, deals }) {
  const activeDeals = deals.filter((d) => d.stage !== 'Ganho' && d.stage !== 'Perdido')
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)

  const byStatus = stats.byStatus || {}
  const extraStatuses = Object.keys(byStatus).filter((s) => !coreStatuses.includes(s))
  const statusRows = [...coreStatuses, ...extraStatuses]
  const maxStatusCount = Math.max(1, ...statusRows.map((s) => byStatus[s] || 0))

  const series = stats.revenueSeries || []
  const maxRevenue = Math.max(1, ...series.map((p) => p.total))

  const recentOrders = orders.slice(0, 5)
  const recentCustomers = [...customers]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5)

  return (
    <div className="crm-dashboard">
      <section className="crm-cards">
        <StatCard icon="$" iconClass="blue" label="Receita Total" value={formatMoney(stats.totalRevenue)} pct={stats.revenueChangePct} />
        <StatCard icon="🛒" iconClass="green" label="Total de Pedidos" value={String(stats.totalOrders || 0)} pct={stats.ordersChangePct} />
        <StatCard icon="◑" iconClass="purple" label="Clientes" value={String(customers.length)} pct={null} />
        <StatCard icon="↗" iconClass="amber" label="Pipeline Ativo" value={formatMoney(pipelineValue)} pct={null} />
      </section>

      <section className="crm-grid-2">
        <div className="crm-panel">
          <h2>Receita (14 dias)</h2>
          <p className="crm-panel-sub">Faturamento diário de pedidos</p>
          {series.every((p) => p.total === 0) ? (
            <div className="crm-empty">Sem dados de receita ainda</div>
          ) : (
            <div className="crm-chart">
              {series.map((p) => (
                <div className="crm-chart-col" key={p.date}>
                  <div className="crm-chart-bar" style={{ height: `${Math.max(2, (p.total / maxRevenue) * 100)}%` }} title={formatMoney(p.total)} />
                  <span>{p.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="crm-panel">
          <h2>Pedidos por Status</h2>
          <ul className="crm-status-list">
            {statusRows.map((status) => (
              <li key={status}>
                <div className="crm-status-row">
                  <span>{status}</span>
                  <strong>{byStatus[status] || 0}</strong>
                </div>
                <div className="crm-status-bar">
                  <div style={{ width: `${((byStatus[status] || 0) / maxStatusCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="crm-grid-2">
        <div className="crm-panel">
          <h2>Pedidos Recentes</h2>
          {recentOrders.length === 0 ? (
            <div className="crm-empty">Nenhum pedido ainda</div>
          ) : (
            <ul className="crm-mini-list">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <span>#{o.id} · {o.customerName || 'Cliente não identificado'}</span>
                  <strong>{formatMoney(o.total)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="crm-panel">
          <h2>Negócios em Aberto</h2>
          {activeDeals.length === 0 ? (
            <div className="crm-empty">Nenhum negócio no pipeline</div>
          ) : (
            <ul className="crm-mini-list">
              {activeDeals.slice(0, 5).map((d) => (
                <li key={d.id}>
                  <span>{d.title} · {d.stage}</span>
                  <strong>{formatMoney(d.value)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="crm-panel">
        <h2>Novos Clientes</h2>
        {recentCustomers.length === 0 ? (
          <div className="crm-empty">Nenhum cliente cadastrado</div>
        ) : (
          <ul className="crm-mini-list">
            {recentCustomers.map((c) => (
              <li key={c.key || c.id}>
                <span>{c.name}</span>
                <span className="crm-mini-sub">{c.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon, iconClass, label, value, pct }) {
  const pctLabel = formatPct(pct)
  const positive = pct != null && pct >= 0
  return (
    <div className="crm-card">
      <div className="crm-card-top">
        <span className={`crm-card-icon ${iconClass}`}>{icon}</span>
        {pctLabel && <span className={`crm-card-pct ${positive ? 'up' : 'down'}`}>{positive ? '↗' : '↘'} {pctLabel}</span>}
      </div>
      <strong className="crm-card-value">{value}</strong>
      <span className="crm-card-label">{label}</span>
    </div>
  )
}
