import { Link } from 'react-router-dom'
import { blogPosts } from '../data/products'
import './Blog.css'

export default function Blog() {
  return (
    <div className="container blog-page">
      <header className="catalog-header">
        <span className="eyebrow">Conteúdo educativo</span>
        <h1>Blog Brinca e Sente</h1>
        <p>Artigos para pais, professores e terapeutas sobre integração sensorial e desenvolvimento.</p>
      </header>

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article key={post.slug} className="blog-card card">
            <span className="badge badge-expert">{post.category}</span>
            <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.excerpt}</p>
            <span className="blog-meta">{post.readTime} de leitura</span>
          </article>
        ))}
      </div>
    </div>
  )
}
