import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { products, categories, conditions } from '../data/products'
import ProductCard from '../components/ProductCard'
import './Catalog.css'

export default function Catalog() {
  const { categorySlug } = useParams()
  const [searchParams] = useSearchParams()
  const busca = searchParams.get('busca') || ''

  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [maxPrice, setMaxPrice] = useState(600)
  const [sort, setSort] = useState('relevancia')

  const currentCategory = categories.find((c) => c.slug === (categorySlug || selectedCategory))

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice)

    const cat = categorySlug || selectedCategory
    if (cat) list = list.filter((p) => p.category === cat)

    if (selectedConditions.length > 0) {
      list = list.filter((p) => selectedConditions.every((c) => p.condition.includes(c)))
    }

    if (busca) {
      list = list.filter((p) => p.name.toLowerCase().includes(busca.toLowerCase()))
    }

    switch (sort) {
      case 'menor-preco':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'maior-preco':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'avaliacao':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case 'lancamentos':
        list = [...list].sort((a, b) => (b.badges.includes('new') ? 1 : 0) - (a.badges.includes('new') ? 1 : 0))
        break
      default:
        break
    }
    return list
  }, [categorySlug, selectedCategory, selectedConditions, maxPrice, sort, busca])

  function toggleCondition(slug) {
    setSelectedConditions((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  const showBestSellers = !categorySlug && !selectedCategory && !busca
  const bestSellers = useMemo(
    () => [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [filtered]
  )

  const filtersAside = (
    <aside className="catalog-filters" aria-label="Filtros de produtos">
      <div className="filter-group">
        <h2>Categoria</h2>
        <ul className="filter-list">
          <li>
            <label>
              <input
                type="radio"
                name="categoria"
                checked={!categorySlug && !selectedCategory}
                onChange={() => setSelectedCategory('')}
              />
              Todas
            </label>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <label>
                <input
                  type="radio"
                  name="categoria"
                  checked={(categorySlug || selectedCategory) === c.slug}
                  onChange={() => setSelectedCategory(c.slug)}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h2>Condição / necessidade</h2>
        <ul className="filter-list">
          {conditions.map((c) => (
            <li key={c.slug}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(c.slug)}
                  onChange={() => toggleCondition(c.slug)}
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-group">
        <h2>
          <label htmlFor="price-range">Preço até R$ {maxPrice}</label>
        </h2>
        <input
          id="price-range"
          type="range"
          min="80"
          max="600"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </div>
    </aside>
  )

  return (
    <div className="container catalog-page">
      {showBestSellers ? (
        <>
          <section className="best-sellers-section">
          <h2 className="best-sellers-heading">◄◄◄◄◄◄◄◄◄◄ MAIS VENDIDOS ►►►►►►►►►►</h2>
          <div className="catalog-layout">
            {filtersAside}
            <div className="best-sellers-grid">
              {bestSellers.map((p) => (
                <Link key={p.id} to={`/produto/${p.slug}`} className="best-seller-card">
                  <div className="best-seller-image" aria-hidden="true">
                    {p.image?.startsWith('/') ? (
                      <img src={p.image} alt="" loading="lazy" />
                    ) : (
                      <span>{p.image}</span>
                    )}
                  </div>
                  <p className="best-seller-name">{p.name}</p>
                  <p className="best-seller-price">
                    R$ {p.price.toFixed(2).replace('.', ',')}
                    <span className="best-seller-installments">ou em até {p.installments}</span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
          </section>
        </>
      ) : (
        <>
          <header className="catalog-header">
            <h1>{currentCategory ? currentCategory.name : busca ? `Resultados para "${busca}"` : 'Catálogo completo'}</h1>
            <p>{currentCategory?.description || 'Explore nossa curadoria de produtos sensoriais 3D.'}</p>
          </header>

          <div className="catalog-layout">
            {filtersAside}

            <div className="catalog-results">
              <div className="catalog-toolbar">
                <span aria-live="polite">{filtered.length} produtos encontrados</span>
                <div className="sort-control">
                  <label htmlFor="sort-select">Ordenar por</label>
                  <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="relevancia">Relevância</option>
                    <option value="mais-vendidos">Mais vendidos</option>
                    <option value="menor-preco">Menor preço</option>
                    <option value="maior-preco">Maior preço</option>
                    <option value="lancamentos">Lançamentos</option>
                    <option value="avaliacao">Melhor avaliação</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="catalog-empty">Nenhum produto encontrado com esses filtros. Tente ajustar as opções.</p>
              ) : (
                <div className="product-grid">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
