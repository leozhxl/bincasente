import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import './About.css'
import './FAQ.css'

const faqData = {
  Compra: {
    icon: '💳',
    items: [
      { q: 'Quais formas de pagamento vocês aceitam?', a: 'Aceitamos Pix e cartão de crédito (em até 10x).' },
      { q: 'Posso comprar sem criar uma conta?', a: 'Sim, oferecemos checkout como visitante em todas as compras.' },
    ],
  },
  Entrega: {
    icon: '🚚',
    items: [
      { q: 'Qual o prazo de entrega?', a: 'O prazo médio é de 4 a 7 dias úteis, dependendo da sua região.' },
      { q: 'Vocês entregam em todo o Brasil?', a: 'Sim, entregamos para todo o território nacional.' },
    ],
  },
  Produtos: {
    icon: '🧸',
    items: [
      { q: 'Os produtos são seguros para crianças pequenas?', a: 'Todos os produtos indicam a faixa etária recomendada e passam por testes de segurança e materiais atóxicos.' },
      { q: 'Como escolher o produto certo para meu perfil sensorial?', a: 'Recomendamos usar nossos filtros por condição/necessidade ou conversar com nosso time, que pode orientar com base em indicações de terapeutas.' },
    ],
  },
  Trocas: {
    icon: '🔄',
    items: [
      { q: 'Como funciona a política de trocas?', a: 'Você tem até 30 dias corridos após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.' },
      { q: 'O frete de devolução é gratuito?', a: 'Sim, em casos de defeito de fabricação o frete de devolução é por nossa conta.' },
    ],
  },
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState(null)

  return (
    <div className="faq-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow-pill">Central de ajuda</span>
          <h1 className="about-hero-title">
            Perguntas <span className="about-hero-title-accent">Frequentes</span>
          </h1>
          <p className="about-lead">Organizamos por tema para você encontrar a resposta rapidinho.</p>
        </div>
      </section>

      <div className="container faq-content">
        {Object.entries(faqData).map(([theme, { icon, items }]) => (
          <section key={theme} className="faq-theme">
            <h2>
              <span className="faq-theme-icon" aria-hidden="true">{icon}</span>
              {theme}
            </h2>
            <div className="faq-list">
              {items.map((item, idx) => {
                const key = `${theme}-${idx}`
                const isOpen = openKey === key
                return (
                  <div key={key} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={`panel-${key}`}
                      id={`accordion-${key}`}
                      onClick={() => setOpenKey(isOpen ? null : key)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown size={20} className="faq-chevron" aria-hidden="true" />
                    </button>
                    <div
                      className="faq-answer-wrap"
                      id={`panel-${key}`}
                      role="region"
                      aria-labelledby={`accordion-${key}`}
                    >
                      <p className="faq-answer">{item.a}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
