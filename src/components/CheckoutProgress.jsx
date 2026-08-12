import './CheckoutProgress.css'

const steps = ['Carrinho', 'Dados', 'Pagamento', 'Confirmação']

export default function CheckoutProgress({ current }) {
  return (
    <ol className="checkout-progress" aria-label="Progresso da compra">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const state = stepNum < current ? 'done' : stepNum === current ? 'current' : 'upcoming'
        return (
          <li key={step} className={`checkout-step ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="checkout-step-dot" aria-hidden="true">
              {state === 'done' ? '✓' : stepNum}
            </span>
            <span>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
