import './About.css'
import './Home.css'

const steps = [
  {
    icon: '🔍',
    title: 'Escolha o seu produto',
    text: 'Explore nossa coleção e encontre produtos sensoriais que combinam com diferentes preferências, idades e formas de sentir, brincar e explorar.',
  },
  {
    icon: '🛒',
    title: 'Faça seu pedido',
    text: 'Selecione seus produtos favoritos, adicione ao carrinho e finalize sua compra de forma prática pelo nosso site.',
  },
  {
    icon: '📦',
    title: 'Preparamos com cuidado',
    text: 'Cada pedido é separado e preparado com atenção para que os produtos cheguem até você prontos para proporcionar novas experiências.',
  },
  {
    icon: '📍',
    title: 'Receba onde estiver',
    text: 'Seu pedido é enviado para o endereço escolhido, para que a experiência Brinca & Sente chegue até você com praticidade e tranquilidade.',
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
            Na Brinca &amp; Sente, queremos que escolher uma experiência sensorial seja simples, segura e
            especial. Por isso, cuidamos de cada etapa, desde a escolha do produto até a chegada do seu
            pedido.
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
          <blockquote className="about-pullquote">
            <p>Escolha. Sinta. Explore. Descubra.</p>
            <footer>
              Porque cada pessoa tem seu jeito de sentir o mundo — e acreditamos que essa experiência merece
              ser especial.
            </footer>
          </blockquote>
        </div>
      </section>
    </div>
  )
}
