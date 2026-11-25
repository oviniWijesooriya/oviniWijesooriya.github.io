import { certifications, education, journey, languages, projects, researchTitle, skills } from '../data'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function About() {
  useSeo(pageMeta('about'))
  return (
    <>
      <header className="container page-head page-head-split">
        <div>
          <h1 className="page-title">About</h1>
          <p className="page-lede">
            I'm an ambitious, enthusiastic person who thrives in dynamic, challenging environments. I adapt fast, love to learn, and stay calm under pressure.
          </p>
          <p className="page-body">
            From food-quality labs to conference stages, I bring strong communication and leadership to every team I join, whether I'm presenting research,
            running events with AIESEC, or writing for a media society.
          </p>
        </div>
        <img className="about-photo" src="/ovini.jpg" alt="Ovini Wijesooriya" width="800" height="1000" />
      </header>

      <section className="container block" aria-labelledby="research-h">
        <h2 id="research-h" className="section-title">
          Research and projects
        </h2>
        <div className="project-grid">
          {projects.map((p, i) => (
            <article key={p.title} className={`project ${i === 0 ? 'project-green' : 'project-gold'}`}>
              <p className="project-tag">{p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              {p.badge && <p className="project-badge">{p.badge}</p>}
              {p.href && (
                <a className="text-link" href={p.href} target="_blank" rel="noreferrer">
                  Visit {p.href.replace('https://', '')}
                </a>
              )}
            </article>
          ))}
        </div>
        <p className="research-title">
          <strong>Research title.</strong> {researchTitle}
        </p>
      </section>

      <section className="container block" aria-labelledby="exp-h">
        <h2 id="exp-h" className="section-title">
          Experience
        </h2>
        {journey.map((g) => (
          <div key={g.id} className="exp-group">
            <h3 className="exp-group-title">{g.label}</h3>
            <ul className="exp-list">
              {g.items.map((it) => (
                <li key={it.role + it.org} className="exp-item">
                  <span className="exp-when">{it.when}</span>
                  <div>
                    <h4>{it.role}</h4>
                    <p>{it.org}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="container block" aria-labelledby="edu-h">
        <h2 id="edu-h" className="section-title">
          Education
        </h2>
        <ol className="timeline">
          {education.map((e) => (
            <li key={e.title} className={e.current ? 'is-current' : ''}>
              <span className="exp-when">{e.when}</span>
              <h3>{e.title}</h3>
              <p>{e.place}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container block skills-block" aria-labelledby="skills-h">
        <h2 id="skills-h" className="section-title">
          Skills, certificates and languages
        </h2>
        <div className="skills-grid">
          <div>
            <h3 className="mini-title">Skills</h3>
            <ul className="chips">
              {skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mini-title">Certificates</h3>
            <ul className="plain-list">
              {certifications.map((c) => (
                <li key={c.name}>
                  {c.name}
                  {c.by && <span>, {c.by}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mini-title">Languages</h3>
            <ul className="plain-list">
              {languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
