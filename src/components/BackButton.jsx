import { useLocation, useNavigate } from 'react-router-dom'
import './BackButton.css'

export default function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/') return null

  return (
    <div className="back-btn-bar container">
      <button type="button" className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        ← Voltar
      </button>
    </div>
  )
}
