import { Link } from 'react-router-dom'
import './AccessibilityBar.css'

export default function AccessibilityBar() {
  return (
    <div className="a11y-bar" role="region" aria-label="Atendimento">
      <div className="container a11y-bar-inner">
        <Link to="/contato" className="a11y-support">
          <span aria-hidden="true">🎧</span> Atendimento ao cliente
        </Link>
      </div>
    </div>
  )
}
