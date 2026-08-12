import { useAccessibility } from '../context/AccessibilityContext'
import './AccessibilityPage.css'

export default function AccessibilityPage() {
  const { highContrast, toggleContrast, reducedMotion, toggleMotion } = useAccessibility()

  return (
    <div className="container accessibility-page">
      <header className="catalog-header">
        <h1>Acessibilidade do Site</h1>
        <p>Nosso compromisso é que este site seja utilizável por todas as pessoas, com ou sem deficiência.</p>
      </header>

      <section className="a11y-section card">
        <h2>Conformidade</h2>
        <p>Trabalhamos com base nas diretrizes WCAG 2.1, buscando o nível AA como padrão mínimo e o nível AAA sempre que possível.</p>
      </section>

      <section className="a11y-section card">
        <h2>Recursos disponíveis</h2>
        <ul>
          <li>Navegação completa por teclado em todas as páginas.</li>
          <li>Compatibilidade com leitores de tela, com textos alternativos em imagens.</li>
          <li>Modo de alto contraste, ativável no topo de qualquer página.</li>
          <li>Ajuste de tamanho de fonte independente do zoom do navegador.</li>
          <li>Opção de reduzir animações e movimento.</li>
          <li>Áreas clicáveis com no mínimo 44x44px.</li>
          <li>Formulários com rótulos claros e mensagens de erro compreensíveis.</li>
        </ul>
      </section>

      <section className="a11y-section card">
        <h2>Testar agora</h2>
        <div className="a11y-toggle-row">
          <button type="button" className="btn btn-outline" aria-pressed={highContrast} onClick={toggleContrast}>
            {highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
          </button>
          <button type="button" className="btn btn-outline" aria-pressed={reducedMotion} onClick={toggleMotion}>
            {reducedMotion ? 'Reativar animações' : 'Reduzir movimento'}
          </button>
        </div>
      </section>

      <section className="a11y-section card">
        <h2>Encontrou uma barreira de acessibilidade?</h2>
        <p>Entre em contato pelo e-mail <a href="mailto:acessibilidade@brincaesente.com.br">acessibilidade@brincaesente.com.br</a> — responderemos em até 2 dias úteis.</p>
      </section>
    </div>
  )
}
