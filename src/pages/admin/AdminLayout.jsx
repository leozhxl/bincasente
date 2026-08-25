const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦' },
  { key: 'clientes', label: 'Clientes', icon: '◑' },
  { key: 'pedidos', label: 'Pedidos', icon: '🛒' },
  { key: 'produtos', label: 'Produtos', icon: '◧' },
  { key: 'pipeline', label: 'Pipeline', icon: '▤' },
  { key: 'financeiro', label: 'Financeiro', icon: '$' },
]

const pageTitles = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  pedidos: 'Pedidos',
  produtos: 'Produtos',
  pipeline: 'Pipeline',
  financeiro: 'Financeiro',
}

export default function AdminLayout({ active, onChangeTab, onLogout, children }) {
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div className="crm-brand">
          <img src="/logo.png" alt="Brinca e Sente" className="crm-brand-logo" />
          <div>
            <strong>Brinca e Sente</strong>
            <span>Painel de Gestão</span>
          </div>
        </div>

        <nav className="crm-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === active ? 'active' : ''}
              onClick={() => onChangeTab(item.key)}
            >
              <span className="crm-nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="crm-user">
          <span className="crm-user-avatar">EC</span>
          <div>
            <strong>Equipe Comercial</strong>
            <span>Plano Pro</span>
          </div>
        </div>
      </aside>

      <div className="crm-main">
        <header className="crm-topbar">
          <h1><span className="crm-nav-icon" aria-hidden="true">{navItems.find((n) => n.key === active)?.icon}</span> {pageTitles[active]}</h1>
          <div className="crm-topbar-actions">
            <span className="crm-online"><i /> Sistema online</span>
            <button type="button" className="btn btn-ghost" onClick={onLogout}>Sair</button>
          </div>
        </header>
        <div className="crm-content">{children}</div>
      </div>
    </div>
  )
}
