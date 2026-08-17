import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow">Nossa história</span>
          <h1>Um novo jeito de brincar, sentir e aprender</h1>
          <p className="about-lead">
            A Brinca &amp; Sente nasceu da experiência clínica e da percepção de que o brincar pode ir muito
            além da diversão.
          </p>
        </div>
      </section>

      <section className="section about-story-section">
        <div className="container">
          <div className="about-story-card">
            <div className="about-story-grid">
              <div className="about-story-col">
                <p>
                  No dia a dia dos atendimentos, foi possível perceber como texturas, movimentos, encaixes,
                  formas e desafios podem despertar a curiosidade e transformar cada interação em uma
                  oportunidade de exploração, descoberta e aprendizagem.
                </p>
                <p>
                  Dessa experiência surgiu o desejo de criar uma marca que unisse conhecimento, criatividade,
                  funcionalidade e design, desenvolvendo produtos que proporcionassem experiências sensoriais
                  interessantes, acolhedoras e significativas.
                </p>
              </div>
              <div className="about-story-col">
                <p>
                  Assim nasceu a Brinca &amp; Sente, uma marca de produtos sensoriais 3D pensados para
                  crianças e adultos, incluindo pessoas neurodivergentes, valorizando as diferentes formas de
                  sentir, explorar e interagir com o mundo.
                </p>
                <p>
                  Cada produto é pensado com atenção aos detalhes, buscando proporcionar experiências por
                  meio do toque, do movimento, da manipulação e da descoberta, sempre respeitando a
                  individualidade de quem utiliza.
                </p>
              </div>
            </div>

            <blockquote className="about-pullquote">
              <p>Mais do que criar objetos, a Brinca &amp; Sente acredita em criar possibilidades.</p>
              <footer>
                Porque brincar também é sentir.<br />
                Sentir é descobrir.<br />
                E cada descoberta pode abrir um novo caminho para aprender.
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section partners-section">
        <div className="container">
          <h2>Parcerias e certificações</h2>
          <div className="partner-badges">
            <span className="badge badge-expert">Aprovado por terapeutas ocupacionais</span>
            <span className="badge badge-expert">Materiais atóxicos certificados</span>
            <span className="badge badge-expert">Hipoalergênico</span>
            <span className="badge badge-expert">Conformidade com normas de segurança infantil</span>
          </div>
        </div>
      </section>
    </div>
  )
}
