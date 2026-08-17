import './ProductViewer3D.css'

export default function ProductViewer3D({ emoji, name }) {
  return (
    <div className="viewer3d">
      <div className="viewer3d-stage" role="img" aria-label={name}>
        <span className="viewer3d-object">
          {emoji?.startsWith('/') ? <img src={emoji} alt={name} /> : emoji}
        </span>
      </div>
    </div>
  )
}
