import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-mark" aria-hidden="true">✋</span>
            <span className="logo-text">Brinca e Sente</span>
          </div>
          <p>Produtos sensoriais de alta qualidade para pessoas com deficiência, com curadoria de terapeutas ocupacionais.</p>
          <div className="footer-social" aria-label="Redes sociais">
            <a href="#" aria-label="Instagram da Brinca e Sente">📷</a>
            <a href="#" aria-label="Facebook da Brinca e Sente">📘</a>
            <a href="#" aria-label="WhatsApp da Brinca e Sente">💬</a>
          </div>
        </div>

        <nav aria-label="Institucional">
          <h2>Institucional</h2>
          <ul>
            <li><Link to="/sobre">Sobre Nós</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/acessibilidade">Acessibilidade do Site</Link></li>
            <li><Link to="/politica-trocas">Trocas e Devoluções</Link></li>
          </ul>
        </nav>

        <nav aria-label="Ajuda">
          <h2>Ajuda</h2>
          <ul>
            <li><Link to="/faq">Perguntas Frequentes</Link></li>
            <li><Link to="/contato">Fale Conosco</Link></li>
            <li><Link to="/conta">Minha Conta</Link></li>
            <li><Link to="/carrinho">Meu Carrinho</Link></li>
          </ul>
        </nav>

        <div>
          <h2>Pagamento e segurança</h2>
          <ul className="footer-badges">
            <li>Pix</li>
            <li>Cartão</li>
            <li>Boleto</li>
            <li>Compra segura</li>
            <li>Site LGPD</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Brinca e Sente — Produtos sensoriais para todas as pessoas.</p>
      </div>
    </footer>
  )
}
