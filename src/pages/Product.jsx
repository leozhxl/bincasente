import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import ProductViewer3D from '../components/ProductViewer3D'
import ProductCard from '../components/ProductCard'
import './Product.css'

export default function Product() {
  const { slug } = useParams()
  const product = products.find((p) => p.slug === slug)
  const { addItem } = useCart()

  const [color, setColor] = useState(product?.colorOptions?.[0])
  const [qty, setQty] = useState(1)
  const [cep, setCep] = useState('')
  const [shippingInfo, setShippingInfo] = useState(null)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="container section">
        <h1>Produto não encontrado</h1>
        <Link to="/loja" className="btn btn-primary">Voltar para a loja</Link>
      </div>
    )
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  function handleAdd() {
    addItem(product, { color, qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  function handleCep(e) {
    e.preventDefault()
    if (cep.replace(/\D/g, '').length === 8) {
      setShippingInfo({ price: 24.9, days: '4 a 7 dias úteis' })
    } else {
      setShippingInfo({ error: true })
    }
  }

  return (
    <div className="container product-page">
      <nav aria-label="Trilha de navegação" className="breadcrumb">
        <Link to="/">Início</Link> / <Link to="/loja">Loja</Link> / <Link to={`/loja/${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
      </nav>

      <div className="product-main">
        <ProductViewer3D emoji={product.colorImages?.[color] || product.image} name={product.name} />

        <div className="product-info">
          <div className="product-badges-row">
            {product.badges.includes('expert') && <span className="badge badge-expert">Recomendado por terapeutas</span>}
            {product.badges.includes('best') && <span className="badge badge-best">Mais vendido</span>}
            {product.badges.includes('new') && <span className="badge badge-new">Novo</span>}
          </div>
          <h1>{product.name}</h1>
          <div className="product-rating" aria-label={`Avaliação ${product.rating} de 5, ${product.reviewsCount} avaliações`}>
            <span className="stars" aria-hidden="true">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </span>
            {product.rating} · {product.reviewsCount} avaliações
          </div>

          <p className="product-price">
            R$ {product.price.toFixed(2).replace('.', ',')}
            <span> · {product.installments}</span>
          </p>

          <p className="product-desc">{product.description}</p>

          <ul className="benefit-icons">
            {product.benefits.map((b) => (
              <li key={b}>✔ {b}</li>
            ))}
          </ul>

          {product.colorOptions?.length > 1 && (
            <div className="field">
              <span className="field-label">Cor / textura</span>
              <div className="color-options" role="radiogroup" aria-label="Escolha a cor">
                {product.colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-chip ${color === c ? 'selected' : ''}`}
                    role="radio"
                    aria-checked={color === c}
                    onClick={() => setColor(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="qty-row">
            <label htmlFor="qty">Quantidade</label>
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">−</button>
              <input id="qty" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Aumentar quantidade">+</button>
            </div>
          </div>

          <div className="product-actions">
            <button type="button" className="btn btn-outline" onClick={handleAdd}>
              Adicionar ao carrinho
            </button>
            <Link to="/checkout" className="btn btn-accent" onClick={handleAdd}>
              Comprar agora
            </Link>
          </div>
          {added && <p className="added-confirmation" role="status">✔ Adicionado ao carrinho</p>}

          <form className="cep-form" onSubmit={handleCep}>
            <label htmlFor="cep">Calcular frete e prazo</label>
            <div className="cep-row">
              <input id="cep" type="text" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} inputMode="numeric" />
              <button type="submit" className="btn btn-ghost">Calcular</button>
            </div>
            {shippingInfo?.error && <p className="field-error">CEP inválido. Verifique e tente novamente.</p>}
            {shippingInfo && !shippingInfo.error && (
              <p className="field-hint">Frete: R$ {shippingInfo.price.toFixed(2).replace('.', ',')} · Prazo: {shippingInfo.days}</p>
            )}
          </form>

        </div>
      </div>

      <section className="expert-section card">
        <span aria-hidden="true" className="expert-icon">🩺</span>
        <div>
          <h2>Recomendado por especialistas</h2>
          <p>{product.expertNote}</p>
        </div>
      </section>

      <section className="reviews-section">
        <h2>Avaliações de clientes</h2>
        <div className="reviews-grid">
          <article className="review-card card">
            <div className="stars" aria-hidden="true">★★★★★</div>
            <p>&ldquo;Excelente qualidade, meu filho usa todos os dias. Superou as expectativas.&rdquo;</p>
            <strong>Fernanda R.</strong>
          </article>
          <article className="review-card card">
            <div className="stars" aria-hidden="true">★★★★☆</div>
            <p>&ldquo;Produto muito bem feito, chegou rápido e com embalagem cuidadosa.&rdquo;</p>
            <strong>Diego A.</strong>
          </article>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related-section">
          <h2>Quem comprou este também comprou</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
