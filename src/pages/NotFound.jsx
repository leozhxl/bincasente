import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1>Página não encontrada</h1>
      <p>O endereço que você tentou acessar não existe ou foi movido.</p>
      <Link to="/" className="btn btn-primary">Voltar para a página inicial</Link>
    </div>
  )
}
