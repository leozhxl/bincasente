import './WhatsAppButton.css'

export default function WhatsAppButton() {
  return (
    <a
      className="whatsapp-btn"
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp (abre em nova aba)"
    >
      <span aria-hidden="true">💬</span>
    </a>
  )
}
