import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <footer className="site-footer">
      <div className="footer-newsletter-band">
        <div className="container footer-newsletter-inner">
          <form className="footer-newsletter-form" onSubmit={handleSubmit}>
            <label htmlFor="footer-newsletter-email" className="visually-hidden">
              Seu e-mail
            </label>
            <span className="footer-newsletter-label">
              Cadastre-se e receba a<br />Newsletter com Novidades
            </span>
            <input
              id="footer-newsletter-email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" aria-label="Cadastrar e-mail">→</button>
          </form>
          {sent && <p className="footer-newsletter-sent" role="status">✔ Cadastrado! Fique de olho no seu e-mail.</p>}

          <div className="footer-social">
            <span>Siga nos em nossas<br /><strong>Redes Sociais</strong></span>
            <a href="#" aria-label="Instagram da Brinca e Sente">📷</a>
          </div>
        </div>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-mark" aria-hidden="true">✋</span>
            <span className="logo-text">Brinca e Sente</span>
          </div>
          <p>Produtos sensoriais de alta qualidade para pessoas com deficiência, com curadoria de terapeutas ocupacionais.</p>
        </div>

        <nav aria-label="Conteúdo">
          <h2>Conteúdo</h2>
          <ul>
            <li><Link to="/contato">Fale Conosco</Link></li>
            <li><Link to="/faq">Meios de pagamento e de frete</Link></li>
            <li><Link to="/acessibilidade">Política de privacidade</Link></li>
            <li><Link to="/politica-trocas">Política de Trocas e Devoluções</Link></li>
            <li><Link to="/sobre">Quem somos</Link></li>
          </ul>
        </nav>

        <div>
          <h2>Pague com</h2>
          <ul className="footer-badges">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Elo</li>
            <li>Pix</li>
            <li>Boleto</li>
          </ul>
        </div>

        <div className="footer-seal-block">
          <h2>Selos</h2>
          <div className="footer-seal">
            <span aria-hidden="true">🛡️</span>
            <span>
              COMPRA SEGURA
              <br />SITE PROTEGIDO
            </span>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Brinca e Sente — Produtos sensoriais para todas as pessoas.</p>
      </div>
    </footer>
  )
}
