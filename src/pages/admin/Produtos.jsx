import { useMemo, useState } from 'react'
import { categories, products } from '../../data/products'
import { formatMoney } from './adminApi'

export default function Produtos() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [showInfo, setShowInfo] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter !== 'todas' && p.category !== categoryFilter) return false
      if (!term) return true
      return p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term)
    })
  }, [search, categoryFilter])

  return (
    <div className="crm-page">
      <div className="crm-page-head">
        <div>
          <h2>Produtos</h2>
          <p>{products.length} produto{products.length === 1 ? '' : 's'} no catálogo</p>
        </div>
        <button type="button" className="btn btn-accent" onClick={() => setShowInfo(true)}>+ Novo Produto</button>
      </div>

      <div className="crm-toolbar">
        <div className="crm-search-wrap">
          <span className="crm-search-icon" aria-hidden="true">⌕</span>
          <input type="text" placeholder="Buscar produto, categoria..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div className="crm-panel crm-list-panel">
        {filtered.length === 0 ? (
          <div className="crm-empty-block">
            <span className="crm-empty-icon" aria-hidden="true">◧</span>
            <strong>Nenhum produto encontrado</strong>
            <p>Tente ajustar a busca ou o filtro de categoria.</p>
          </div>
        ) : (
          <ul className="crm-product-grid">
            {filtered.map((p) => (
              <li key={p.id} className="crm-product-card">
                <img src={p.image} alt="" loading="lazy" />
                <div>
                  <strong>{p.name}</strong>
                  <span className="crm-mini-sub">{categories.find((c) => c.slug === p.category)?.name}</span>
                  <span className="crm-product-price">{formatMoney(p.price)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showInfo && (
        <div className="crm-modal-backdrop" onClick={() => setShowInfo(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Como adicionar um produto</h2>
            <p className="field-hint">
              O catálogo da loja é gerenciado no código-fonte (arquivo <code>src/data/products.js</code>), para manter
              preço, fotos, descrição e SEO sempre em sincronia com a loja. Me peça para cadastrar o novo produto e eu
              adiciono direto por lá.
            </p>
            <div className="crm-modal-actions">
              <button type="button" className="btn btn-accent" onClick={() => setShowInfo(false)}>Entendi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
