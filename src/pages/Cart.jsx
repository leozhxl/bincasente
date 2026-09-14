import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import CheckoutProgress from '../components/CheckoutProgress'
import ProductCard from '../components/ProductCard'
import { isImageSrc } from '../utils/image'
import './Cart.css'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()
  const { products } = useProducts()

  const total = subtotal

  const crossSell = products.filter((p) => !items.some((i) => i.id === p.id)).slice(0, 4)

  return (
    <div className="container cart-page">
      <CheckoutProgress current={1} />
      <h1>Meu Carrinho</h1>

      {items.length === 0 ? (
        <div className="cart-empty card">
          <p>Seu carrinho está vazio.</p>
          <Link to="/loja" className="btn btn-primary">Ir às compras</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.key} className="cart-item card">
                <span className="cart-item-image" aria-hidden="true">
                  {isImageSrc(item.image) ? (
                    <img src={item.image} alt="" loading="lazy" />
                  ) : (
                    item.image
                  )}
                </span>
                <div className="cart-item-info">
                  <Link to={`/produto/${item.slug}`} className="cart-item-name">{item.name}</Link>
                  <span className="cart-item-variant">Cor/textura: {item.color}</span>
                  <button type="button" className="cart-item-remove" onClick={() => removeItem(item.key)}>
                    Remover
                  </button>
                </div>
                <div className="cart-item-qty">
                  <label htmlFor={`qty-${item.key}`} className="visually-hidden">Quantidade de {item.name}</label>
                  <div className="qty-stepper">
                    <button type="button" onClick={() => updateQty(item.key, item.qty - 1)} aria-label={`Diminuir quantidade de ${item.name}`}>−</button>
                    <input
                      id={`qty-${item.key}`}
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQty(item.key, Number(e.target.value))}
                    />
                    <button type="button" onClick={() => updateQty(item.key, item.qty + 1)} aria-label={`Aumentar quantidade de ${item.name}`}>+</button>
                  </div>
                </div>
                <div className="cart-item-price">
                  <span>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
                  <span className="unit-price">R$ {item.price.toFixed(2).replace('.', ',')} / un</span>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary card">
            <h2>Resumo do pedido</h2>

            <p className="field-hint">
              Quer saber o valor e o prazo do frete?{' '}
              <a href="https://www2.correios.com.br/sistemas/precosPrazos/" target="_blank" rel="noopener noreferrer">
                Consulte pelo seu CEP no site dos Correios
              </a>
              .
            </p>

            <dl className="summary-lines">
              <div><dt>Subtotal</dt><dd>R$ {subtotal.toFixed(2).replace('.', ',')}</dd></div>
              <div><dt>Frete</dt><dd>A combinar</dd></div>
              <div className="summary-total"><dt>Total</dt><dd>R$ {total.toFixed(2).replace('.', ',')}</dd></div>
            </dl>

            <Link to="/checkout" className="btn btn-accent btn-block">Finalizar compra</Link>
          </aside>
        </div>
      )}

      {items.length > 0 && (
        <section className="cross-sell">
          <h2>Você também pode gostar</h2>
          <div className="product-grid">
            {crossSell.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
