import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <img src="/logo.png" alt="Brinca e Sente" className="footer-logo-image" />
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
