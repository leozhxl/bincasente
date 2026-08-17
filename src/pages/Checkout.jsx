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
}

const paymentLabels = {
  pix: 'Pix',
  cartao: 'Cartão de crédito',
  boleto: 'Boleto bancário',
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useOrders()
  const navigate = useNavigate()
  const [step, setStep] = useState('dados')
  const [form, setForm] = useState({ ...emptyForm, email: user?.email || '', nome: user?.displayName || '' })
  const [errors, setErrors] = useState({})
  const [asGuest, setAsGuest] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [orderNumber] = useState(() => `BS-${Math.floor(100000 + Math.random() * 900000)}`)
  const [orderSnapshot, setOrderSnapshot] = useState(null)

  const shipping = 24.9
  const total = subtotal + shipping

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validateDados() {
    const errs = {}
    if (!form.nome.trim()) errs.nome = 'Informe seu nome completo.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Informe um e-mail válido.'
    if (form.cep.replace(/\D/g, '').length !== 8) errs.cep = 'CEP deve ter 8 dígitos.'
    if (!form.endereco.trim()) errs.endereco = 'Informe o endereço.'
    if (!form.cidade.trim()) errs.cidade = 'Informe a cidade.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleDadosSubmit(e) {
    e.preventDefault()
    if (validateDados()) setStep('pagamento')
  }

  async function handlePagamentoSubmit(e) {
    e.preventDefault()

    if (form.pagamento === 'pix') {
      setStep('pix')
      return
    }

    await finalizeOrder('Processando')
  }

  async function finalizeOrder(status) {
    const snapshotItems = items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))
    const whatsappItems = items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, color: i.color, benefits: i.benefits }))

    sendOrderToWhatsApp({ orderNumber, customer: form, items: whatsappItems, total })

    if (user) {
      await addOrder({
        id: orderNumber,
        date: new Date().toLocaleDateString('pt-BR'),
        status,
        total,
        items: snapshotItems,
      })
    }
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

            <div className="guest-toggle">
              <button type="button" className={asGuest ? 'active' : ''} onClick={() => setAsGuest(true)}>Comprar como visitante</button>
              <button type="button" className={!asGuest ? 'active' : ''} onClick={() => setAsGuest(false)}>Entrar / Cadastrar</button>
            </div>

            {!asGuest && (
              <div className="field">
                <label htmlFor="senha">Senha</label>
                <input id="senha" type="password" placeholder="Sua senha" />
              </div>
            )}

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
                <input id="telefone" type="tel" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="cpfCnpj">CPF ou CNPJ (opcional, para nota fiscal)</label>
              <input id="cpfCnpj" type="text" inputMode="numeric" value={form.cpfCnpj} onChange={(e) => update('cpfCnpj', e.target.value)} />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="cep">CEP</label>
                <input id="cep" type="text" inputMode="numeric" value={form.cep} onChange={(e) => update('cep', e.target.value)} aria-invalid={!!errors.cep} aria-describedby={errors.cep ? 'err-cep' : undefined} />
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

            <button type="submit" className="btn btn-accent btn-block">Continuar para pagamento</button>
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
                { id: 'boleto', label: 'Boleto bancário' },
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
              <>
                <div className="field">
                  <label htmlFor="numero-cartao">Número do cartão</label>
                  <input id="numero-cartao" type="text" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="validade">Validade</label>
                    <input id="validade" type="text" placeholder="MM/AA" />
                  </div>
                  <div className="field">
                    <label htmlFor="cvv">CVV</label>
                    <input id="cvv" type="text" inputMode="numeric" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="parcelas">Parcelamento</label>
                  <select id="parcelas">
                    <option>1x de R$ {total.toFixed(2).replace('.', ',')} sem juros</option>
                    <option>3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                    <option>6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros</option>
                  </select>
                </div>
              </>
            )}

            {form.pagamento === 'pix' && (
              <p className="field-hint">Ao confirmar, você receberá um QR Code Pix para pagamento imediato.</p>
            )}
            {form.pagamento === 'boleto' && (
              <p className="field-hint">O boleto vence em 3 dias úteis. O pedido é processado após a compensação.</p>
            )}

            <div className="checkout-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep('dados')}>← Voltar</button>
              <button type="submit" className="btn btn-accent">Confirmar pedido</button>
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
          />
          <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      )}

      {step === 'confirmacao' && (
        <div className="confirmation card">
          <span className="confirmation-icon" aria-hidden="true">✔</span>
          <h1>Pedido {form.pagamento === 'pix' ? 'registrado' : 'confirmado'}!</h1>
          <span className="whatsapp-confirm-badge">
            <span aria-hidden="true">✅</span> Enviamos os detalhes do pedido para o nosso WhatsApp
          </span>
          <p>Número do pedido: <strong>{orderNumber}</strong></p>
          {form.pagamento === 'pix' ? (
            <p>
              Assim que identificarmos o pagamento do Pix, seu pedido passa para <strong>Processando</strong>.
              Você pode acompanhar o status em <strong>Minha Conta</strong>.
            </p>
          ) : (
            <p>Enviamos um e-mail de confirmação para <strong>{form.email}</strong> com todos os detalhes.</p>
          )}
          <p>Prazo estimado de entrega: <strong>4 a 7 dias úteis</strong> após a confirmação do pagamento.</p>
          <p className="field-hint">
            A Nota Fiscal Eletrônica (NF-e) será enviada por e-mail assim que emitida. Enquanto isso, você pode
            baixar um comprovante da compra.
          </p>
          <div className="confirmation-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/conta')}>Acompanhar pedido</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/loja')}>Continuar comprando</button>
            <button type="button" className="btn btn-ghost" onClick={handleReceipt}>Baixar comprovante</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PixPayment({ orderNumber, total, onBack, onConfirm }) {
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
    await onConfirm()
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
            <span aria-hidden="true">{item.image}</span>
            <span className="summary-item-name">{item.name} × {item.qty}</span>
            <span>R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
          </li>
        ))}
      </ul>
      <dl className="summary-lines">
        <div><dt>Subtotal</dt><dd>R$ {subtotal.toFixed(2).replace('.', ',')}</dd></div>
        <div><dt>Frete</dt><dd>R$ {shipping.toFixed(2).replace('.', ',')}</dd></div>
        <div className="summary-total"><dt>Total</dt><dd>R$ {total.toFixed(2).replace('.', ',')}</dd></div>
      </dl>
    </aside>
  )
}
