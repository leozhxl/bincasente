import { Link } from 'react-router-dom'
import { products, testimonials, blogPosts } from '../data/products'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import './Home.css'

const heroShowcase = [
  { icon: '🖐️', label: 'Esfera Tátil', tile: 'tile-0' },
  { icon: '✨', label: 'Painel Luminoso', tile: 'tile-1' },
  { icon: '🌀', label: 'Kit Fidgets', tile: 'tile-2' },
  { icon: '🧩', label: 'Kit Terapêutico', tile: 'tile-3' },
]

const heroDots = ['dot-1', 'dot-2', 'dot-3', 'dot-4', 'dot-5', 'dot-6']

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-wave hero-wave-top" aria-hidden="true" />
        <div className="hero-wave hero-wave-base" aria-hidden="true" />
        {heroDots.map((d) => (
          <span key={d} className={`hero-deco ${d}`} aria-hidden="true">
            {d === 'dot-2' || d === 'dot-5' ? '✦' : '●'}
          </span>
        ))}

        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-title-brinca">Brinca</span>
              <span className="hero-title-sente">&amp; Sente,</span>
            </h1>
            <p className="hero-banner-pill">aprender brincando é muito mais divertido!</p>
            <p className="hero-desc">
              Produtos sensoriais 3D pensados para crianças e adultos neurodivergentes, com curadoria de
              terapeutas ocupacionais e materiais testados para segurança e conforto.
            </p>
            <div className="hero-actions">
              <Link to="/loja" className="btn btn-accent">
                Explorar catálogo
              </Link>
              <Link to="/sobre" className="btn btn-outline">
                Conhecer nossa missão
              </Link>
            </div>
            <dl className="hero-stats">
              <div>
                <dt>+8.000</dt>
                <dd>famílias atendidas</dd>
              </div>
              <div>
                <dt>+120</dt>
                <dd>produtos com curadoria</dd>
              </div>
              <div>
                <dt>4,9 ★</dt>
                <dd>avaliação média</dd>
              </div>
            </dl>
          </div>
          <div className="hero-visual">
            <div className="hero-crate" aria-hidden="true">
              <div className="hero-crate-grid">
                {heroShowcase.map((item) => (
                  <div key={item.label} className={`hero-mockup-tile ${item.tile}`}>
                    <span className="hero-mockup-icon">{item.icon}</span>
                    <span className="hero-mockup-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-rating-card">
              <span className="stars" aria-hidden="true">★★★★★</span>
              <strong>4,9</strong>
              <span>+2.400 avaliações</span>
            </div>

            <div className="hero-badge-card">
              <span aria-hidden="true">🩺</span>
              <div>
                <strong>Aprovado</strong>
                <span>por terapeutas ocupacionais</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-trust-strip">
          <div className="container hero-trust-strip-inner">
            <span>🔒 Compra 100% segura</span>
            <span>🧪 Materiais testados</span>
            <span>🚚 Rastreio em tempo real</span>
            <span>↩️ Trocas em até 30 dias</span>
            <span>💬 Suporte humanizado</span>
          </div>
        </div>
      </section>

      <Reveal as="section" className="section featured-section">
        <div className="container">
          <h2 className="best-sellers-title">
            <span aria-hidden="true">◄◄◄◄◄◄◄◄◄◄</span> MAIS VENDIDOS <span aria-hidden="true">►►►►►►►►►►</span>
          </h2>

          <div className="product-grid">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60}>
                <ProductCard product={p} checkered={i % 3 === 0} />
              </Reveal>
            ))}
          </div>

          <div className="featured-more">
            <Link to="/loja" className="btn btn-outline">
              Ver catálogo com filtros →
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section testimonial-section">
        <div className="container">
          <span className="eyebrow">Depoimentos</span>
          <h2>Confiado por famílias e terapeutas</h2>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="testimonial card">
                <span className="testimonial-stars stars" aria-hidden="true">★★★★★</span>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <footer>
                  <span className="testimonial-avatar" aria-hidden="true">{t.name.charAt(0)}</span>
                  <span className="testimonial-meta">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="trust-badges">
            <span className="badge badge-expert">Compra 100% segura</span>
            <span className="badge badge-expert">Produtos testados</span>
            <span className="badge badge-expert">Atóxico e hipoalergênico</span>
            <span className="badge badge-expert">Parceria com terapeutas ocupacionais</span>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section blog-preview-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="eyebrow">Conteúdo educativo</span>
              <h2>Para pais, professores e terapeutas</h2>
            </div>
            <Link to="/blog" className="btn btn-ghost">
              Ver blog completo →
            </Link>
          </div>
          <div className="blog-preview-grid">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-preview-card card">
                <span className="badge badge-expert">{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="blog-meta">{post.readTime} de leitura →</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section newsletter-section">
        <div className="container newsletter-inner">
          <div>
            <h2>Ganhe 10% na primeira compra</h2>
            <p>Receba conteúdos sobre desenvolvimento sensorial e novidades do catálogo.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="visually-hidden">
              Seu e-mail
            </label>
            <input id="newsletter-email" type="email" placeholder="seuemail@exemplo.com" required />
            <button type="submit" className="btn btn-accent">
              Quero meu cupom
            </button>
          </form>
        </div>
      </Reveal>
    </>
  )
}
