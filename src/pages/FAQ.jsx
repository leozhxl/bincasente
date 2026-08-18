import { useState } from 'react'
import './FAQ.css'

const faqData = {
  Compra: [
    { q: 'Quais formas de pagamento vocês aceitam?', a: 'Aceitamos Pix e cartão de crédito (em até 10x).' },
    { q: 'Posso comprar sem criar uma conta?', a: 'Sim, oferecemos checkout como visitante em todas as compras.' },
  ],
  Entrega: [
    { q: 'Qual o prazo de entrega?', a: 'O prazo médio é de 4 a 7 dias úteis, dependendo da sua região.' },
    { q: 'Vocês entregam em todo o Brasil?', a: 'Sim, entregamos para todo o território nacional.' },
  ],
  Produtos: [
    { q: 'Os produtos são seguros para crianças pequenas?', a: 'Todos os produtos indicam a faixa etária recomendada e passam por testes de segurança e materiais atóxicos.' },
    { q: 'Como escolher o produto certo para meu perfil sensorial?', a: 'Recomendamos usar nossos filtros por condição/necessidade ou conversar com nosso time, que pode orientar com base em indicações de terapeutas.' },
  ],
  Trocas: [
    { q: 'Como funciona a política de trocas?', a: 'Você tem até 30 dias corridos após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.' },
    { q: 'O frete de devolução é gratuito?', a: 'Sim, em casos de defeito de fabricação o frete de devolução é por nossa conta.' },
  ],
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState(null)

  return (
    <div className="container faq-page">
      <header className="catalog-header">
        <h1>Perguntas Frequentes</h1>
        <p>Organizado por tema para facilitar sua busca.</p>
      </header>

      {Object.entries(faqData).map(([theme, items]) => (
        <section key={theme} className="faq-theme">
          <h2>{theme}</h2>
          <div className="faq-list">
            {items.map((item, idx) => {
              const key = `${theme}-${idx}`
              const isOpen = openKey === key
              return (
                <div key={key} className="faq-item card">
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={`panel-${key}`}
                    id={`accordion-${key}`}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                  >
                    {item.q}
                    <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="faq-answer" id={`panel-${key}`} role="region" aria-labelledby={`accordion-${key}`}>
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
