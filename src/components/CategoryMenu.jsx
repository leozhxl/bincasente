import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, products } from '../data/products'
import './CategoryMenu.css'

const conditionLabels = {
  autismo: 'Autismo',
  tdah: 'TDAH',
  'deficiencia-intelectual': 'Deficiência Intelectual',
  'baixa-visao': 'Baixa Visão',
  'paralisia-cerebral': 'Paralisia Cerebral',
  ansiedade: 'Ansiedade',
}

const categoryItems = categories.map((cat) => {
  const conditionsInCategory = [
    ...new Set(products.filter((p) => p.category === cat.slug).flatMap((p) => p.condition)),
  ]
  return { ...cat, conditions: conditionsInCategory }
})

const helpLinks = [
  { icon: '👤', label: 'Minha Conta', to: '/conta' },
  { icon: 'ℹ️', label: 'Quem Somos', to: '/sobre' },
  { icon: '🎧', label: 'Atendimento ao Cliente', to: '/contato' },
  { icon: '🛒', label: 'Como Comprar', to: '/faq' },
]

export default function CategoryMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="category-menu-overlay">
      <nav className="category-menu" ref={panelRef} aria-label="Categorias e menu de ajuda">
        <ul className="category-menu-list">
          {categoryItems.map((cat) => {
            const hasSubitems = cat.conditions.length > 0
            const isExpanded = expanded === cat.slug
            return (
              <li key={cat.slug} className={isExpanded ? 'expanded' : ''}>
                <div className="category-menu-row">
                  <Link to={`/loja/${cat.slug}`} onClick={onClose} className="category-menu-link">
                    <span aria-hidden="true">{cat.icon}</span> {cat.name}
                  </Link>
                  {hasSubitems && (
                    <button
                      type="button"
                      className="category-menu-chevron"
                      aria-expanded={isExpanded}
                      aria-label={`Mostrar necessidades atendidas em ${cat.name}`}
                      onClick={() => setExpanded(isExpanded ? null : cat.slug)}
                    >
                      ⌄
                    </button>
                  )}
                </div>
                {hasSubitems && isExpanded && (
                  <ul className="category-menu-subitems">
                    {cat.conditions.map((c) => (
                      <li key={c}>
                        <Link to={`/loja/${cat.slug}`} onClick={onClose}>
                          {conditionLabels[c] || c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        <span className="category-menu-heading">Ajuda e Configurações</span>
        <ul className="category-menu-list category-menu-help">
          {helpLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={onClose} className="category-menu-link">
                <span aria-hidden="true">{link.icon}</span> {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
