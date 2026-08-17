import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { calculateShipping } from '../api'
import CheckoutProgress from '../components/CheckoutProgress'
import ProductCard from '../components/ProductCard'
import './Cart.css'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, count } = useCart()
  const [cep, setCep] = useState('')
  const [shipping, setShipping] = useState(null)
  const [loadingShipping, setLoadingShipping] = useState(false)

  const shippingCost = shipping?.price ?? 0
  const total = subtotal + shippingCost

  async function calcShipping(e) {
    e.preventDefault()
    if (cep.replace(/\D/g, '').length !== 8) {
      setShipping({ error: true })
      return
    }
    setLoadingShipping(true)
    try {
      const cheapest = await calculateShipping(cep, count)
      setShipping({ price: cheapest.price, days: `${cheapest.days} dias úteis`, carrier: `${cheapest.carrier} · ${cheapest.service}` })
    } catch {
      setShipping({ error: true })
    } finally {
      setLoadingShipping(false)
    }
  }

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
                  {item.image?.startsWith('/') ? (
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

            <form className="coupon-form" onSubmit={calcShipping}>
              <label htmlFor="cart-cep">Calcular frete (CEP)</label>
              <div className="coupon-row">
                <input id="cart-cep" type="text" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" />
                <button type="submit" className="btn btn-ghost" disabled={loadingShipping}>{loadingShipping ? '...' : 'OK'}</button>
              </div>
              {shipping?.error && <p className="field-error">Não foi possível calcular o frete para esse CEP.</p>}
              {shipping && !shipping.error && <p className="field-hint">{shipping.carrier} · Prazo: {shipping.days}</p>}
            </form>

            <dl className="summary-lines">
              <div><dt>Subtotal</dt><dd>R$ {subtotal.toFixed(2).replace('.', ',')}</dd></div>
              <div><dt>Frete</dt><dd>{shipping && !shipping.error ? `R$ ${shippingCost.toFixed(2).replace('.', ',')}` : 'A calcular'}</dd></div>
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
