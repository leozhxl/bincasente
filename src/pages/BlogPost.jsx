import { Link, useParams } from 'react-router-dom'
import { blogPosts } from '../data/products'
import './Blog.css'

const fallbackContent = [
  {
    type: 'p',
    text: 'A integração sensorial é o processo pelo qual o sistema nervoso recebe, organiza e interpreta informações vindas dos sentidos. Quando esse processo apresenta dificuldades, atividades simples do dia a dia podem se tornar desafiadoras. Produtos sensoriais bem projetados oferecem estímulos controlados que apoiam a autorregulação e o desenvolvimento de habilidades.',
  },
  {
    type: 'p',
    text: 'Recomendamos sempre consultar um terapeuta ocupacional para orientações específicas sobre o perfil sensorial de cada pessoa antes de iniciar o uso de novos produtos.',
  },
]

function ContentBlock({ block, index }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>
    case 'h3':
      return <h3>{block.text}</h3>
    case 'ul':
      return (
        <ul className="blog-post-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    default:
      return <p key={index}>{block.text}</p>
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="container section">
        <h1>Artigo não encontrado</h1>
        <Link to="/blog" className="btn btn-primary">Voltar ao blog</Link>
      </div>
    )
  }

  const content = post.content || fallbackContent

  return (
    <article className="container blog-post">
      <span className="badge badge-expert">{post.category}</span>
      <h1>{post.title}</h1>
      <span className="blog-meta">{post.readTime} de leitura</span>
      <p className="blog-post-excerpt">{post.excerpt}</p>

      {content.map((block, i) => (
        <ContentBlock key={i} block={block} index={i} />
      ))}

      <Link to="/blog" className="btn btn-outline">← Voltar ao blog</Link>
    </article>
  )
}
