import { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const errs = {}
    if (!data.get('nome')?.trim()) errs.nome = 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(data.get('email'))) errs.email = 'Informe um e-mail válido.'
    if (!data.get('mensagem')?.trim()) errs.mensagem = 'Escreva sua mensagem.'
    setErrors(errs)
    if (Object.keys(errs).length === 0) setSent(true)
  }

  return (
    <div className="container contact-page">
      <header className="catalog-header">
        <h1>Fale Conosco</h1>
        <p>Estamos aqui para ajudar. Responda o formulário ou fale conosco pelo WhatsApp.</p>
      </header>

      <div className="contact-grid">
        <form className="contact-form card" onSubmit={handleSubmit} noValidate>
          {sent ? (
            <p role="status" className="field-hint">Mensagem enviada! Responderemos em até 1 dia útil.</p>
          ) : (
            <>
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" name="nome" type="text" aria-invalid={!!errors.nome} aria-describedby={errors.nome ? 'err-nome' : undefined} />
                {errors.nome && <p className="field-error" id="err-nome">{errors.nome}</p>}
              </div>
              <div className="field">
                <label htmlFor="email">E-mail</label>
                <input id="email" name="email" type="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                {errors.email && <p className="field-error" id="err-email">{errors.email}</p>}
              </div>
              <div className="field">
                <label htmlFor="assunto">Assunto</label>
                <select id="assunto" name="assunto">
                  <option>Dúvida sobre produto</option>
                  <option>Pedido e entrega</option>
                  <option>Trocas e devoluções</option>
                  <option>Acessibilidade</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="mensagem">Mensagem</label>
                <textarea id="mensagem" name="mensagem" aria-invalid={!!errors.mensagem} aria-describedby={errors.mensagem ? 'err-mensagem' : undefined}></textarea>
                {errors.mensagem && <p className="field-error" id="err-mensagem">{errors.mensagem}</p>}
              </div>
              <button type="submit" className="btn btn-accent btn-block">Enviar mensagem</button>
            </>
          )}
        </form>

        <div className="contact-info">
          <div className="card contact-info-card">
            <h2>Outros canais</h2>
            <p>💬 WhatsApp: (00) 00000-0000</p>
            <p>📧 E-mail: contato@brincaesente.com.br</p>
            <p>🕐 Atendimento: seg. a sex., 9h às 18h</p>
          </div>
          <div className="card contact-info-card">
            <h2>Acessibilidade no atendimento</h2>
            <p>Oferecemos atendimento por texto, chamada de voz ou vídeo com legendas, conforme sua preferência.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
