import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

const badgeMap = {
  new: { label: 'Novo', className: 'badge-new' },
  best: { label: 'Mais vendido', className: 'badge-best' },
  expert: { label: 'Recomendado por terapeutas', className: 'badge-expert' },
}

export default function ProductCard({ product }) {
  const { addItem, wishlist, toggleWishlist } = useCart()
  const isWished = wishlist.includes(product.id)

  return (
    <article className="product-card card">
      <div className="product-card-media">
        <button
          type="button"
          className={`wish-btn ${isWished ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-pressed={isWished}
          aria-label={isWished ? `Remover ${product.name} da lista de desejos` : `Adicionar ${product.name} à lista de desejos`}
        >
          {isWished ? '♥' : '♡'}
        </button>
        <Link to={`/produto/${product.slug}`} className="product-card-image" aria-hidden="true" tabIndex={-1}>
          <span>{product.image}</span>
        </Link>
        <div className="product-card-badges">
          {product.badges.map((b) => (
            <span key={b} className={`badge ${badgeMap[b].className}`}>
              {badgeMap[b].label}
            </span>
          ))}
        </div>
      </div>
      <div className="product-card-body">
        <Link to={`/produto/${product.slug}`} className="product-card-name">
          {product.name}
        </Link>
        <div className="product-card-rating" aria-label={`Avaliação ${product.rating} de 5 estrelas, ${product.reviewsCount} avaliações`}>
          <span className="stars" aria-hidden="true">
            {'★'.repeat(Math.round(product.rating))}
            {'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className="rating-count">({product.reviewsCount})</span>
        </div>
        <p className="product-card-price">
          R$ {product.price.toFixed(2).replace('.', ',')}
          <span className="installments"> · {product.installments}</span>
        </p>
        <button type="button" className="btn btn-accent btn-block" onClick={() => addItem(product)}>
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  )
}
