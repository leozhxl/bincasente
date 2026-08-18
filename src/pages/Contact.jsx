import { useState } from 'react'
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import './About.css'
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
    <div className="contact-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow-pill">Estamos aqui</span>
          <h1 className="about-hero-title">
            Fale <span className="about-hero-title-accent">Conosco</span>
          </h1>
          <p className="about-lead">
            Responda o formulário ou fale conosco pelo WhatsApp — estamos aqui para ajudar.
          </p>
        </div>
      </section>

      <div className="container contact-content">
        <div className="contact-grid">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
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
            <div className="contact-info-card">
              <h2>Outros canais</h2>
              <ul className="contact-channel-list">
                <li>
                  <span className="contact-channel-icon" aria-hidden="true"><MessageCircle size={18} /></span>
                  WhatsApp: (48) 99154-2845
                </li>
                <li>
                  <span className="contact-channel-icon" aria-hidden="true"><Mail size={18} /></span>
                  E-mail: brincaesente@gmail.com
                </li>
                <li>
                  <span className="contact-channel-icon" aria-hidden="true"><MapPin size={18} /></span>
                  Estrada Geral, s/n, Encruzo — São João do Sul/SC, CEP 88970-000
                </li>
                <li>
                  <span className="contact-channel-icon" aria-hidden="true"><Clock size={18} /></span>
                  Atendimento: seg. a sex., 9h às 18h
                </li>
              </ul>
            </div>
            <div className="contact-info-card">
              <h2>Acessibilidade no atendimento</h2>
              <p>Oferecemos atendimento por texto, chamada de voz ou vídeo com legendas, conforme sua preferência.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
