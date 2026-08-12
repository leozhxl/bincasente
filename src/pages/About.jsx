import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="eyebrow">Nossa história</span>
          <h1>Design de alto padrão a serviço da inclusão</h1>
          <p>
            A Brinca e Sente nasceu do encontro entre design e terapia ocupacional: acreditamos que produtos
            sensoriais podem ser, ao mesmo tempo, tecnicamente rigorosos e esteticamente extraordinários —
            sem infantilizar quem os usa.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <h2>Nossa missão</h2>
            <p>
              Oferecer produtos sensoriais 3D que apoiem a autonomia, o bem-estar e o desenvolvimento de
              pessoas com autismo, TDAH, deficiência intelectual, deficiência visual, paralisia cerebral e
              outras condições — com curadoria técnica e respeito à individualidade de cada pessoa.
            </p>
            <h2>Como escolhemos nossos produtos</h2>
            <p>
              Cada item passa por avaliação de uma equipe multidisciplinar composta por terapeutas
              ocupacionais, fisioterapeutas e educadores especializados, considerando segurança, propósito
              terapêutico e qualidade dos materiais.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat card">
              <strong>+120</strong>
              <span>produtos com curadoria técnica</span>
            </div>
            <div className="stat card">
              <strong>+8.000</strong>
              <span>famílias atendidas</span>
            </div>
            <div className="stat card">
              <strong>15</strong>
              <span>terapeutas parceiros</span>
            </div>
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
