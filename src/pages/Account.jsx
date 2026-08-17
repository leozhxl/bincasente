import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import { products } from '../data/products'
import './Account.css'

const addresses = [
  { label: 'Endereço de Entrega Padrão', text: 'Rua das Acácias, 120 — São Paulo, SP' },
  { label: 'Endereço de Cobrança Padrão', text: 'Rua das Acácias, 120 — São Paulo, SP' },
]

const tabs = [
  { id: 'Minha Conta', icon: '👤' },
  { id: 'Meus Pedidos', icon: '📦' },
  { id: 'Meus Favoritos', icon: '♡' },
  { id: 'Endereços', icon: '📍' },
  { id: 'Meus Dados', icon: '🪪' },
]

export default function Account() {
  const location = useLocation()
  const { user, loading, login, signup, logout, updateProfile, deleteAccount } = useAuth()
  const { orders: allOrders } = useOrders()
  const [tab, setTab] = useState(location.state?.initialTab || 'Minha Conta')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    docType: 'Pessoa Física',
    cpf: '',
    rg: '',
    email: '',
    password: '',
    confirm: '',
    marketingConsent: true,
    termsConsent: false,
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { wishlist } = useCart()
  const wishedProducts = products.filter((p) => wishlist.includes(p.id))

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (mode === 'signup') {
      if (form.password !== form.confirm) {
        setError('As senhas não coincidem.')
        return
      }
      if (!form.termsConsent) {
        setError('É necessário concordar com os termos de uso e a política de privacidade.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await signup({
          name: form.name,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          docType: form.docType,
          cpf: form.cpf,
          rg: form.rg,
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container account-login">
        {mode === 'login' ? (
          <div className="login-panels">
            <form className="login-panel" onSubmit={handleSubmit} noValidate>
              <h1>Acesse sua conta</h1>
              <p className="login-subtitle">Informe seus dados para continuar</p>

              {error && <p className="field-error login-error" role="alert">{error}</p>}

              <div className="field">
                <label htmlFor="login-email" className="visually-hidden">E-mail</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="E-mail *"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                />
              </div>

              <div className="field password-field">
                <label htmlFor="login-senha" className="visually-hidden">Senha</label>
                <input
                  id="login-senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha *"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <label className="remember-check">
                <input type="checkbox" />
                Lembrar meus dados
              </label>

              <button type="submit" className="btn btn-accent btn-block login-submit" disabled={submitting}>
                {submitting ? 'Aguarde...' : 'Acessar conta'}
              </button>

              <a href="#esqueci" className="forgot-link">Esqueci minha senha</a>
            </form>

            <div className="signup-panel">
              <span className="signup-icon" aria-hidden="true">🧑‍🤝‍🧑</span>
              <h2>Novo por aqui?</h2>
              <p>Crie sua conta e aproveite todos os benefícios de ser um cliente Brinca e Sente.</p>
              <button type="button" className="btn btn-primary btn-block" onClick={() => { setMode('signup'); setError(null) }}>
                Criar conta
              </button>
            </div>
          </div>
        ) : (
          <form className="signup-form card" onSubmit={handleSubmit} noValidate>
            <h1>Complete sua conta</h1>
            <p className="login-subtitle">Informe os seus dados abaixo para completar sua conta.</p>

            {error && <p className="field-error login-error" role="alert">{error}</p>}

            <div className="field-row">
              <div className="field">
                <label htmlFor="signup-nome">Nome</label>
                <input
                  id="signup-nome"
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="signup-sobrenome">Sobrenome</label>
                <input
                  id="signup-sobrenome"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="signup-doctype">Quero me cadastrar como: *</label>
              <select id="signup-doctype" value={form.docType} onChange={(e) => update('docType', e.target.value)}>
                <option>Pessoa Física</option>
                <option>Pessoa Jurídica</option>
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="signup-cpf">{form.docType === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'}</label>
                <input
                  id="signup-cpf"
                  type="text"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => update('cpf', e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="signup-rg">RG</label>
                <input id="signup-rg" type="text" value={form.rg} onChange={(e) => update('rg', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="signup-email">E-mail</label>
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>

            <div className="field password-field">
              <label htmlFor="signup-senha">Senha</label>
              <input
                id="signup-senha"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="field">
              <label htmlFor="signup-confirm">Confirmar senha</label>
              <input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                required
              />
            </div>

            <label className="consent-check">
              <input
                type="checkbox"
                checked={form.marketingConsent}
                onChange={(e) => update('marketingConsent', e.target.checked)}
              />
              Aceito receber comunicação de marketing da Brinca e Sente
            </label>

            <label className="consent-check">
              <input
                type="checkbox"
                checked={form.termsConsent}
                onChange={(e) => update('termsConsent', e.target.checked)}
                required
              />
              Estou ciente e CONCORDO com os{' '}
              <a href="/faq">termos de uso</a> e{' '}
              <a href="/politica-trocas">políticas de privacidade</a> da Brinca e Sente.
            </label>

            <button type="submit" className="btn btn-accent btn-block login-submit" disabled={submitting}>
              {submitting ? 'Aguarde...' : 'Criar conta'}
            </button>

            <button type="button" className="btn btn-ghost btn-block" onClick={() => { setMode('login'); setError(null) }}>
              Já tenho conta
            </button>
          </form>
        )}
      </div>
    )
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')
    if (confirmed) deleteAccount()
  }

  const firstName = (user.displayName || user.email).split(' ')[0]

  return (
    <AccountLoggedIn
      user={user}
      orders={allOrders}
      firstName={firstName}
      tab={tab}
      setTab={setTab}
      logout={logout}
      updateProfile={updateProfile}
      handleDeleteAccount={handleDeleteAccount}
      wishedProducts={wishedProducts}
    />
  )
}

function AccountLoggedIn({ user, orders, firstName, tab, setTab, logout, updateProfile, handleDeleteAccount, wishedProducts }) {
  const [dadosForm, setDadosForm] = useState({
    name: user.name || user.displayName?.split(' ')[0] || '',
    lastName: user.lastName || '',
    docType: user.docType || 'Pessoa Física',
    cpf: user.cpf || '',
    rg: user.rg || '',
  })
  const [profileSaved, setProfileSaved] = useState(false)

  function updateDadosForm(field, value) {
    setDadosForm((f) => ({ ...f, [field]: value }))
    setProfileSaved(false)
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    await updateProfile(dadosForm)
    setProfileSaved(true)
  }

  return (
    <div className="container account-page">
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <Link to="/">Início</Link> / <span>Minha Conta</span>
      </nav>

      <div className="account-layout">
        <nav className="account-tabs" aria-label="Seções da conta">
          {tabs.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <span aria-hidden="true">{t.icon}</span> {t.id}
            </button>
          ))}
          <button type="button" className="logout-btn" onClick={logout}>
            <span aria-hidden="true">🚪</span> Sair
          </button>
        </nav>

        <div className="account-content">
          {tab === 'Minha Conta' && (
            <div className="account-overview">
              <div className="overview-greeting">
                <span className="overview-avatar" aria-hidden="true">👤</span>
                <div>
                  <h1>Olá, {firstName}</h1>
                  <p>
                    Aqui você encontra todas as informações relacionadas à sua conta, como acompanhar seus
                    últimos pedidos, adicionar novos endereços e gerenciar seus favoritos.
                  </p>
                </div>
              </div>

              <div className="overview-cards">
                {tabs.slice(1).map((t) => (
                  <button key={t.id} type="button" className="overview-card" onClick={() => setTab(t.id)}>
                    <span aria-hidden="true">{t.icon}</span>
                    {t.id}
                  </button>
                ))}
              </div>

              <section className="overview-panel">
                <div className="overview-panel-header">
                  <h2><span aria-hidden="true">📦</span> Últimos Pedidos</h2>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setTab('Meus Pedidos')}>
                    Ver todos
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p className="field-hint">Você ainda não fez nenhum pedido.</p>
                ) : (
                  <ul className="overview-order-list">
                    {orders.slice(0, 2).map((o) => (
                      <li key={o.id}>
                        <span>{o.id}</span>
                        <span>{o.date}</span>
                        <span className={`status-pill status-${o.status.toLowerCase()}`}>{o.status}</span>
                        <span>R$ {o.total.toFixed(2).replace('.', ',')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="overview-panel-row">
                <section className="overview-panel">
                  <div className="overview-panel-header">
                    <h2><span aria-hidden="true">📍</span> Endereços</h2>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setTab('Endereços')}>
                      Ver todos
                    </button>
                  </div>
                  <div className="address-chips">
                    {addresses.map((a) => (
                      <span key={a.label} className="address-chip">{a.label}</span>
                    ))}
                  </div>
                </section>

                <section className="overview-panel">
                  <div className="overview-panel-header">
                    <h2><span aria-hidden="true">🪪</span> Meus Dados</h2>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setTab('Meus Dados')}>
                      Ver todos
                    </button>
                  </div>
                  <p className="field-hint">Informações de Acesso</p>
                  <ul className="access-info-list">
                    <li><span aria-hidden="true">👤</span> {user.displayName || 'Sem nome cadastrado'}</li>
                    <li><span aria-hidden="true">✉️</span> {user.email}</li>
                  </ul>
                  <div className="access-info-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setTab('Meus Dados')}>
                      Editar
                    </button>
                    <button type="button" className="btn btn-primary btn-sm">
                      Mudar senha
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
                      Excluir minha conta
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {tab === 'Meus Pedidos' && (
            <div>
              <h2>Histórico de pedidos</h2>
              {orders.length === 0 ? (
                <p>Você ainda não fez nenhum pedido. Que tal <Link to="/loja">explorar o catálogo</Link>?</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th scope="col">Pedido</th>
                      <th scope="col">Data</th>
                      <th scope="col">Status</th>
                      <th scope="col">Total</th>
                      <th scope="col">Rastreio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.date}</td>
                        <td><span className={`status-pill status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                        <td>R$ {o.total.toFixed(2).replace('.', ',')}</td>
                        <td><a href="#rastreio">Ver rastreio</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'Endereços' && (
            <div>
              <h2>Endereços salvos</h2>
              <ul className="address-list">
                {addresses.map((a) => (
                  <li key={a.label} className="card">
                    <strong>{a.label}</strong>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-outline">Adicionar novo endereço</button>
            </div>
          )}

          {tab === 'Meus Dados' && (
            <form className="account-form dados-form" onSubmit={handleUpdateProfile}>
              <h2>Meus Dados</h2>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="dados-nome">Nome</label>
                  <input
                    id="dados-nome"
                    type="text"
                    value={dadosForm.name}
                    onChange={(e) => updateDadosForm('name', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="dados-sobrenome">Sobrenome</label>
                  <input
                    id="dados-sobrenome"
                    type="text"
                    value={dadosForm.lastName}
                    onChange={(e) => updateDadosForm('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="dados-doctype">Cadastrado como: *</label>
                <select
                  id="dados-doctype"
                  value={dadosForm.docType}
                  onChange={(e) => updateDadosForm('docType', e.target.value)}
                >
                  <option>Pessoa Física</option>
                  <option>Pessoa Jurídica</option>
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="dados-cpf">{dadosForm.docType === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'}</label>
                  <input
                    id="dados-cpf"
                    type="text"
                    inputMode="numeric"
                    value={dadosForm.cpf}
                    onChange={(e) => updateDadosForm('cpf', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="dados-rg">RG</label>
                  <input
                    id="dados-rg"
                    type="text"
                    value={dadosForm.rg}
                    onChange={(e) => updateDadosForm('rg', e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="dados-email">E-mail Cadastrado</label>
                <input id="dados-email" type="email" value={user.email || ''} disabled />
              </div>

              {profileSaved && <p className="field-hint" role="status">✔ Dados atualizados com sucesso.</p>}

              <div className="dados-form-actions">
                <button type="submit" className="btn btn-primary">Atualizar dados</button>
              </div>
            </form>
          )}

          {tab === 'Meus Favoritos' && (
            <div>
              <h2>Lista de desejos</h2>
              {wishedProducts.length === 0 ? (
                <p>Você ainda não adicionou produtos à sua lista de desejos.</p>
              ) : (
                <ul className="wishlist-list">
                  {wishedProducts.map((p) => (
                    <li key={p.id}>
                      <span aria-hidden="true">
                        {p.image?.startsWith('/') ? <img src={p.image} alt="" className="wishlist-thumb" /> : p.image}
                      </span> {p.name} — R$ {p.price.toFixed(2).replace('.', ',')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
