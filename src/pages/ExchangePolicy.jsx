import './AccessibilityPage.css'

export default function ExchangePolicy() {
  return (
    <div className="container accessibility-page">
      <header className="catalog-header">
        <h1>Política de Trocas, Devoluções e Acessibilidade</h1>
        <p>Transparência é parte do nosso compromisso com você.</p>
      </header>

      <section className="a11y-section card">
        <h2>Prazo para troca ou devolução</h2>
        <p>Você tem até 30 dias corridos após o recebimento do produto para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor (7 dias por arrependimento + prazo estendido de cortesia).</p>
      </section>

      <section className="a11y-section card">
        <h2>Como solicitar</h2>
        <p>Acesse "Minha Conta &gt; Pedidos", selecione o pedido desejado e clique em "Solicitar troca/devolução", ou entre em contato pelo nosso suporte.</p>
      </section>

      <section className="a11y-section card">
        <h2>Condições do produto</h2>
        <p>O produto deve estar sem sinais de uso, com embalagem original. Em caso de defeito de fabricação, o frete de devolução é gratuito.</p>
      </section>

      <section className="a11y-section card">
        <h2>Reembolso</h2>
        <p>O reembolso é processado em até 10 dias úteis após o recebimento e análise do produto devolvido, na mesma forma de pagamento utilizada na compra.</p>
      </section>
    </div>
  )
}
