import { Link } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import './AccessibilityBar.css'

const themeIcon = { light: '☀️', dark: '🌙', system: '🖥️' }
const themeLabel = { light: 'Tema claro', dark: 'Tema escuro', system: 'Tema automático' }

export default function AccessibilityBar() {
  const { theme, toggleTheme } = useAccessibility()

  return (
    <div className="a11y-bar" role="region" aria-label="Atendimento">
      <div className="container a11y-bar-inner">
        <Link to="/contato" className="a11y-support">
          <span aria-hidden="true">🎧</span> Atendimento ao cliente
        </Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`${themeLabel[theme]}. Clique para alternar o tema.`}
        >
          <span aria-hidden="true">{themeIcon[theme]}</span> {themeLabel[theme]}
        </button>
      </div>
    </div>
  )
}
