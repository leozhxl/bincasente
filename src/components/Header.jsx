import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CategoryMenu from './CategoryMenu'
import './Header.css'

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/como-funciona', label: 'Como Funciona' },
  { to: '/blog', label: 'Blog' },
  { to: '/contato', label: 'Contato' },
  { to: '/faq', label: 'FAQ' },
]

export default function Header() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  function closeNav() {
    setNavOpen(false)
  }

  return (
    <header className="site-header">
      <div className="container site-header-bar">
        <Link to="/" className="logo" aria-label="Brinca e Sente, página inicial">
          <img src="/logo.png" alt="Brinca e Sente" className="logo-image" />
        </Link>

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
              <Link to="/carrinho" className="cta-pill" onClick={closeNav} aria-label={`Carrinho, ${count} ${count === 1 ? 'produto' : 'produtos'}`}>
                <span aria-hidden="true">🛒</span> Ver Carrinho{count > 0 ? ` (${count})` : ''}
              </Link>
            </li>
          </ul>
        </nav>

        <Link to="/carrinho" className="cta-pill nav-desktop-cart" aria-label={`Carrinho, ${count} ${count === 1 ? 'produto' : 'produtos'}`}>
          <span aria-hidden="true">🛒</span> Ver Carrinho{count > 0 ? ` (${count})` : ''}
        </Link>
      </div>

      <CategoryMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
