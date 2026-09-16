import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrdersContext'
import CheckoutProgress from '../components/CheckoutProgress'
import { buildPixPayload, orderToTxid } from '../utils/pix'
import { openReceipt } from '../utils/receipt'
import { sendOrderToWhatsApp } from '../utils/whatsappOrder'
import { calcShippingByCep } from '../utils/shipping'
import { isImageSrc } from '../utils/image'
import './Checkout.css'

const emptyForm = {
  nome: '',
  email: '',
  telefone: '',
  cpfCnpj: '',
  cep: '',
  endereco: '',
  numero: '',
  cidade: '',
  estado: '',
  pagamento: 'pix',
  entrega: 'envio',
}

const paymentLabels = {
  pix: 'Pix',
  cartao: 'Cartão de crédito',
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useOrders()
  const navigate = useNavigate()
  const [step, setStep] = useState('dados')
  const [form, setForm] = useState({ ...emptyForm, email: user?.email || '', nome: user?.displayName || '' })
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)
  const [orderNumber] = useState(() => `BS-${Math.floor(100000 + Math.random() * 900000)}`)
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const [whatsappItems, setWhatsappItems] = useState(null)
  const [whatsappBlockedUrl, setWhatsappBlockedUrl] = useState(null)

  const [shippingInfo, setShippingInfo] = useState(null) // { price, days, uf, cidade... }
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const [orderError, setOrderError] = useState('')

  const isPickup = form.entrega === 'retirada'
  const shipping = isPickup ? 0 : shippingInfo?.price || 0
  const total = subtotal + shipping

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleCepBlur() {
    const digits = form.cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setShippingLoading(true)
    setShippingError('')
    try {
      const info = await calcShippingByCep(digits)
      setShippingInfo(info)
      setForm((f) => ({
        ...f,
        cidade: f.cidade || info.cidade || f.cidade,
        estado: f.estado || info.uf || f.estado,
        endereco: f.endereco || info.endereco || f.endereco,
      }))
    } catch (err) {
      setShippingInfo(null)
      setShippingError(err.message || 'Não foi possível calcular o frete.')
    } finally {
      setShippingLoading(false)
    }
  }

  function validateDados() {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Informe seu nome completo.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Informe um e-mail válido.'
    if (form.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Informe um telefone válido com DDD.'
    if (!isPickup) {
      if (form.cep.replace(/\D/g, '').length !== 8) errs.cep = 'CEP deve ter 8 dígitos.'
      if (!form.endereco.trim()) errs.endereco = 'Informe o endereço.'
      if (!form.cidade.trim()) errs.cidade = 'Informe a cidade.'
      if (!shippingInfo) errs.cep = errs.cep || 'Aguarde o cálculo do frete para esse CEP.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleDadosSubmit(e) {
    e.preventDefault()
    if (!validateDados()) return
    setStep('pagamento')
  }

  async function handlePagamentoSubmit(e) {
    e.preventDefault()

    if (form.pagamento === 'pix') {
      setStep('pix')
      return
    }

    try {
      await finalizeOrder('Aguardando link de pagamento')
    } catch {
      // erro já exposto via orderError
    }
  }

  async function finalizeOrder(status) {
    const snapshotItems = items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))
    const whatsappItems = items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, color: i.color, benefits: i.benefits, description: i.description }))

    setOrderError('')

    try {
      await addOrder({
        id: orderNumber,
        date: new Date().toLocaleDateString('pt-BR'),
        status,
        total,
        items: snapshotItems,
        customer: form,
        paymentMethod: form.pagamento,
        subtotal,
        shipping,
      })
    } catch (err) {
      setOrderError(err.message || 'Não foi possível registrar seu pedido. Tente novamente ou fale com a gente pelo WhatsApp.')
      throw err
    }

    setWhatsappItems(whatsappItems)
    const { url, blocked } = sendOrderToWhatsApp({ orderNumber, customer: form, items: whatsappItems, total, paymentMethod: form.pagamento })
    setWhatsappBlockedUrl(blocked ? url : null)

    setOrderSnapshot({
      date: new Date().toLocaleDateString('pt-BR'),
      items: snapshotItems,
      subtotal,
      shipping,
      total,
    })

    setConfirmed(true)
    clearCart()
    setStep('confirmacao')
  }

  function handleSendWhatsApp() {
    if (!whatsappItems) return
    const { url, blocked } = sendOrderToWhatsApp({ orderNumber, customer: form, items: whatsappItems, total, paymentMethod: form.pagamento })
    setWhatsappBlockedUrl(blocked ? url : null)
  }

  function handleReceipt() {
    if (!orderSnapshot) return
    openReceipt({
      orderNumber,
      date: orderSnapshot.date,
      customer: form,
      items: orderSnapshot.items,
      subtotal: orderSnapshot.subtotal,
      shipping: orderSnapshot.shipping,
      total: orderSnapshot.total,
      payment: paymentLabels[form.pagamento] || form.pagamento,
    })
  }

  if (items.length === 0 && !confirmed) {
    return (
      <div className="container section">
        <h1>Seu carrinho está vazio</h1>
        <Link to="/loja" className="btn btn-primary">Ir às compras</Link>
      </div>
    )
  }

  const stepNumber = step === 'dados' ? 2 : step === 'pagamento' || step === 'pix' ? 3 : 4

  return (
    <div className="container checkout-page">
      <CheckoutProgress current={stepNumber} />

      {step === 'dados' && (
        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handleDadosSubmit} noValidate>
            <h1>Seus dados</h1>

            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" type="text" value={form.nome} onChange={(e) => update('nome', e.target.value)} aria-invalid={!!errors.nome} aria-describedby={errors.nome ? 'err-nome' : undefined} />
              {errors.nome && <p className="field-error" id="err-nome">{errors.nome}</p>}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                {errors.email && <p className="field-error" id="err-email">{errors.email}</p>}
              </div>
              <div className="field">
                <label htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => update('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  aria-invalid={!!errors.telefone}
                  aria-describedby={errors.telefone ? 'err-telefone' : undefined}
                />
                {errors.telefone && <p className="field-error" id="err-telefone">{errors.telefone}</p>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="cpfCnpj">CPF ou CNPJ (opcional, para nota fiscal)</label>
              <input id="cpfCnpj" type="text" inputMode="numeric" value={form.cpfCnpj} onChange={(e) => update('cpfCnpj', e.target.value)} />
            </div>

            <fieldset className="payment-options">
              <legend>Como você quer receber?</legend>
              <label className="payment-option">
                <input
                  type="radio"
                  name="entrega"
                  checked={form.entrega === 'envio'}
                  onChange={() => update('entrega', 'envio')}
                />
                Entrega no meu endereço
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="entrega"
                  checked={form.entrega === 'retirada'}
                  onChange={() => update('entrega', 'retirada')}
                />
                Retirar no local
              </label>
            </fieldset>

            {isPickup ? (
              <p className="field-hint">
                Combinaremos o local e horário de retirada com você pelo WhatsApp após a confirmação do pedido.
              </p>
            ) : (
              <>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="cep">CEP</label>
                    <input
                      id="cep"
                      type="text"
                      inputMode="numeric"
                      value={form.cep}
                      onChange={(e) => { update('cep', e.target.value); setShippingInfo(null); setShippingError('') }}
                      onBlur={handleCepBlur}
                      aria-invalid={!!errors.cep}
                      aria-describedby={errors.cep ? 'err-cep' : undefined}
                    />
                    {shippingLoading && <p className="field-hint">Calculando frete...</p>}
                    {!shippingLoading && shippingInfo && (
                      <p className="field-hint">
                        Frete para {shippingInfo.cidade}/{shippingInfo.uf}: <strong>R$ {shippingInfo.price.toFixed(2).replace('.', ',')}</strong> · {shippingInfo.days}
                      </p>
                    )}
                    {!shippingLoading && shippingError && <p className="field-error">{shippingError}</p>}
                    {errors.cep && <p className="field-error" id="err-cep">{errors.cep}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="numero">Número</label>
                    <input id="numero" type="text" value={form.numero} onChange={(e) => update('numero', e.target.value)} />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="endereco">Endereço</label>
                  <input id="endereco" type="text" value={form.endereco} onChange={(e) => update('endereco', e.target.value)} aria-invalid={!!errors.endereco} aria-describedby={errors.endereco ? 'err-endereco' : undefined} />
                  {errors.endereco && <p className="field-error" id="err-endereco">{errors.endereco}</p>}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="cidade">Cidade</label>
                    <input id="cidade" type="text" value={form.cidade} onChange={(e) => update('cidade', e.target.value)} aria-invalid={!!errors.cidade} aria-describedby={errors.cidade ? 'err-cidade' : undefined} />
                    {errors.cidade && <p className="field-error" id="err-cidade">{errors.cidade}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor="estado">Estado</label>
                    <select id="estado" value={form.estado} onChange={(e) => update('estado', e.target.value)}>
                      <option value="">Selecione</option>
                      <option>SP</option>
                      <option>RJ</option>
                      <option>MG</option>
                      <option>RS</option>
                      <option>Outro</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-accent btn-block">
              Continuar para pagamento
            </button>
          </form>

          <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      )}

      {step === 'pagamento' && (
        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handlePagamentoSubmit}>
            <h1>Pagamento</h1>

            <fieldset className="payment-options">
              <legend>Forma de pagamento</legend>
              {[
                { id: 'pix', label: 'Pix (aprovação imediata)' },
                { id: 'cartao', label: 'Cartão de crédito (em até 10x)' },
              ].map((opt) => (
                <label key={opt.id} className="payment-option">
                  <input
                    type="radio"
                    name="pagamento"
                    checked={form.pagamento === opt.id}
                    onChange={() => update('pagamento', opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </fieldset>

            {form.pagamento === 'cartao' && (
              <p className="field-hint">
                Ao confirmar, enviaremos seu pedido para o nosso WhatsApp e nossa equipe te manda um
                <strong> link seguro de pagamento por cartão</strong> (em até 10x) para você concluir a compra por lá.
              </p>
            )}

            {form.pagamento === 'pix' && (
              <p className="field-hint">Ao confirmar, você receberá um QR Code Pix para pagamento imediato.</p>
            )}

            {orderError && <p className="field-error">{orderError}</p>}

            <div className="checkout-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('dados')}>← Voltar</button>
              <button type="submit" className="btn btn-accent">
                {form.pagamento === 'cartao' ? 'Solicitar link de pagamento' : 'Confirmar pedido'}
              </button>
            </div>
          </form>

          <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      )}

      {step === 'pix' && (
        <div className="checkout-grid">
          <PixPayment
            orderNumber={orderNumber}
            total={total}
            onBack={() => setStep('pagamento')}
            onConfirm={() => finalizeOrder('Pendente')}
            orderError={orderError}
          />
          <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      )}

      {step === 'confirmacao' && (
        <div className="confirmation card">
          <span className="confirmation-icon" aria-hidden="true">✔</span>
          <h1>Pedido registrado!</h1>
          {whatsappBlockedUrl ? (
            <p className="field-error">
              Seu navegador bloqueou a abertura do WhatsApp. Seu pedido já está registrado, mas{' '}
              <a href={whatsappBlockedUrl} target="_blank" rel="noopener noreferrer">
                clique aqui para enviar os detalhes pelo WhatsApp
              </a>{' '}
              e agilizar seu atendimento.
            </p>
          ) : (
            <span className="whatsapp-confirm-badge">
              <span aria-hidden="true">✅</span> Enviamos os detalhes do pedido para o nosso WhatsApp
            </span>
          )}
          <p>Número do pedido: <strong>{orderNumber}</strong></p>
          {form.pagamento === 'pix' && (
            <p>
              Assim que identificarmos o pagamento do Pix, seu pedido passa para <strong>Processando</strong>.
              Você pode acompanhar o status em <strong>Minha Conta</strong>.
            </p>
          )}
          {form.pagamento === 'cartao' && (
            <p>
              Nossa equipe vai te enviar, pelo WhatsApp, um <strong>link seguro de pagamento por cartão</strong>{' '}
              para você concluir a compra.
            </p>
          )}
          <p>Prazo estimado de entrega: <strong>4 a 7 dias úteis</strong> após a confirmação do pagamento.</p>
          <p className="field-hint">
            A Nota Fiscal Eletrônica (NF-e) será enviada por e-mail assim que emitida. Enquanto isso, você pode
            baixar um comprovante da compra.
          </p>
          <div className="confirmation-actions">
            <button type="button" className="btn btn-whatsapp" onClick={handleSendWhatsApp}>
              <span aria-hidden="true">💬</span> Falar no WhatsApp sobre o pedido
            </button>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/conta')}>Acompanhar pedido</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/loja')}>Continuar comprando</button>
            <button type="button" className="btn btn-ghost" onClick={handleReceipt}>Baixar comprovante</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PixPayment({ orderNumber, total, onBack, onConfirm, orderError }) {
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const txid = orderToTxid(orderNumber)
  const payload = buildPixPayload({ amount: total, txid })

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(payload, { width: 260, margin: 1 }).then((url) => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [payload])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard indisponível, usuário pode selecionar o texto manualmente
    }
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      await onConfirm()
    } catch {
      setConfirming(false)
    }
  }

  return (
    <div className="checkout-form pix-payment card">
      <h1>Pague com Pix</h1>
      <p className="field-hint">
        Escaneie o QR Code no app do seu banco ou copie o código abaixo. O valor já vem preenchido.
      </p>

      <div className="pix-amount">R$ {total.toFixed(2).replace('.', ',')}</div>

      <div className="pix-qr-wrap">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR Code Pix para pagamento de R$ ${total.toFixed(2).replace('.', ',')}`} width={260} height={260} />
        ) : (
          <div className="pix-qr-loading" aria-hidden="true" />
        )}
      </div>

      <div className="field">
        <label htmlFor="pix-copia-cola">Pix copia e cola</label>
        <div className="pix-copy-row">
          <input id="pix-copia-cola" type="text" readOnly value={payload} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn btn-outline" onClick={handleCopy}>
            {copied ? 'Copiado ✔' : 'Copiar'}
          </button>
        </div>
      </div>

      <ol className="pix-steps">
        <li>Abra o app do seu banco e escolha pagar via Pix.</li>
        <li>Escaneie o QR Code ou cole o código copiado.</li>
        <li>Confirme o pagamento de <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>.</li>
        <li>Depois de pagar, clique em "Já paguei" abaixo.</li>
      </ol>

      <p className="field-hint">
        Seu pedido fica com status <strong>Pendente</strong> até nossa equipe confirmar o recebimento do Pix.
      </p>

      {orderError && <p className="field-error">{orderError}</p>}

      <div className="checkout-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={confirming}>← Voltar</button>
        <button type="button" className="btn btn-accent" onClick={handleConfirm} disabled={confirming}>
          {confirming ? 'Registrando...' : 'Já paguei'}
        </button>
      </div>
    </div>
  )
}

function OrderSummary({ items, subtotal, shipping, total }) {
  return (
    <aside className="checkout-summary card">
      <h2>Resumo do pedido</h2>
      <ul className="summary-items">
        {items.map((item) => (
          <li key={item.key}>
            <span className="summary-item-image" aria-hidden="true">
              {isImageSrc(item.image) ? <img src={item.image} alt="" loading="lazy" /> : item.image}
            </span>
            <span className="summary-item-name">{item.name} × {item.qty}</span>
            <span>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
          </li>
        ))}
      </ul>
      <dl className="summary-lines">
        <div><dt>Subtotal</dt><dd>R$ {subtotal.toFixed(2).replace('.', ',')}</dd></div>
        <div>
          <dt>Frete</dt>
          <dd>{shipping > 0 ? `R$ ${shipping.toFixed(2).replace('.', ',')}` : 'Informe o CEP'}</dd>
        </div>
        <div className="summary-total"><dt>Total</dt><dd>R$ {total.toFixed(2).replace('.', ',')}</dd></div>
      </dl>
    </aside>
  )
}
