import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, products, testimonials, blogPosts } from '../data/products'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import './Home.css'

const featuredTabs = [
  { id: 'best', label: 'Mais vendidos' },
  { id: 'new', label: 'Novidades' },
  { id: 'expert', label: 'Recomendados' },
]

const heroShowcase = [
  { icon: '🖐️', label: 'Esfera Tátil', tile: 'tile-0' },
  { icon: '✨', label: 'Painel Luminoso', tile: 'tile-1' },
  { icon: '🌀', label: 'Kit Fidgets', tile: 'tile-2' },
  { icon: '🧩', label: 'Kit Terapêutico', tile: 'tile-3' },
]

export default function Home() {
  const [featuredTab, setFeaturedTab] = useState('best')
  const featured = products.filter((p) => p.badges.includes(featuredTab)).slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Sensorial · Inclusivo · Premium</span>
            <h1>Brincar e sentir, do jeito de cada pessoa</h1>
            <p>
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
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-mockup" aria-hidden="true">
              <div className="hero-mockup-grid">
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

      <Reveal as="section" className="section why-section">
        <div className="container">
          <span className="eyebrow">Por que Brinca e Sente?</span>
          <h2>Design de alto padrão a serviço da inclusão real</h2>
          <div className="why-grid">
            <div className="why-card card">
              <span className="why-icon" aria-hidden="true">🎓</span>
              <h3>Curadoria especializada</h3>
              <p>Cada produto é avaliado por terapeutas ocupacionais antes de entrar no catálogo.</p>
            </div>
            <div className="why-card card">
              <span className="why-icon" aria-hidden="true">🛡️</span>
              <h3>Segurança comprovada</h3>
              <p>Materiais atóxicos, hipoalergênicos e testados, com certificações de qualidade.</p>
            </div>
            <div className="why-card card">
              <span className="why-icon" aria-hidden="true">♿</span>
              <h3>Acessibilidade de verdade</h3>
              <p>Do site à embalagem, pensamos em autonomia para pessoas com diferentes necessidades.</p>
            </div>
            <div className="why-card card">
              <span className="why-icon" aria-hidden="true">💚</span>
              <h3>Propósito social</h3>
              <p>Parte da nossa receita apoia projetos de inclusão em escolas públicas.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section category-section">
        <div className="container">
          <span className="eyebrow">Categorias</span>
          <h2>Encontre o estímulo certo</h2>
          <div className="category-carousel">
            {categories.map((cat) => (
              <Link key={cat.slug} to={`/loja/${cat.slug}`} className="category-chip card">
                <span className="category-icon" aria-hidden="true">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-desc">{cat.description}</span>
                <span className="category-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section featured-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="eyebrow">Selecionados para você</span>
              <h2>Destaques do catálogo</h2>
            </div>
            <Link to="/loja" className="btn btn-ghost">
              Ver catálogo completo →
            </Link>
          </div>

          <div className="featured-tabs" role="tablist" aria-label="Filtrar destaques">
            {featuredTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={featuredTab === t.id}
                className={`featured-tab ${featuredTab === t.id ? 'active' : ''}`}
                onClick={() => setFeaturedTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {featured.length === 0 ? (
              <p className="field-hint">Nenhum produto nessa categoria de destaque no momento.</p>
            ) : (
              featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))
            )}
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
