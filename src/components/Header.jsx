import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAccessibility } from '../context/AccessibilityContext'
import CategoryMenu from './CategoryMenu'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/como-funciona', label: 'Como Funciona' },
  { to: '/contato', label: 'Contato' },
  { to: '/faq', label: 'FAQ' },
]

const themeIcon = { light: '☀️', dark: '🌙', system: '🖥️' }
const themeLabel = { light: 'Tema claro', dark: 'Tema escuro', system: 'Tema automático' }

export default function Header() {
  const { count, subtotal } = useCart()
  const { user } = useAuth()
  const { theme, toggleTheme } = useAccessibility()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function closeNav() {
    setNavOpen(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/loja${search.trim() ? `?busca=${encodeURIComponent(search.trim())}` : ''}`)
  }

  return (
    <header className="site-header">
      <div className="container site-header-top">
        <Link to="/" className="logo" aria-label="Brinca e Sente, página inicial">
          <img src="/logo.png" alt="Brinca e Sente" className="logo-image" />
        </Link>

        <form className="header-search" onSubmit={handleSearch} role="search">
          <label htmlFor="header-search-input" className="visually-hidden">Buscar no site</label>
          <input
            id="header-search-input"
            type="search"
            placeholder="BUSCAR NO SITE"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Buscar">→</button>
        </form>

        <div className="header-top-actions">
          <Link to="/conta" className="header-account">
            <span className="header-account-icon" aria-hidden="true">👤</span>
            <span className="header-account-text">
              {user ? (
                <>Olá, <strong>{user.displayName}</strong></>
              ) : (
                <>Olá, seja bem-vindo, Faça seu <strong>Login ou Cadastre-se</strong></>
              )}
            </span>
          </Link>

          <Link to="/carrinho" className="header-cart" aria-label={`Carrinho, ${count} ${count === 1 ? 'produto' : 'produtos'}`}>
            <span className="header-cart-icon" aria-hidden="true">🛒</span>
            <span className="header-cart-info">
              <span>{count} {count === 1 ? 'item' : 'itens'}</span>
              <strong>R$ {subtotal.toFixed(2).replace('.', ',')}</strong>
            </span>
          </Link>
        </div>
      </div>

      <div className="container site-header-bar">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls="main-nav"
          aria-label={navOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
        </button>

        <nav id="main-nav" className={`main-nav ${navOpen ? 'open' : ''}`} aria-label="Navegação principal">
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.to === '/'} onClick={closeNav} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="category-menu-trigger"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => {
                  setMenuOpen(true)
                  closeNav()
                }}
              >
                Categorias
              </button>
            </li>
            <li className="nav-mobile-cart">
              <Link to="/carrinho" className="btn btn-accent btn-block" onClick={closeNav} aria-label={`Carrinho, ${count} ${count === 1 ? 'produto' : 'produtos'}`}>
                <span aria-hidden="true">🛒</span> Ver Carrinho{count > 0 ? ` (${count})` : ''}
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`${themeLabel[theme]}. Clique para alternar o tema.`}
        >
          <span aria-hidden="true">{themeIcon[theme]}</span>
        </button>
      </div>

      <CategoryMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
