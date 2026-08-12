import { useRef, useState } from 'react'
import './ProductViewer3D.css'

export default function ProductViewer3D({ emoji, name }) {
  const [rotation, setRotation] = useState(0)
  const dragRef = useRef(null)

  function handlePointerDown(e) {
    dragRef.current = e.clientX
  }

  function handlePointerMove(e) {
    if (dragRef.current === null) return
    const delta = e.clientX - dragRef.current
    setRotation((r) => r + delta * 0.6)
    dragRef.current = e.clientX
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function step(dir) {
    setRotation((r) => r + dir * 30)
  }

  return (
    <div className="viewer3d">
      <div
        className="viewer3d-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label={`Visualização 3D de ${name}. Use os botões abaixo ou arraste para girar.`}
      >
        <span className="viewer3d-object" style={{ transform: `rotateY(${rotation}deg)` }}>
          {emoji}
        </span>
      </div>
      <div className="viewer3d-controls">
        <button type="button" className="btn btn-ghost" onClick={() => step(-1)} aria-label="Girar para a esquerda">
          ⟲ Girar
        </button>
        <span className="viewer3d-hint">Arraste a imagem para girar 360°</span>
        <button type="button" className="btn btn-ghost" onClick={() => step(1)} aria-label="Girar para a direita">
          Girar ⟳
        </button>
      </div>
    </div>
  )
}
