import './About.css'
import './Home.css'

const steps = [
  {
    icon: '🔍',
    title: 'Escolha por necessidade',
    text: 'Filtre por condição, faixa etária ou tipo de estímulo e encontre o produto certo em segundos.',
  },
  {
    icon: '🧑‍⚕️',
    title: 'Curadoria terapêutica',
    text: 'Cada item é avaliado por terapeutas ocupacionais antes de chegar ao catálogo.',
  },
  {
    icon: '📦',
    title: 'Receba com cuidado',
    text: 'Embalagem protegida, informações claras e frete rastreado até a sua porta.',
  },
  {
    icon: '💬',
    title: 'Orientação, se precisar',
    text: 'Tem dúvida sobre qual item é mais adequado? Fale com a gente antes de finalizar a compra.',
  },
  {
    icon: '📍',
    title: 'Acompanhe a entrega',
    text: 'Você recebe atualizações do pedido e pode consultar o status a qualquer momento em "Minha Conta".',
  },
]

export default function HowItWorks() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="eyebrow">Como funciona</span>
          <h1>Da escolha à porta da sua casa</h1>
          <p>
            Simplificamos o processo de compra para que você encontre e receba os produtos sensoriais certos
            com tranquilidade.
          </p>
        </div>
      </section>

      <section className="section how-section">
        <div className="container">
          <div className="how-grid">
            {steps.map((s, i) => (
              <div key={s.title} className="how-card">
                <span className="how-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="how-icon" aria-hidden="true">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section partners-section">
        <div className="container">
          <h2>Ficou com alguma dúvida?</h2>
          <div className="partner-badges">
            <span className="badge badge-expert">Consulte nosso FAQ</span>
            <span className="badge badge-expert">Fale Conosco</span>
          </div>
        </div>
      </section>
    </div>
  )
}
