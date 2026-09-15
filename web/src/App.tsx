import { useState } from 'react';
import {
  chains,
  code,
  facts,
  faq,
  finalCta,
  footer,
  GITHUB,
  hero,
  how,
  nav,
  pricing,
  problem,
  solution,
  useCases,
} from './content';

function Mark({ size = 32 }: { size?: number }) {
  return <img src="/chetta-mark.svg" width={size} height={size} alt="" className="mark" />;
}

function Wordmark() {
  return (
    <a className="lockup" href="#top" aria-label="ChettaPay home">
      <Mark size={30} />
      <span className="lockup-name">
        Chetta<span>Pay</span>
      </span>
    </a>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="nav-inner">
        <Wordmark />
        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">Menu</span>
          <span aria-hidden>{open ? '✕' : '☰'}</span>
        </button>
        <nav id="nav-links" className="nav-links" data-open={open}>
          {nav.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="btn btn-sm" href={GITHUB}>
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}

/** The cheetah-spot field used behind the dark sections. Deterministic, so the
 *  layout is identical between server render and client, and between builds. */
function Spots() {
  let seed = 11;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const spots = Array.from({ length: 120 }, (_, i) => {
    const x = rand() * 100;
    const y = rand() * 100;
    const r = 0.5 + rand() * 0.75;
    return <ellipse key={i} cx={`${x}%`} cy={`${y}%`} rx={`${r}%`} ry={`${r * 0.76}%`} />;
  });
  return (
    <svg className="spots" aria-hidden focusable="false">
      {spots}
    </svg>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <Spots />
      <div className="hero-glow" aria-hidden />
      <div className="wrap hero-inner">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1>{hero.title}</h1>
        <p className="lede">{hero.lede}</p>
        <div className="cta-row">
          <a className="btn" href={hero.primary.href}>
            {hero.primary.label}
          </a>
          <a className="btn btn-ghost" href={hero.secondary.href}>
            {hero.secondary.label}
          </a>
        </div>
        <p className="hero-note">{hero.note}</p>
      </div>
      <div className="wrap">
        <ul className="facts">
          {facts.map((f) => (
            <li key={f.label}>
              <span className="fact-value">{f.value}</span>
              <span className="fact-label">{f.label}</span>
              <span className="fact-sub">{f.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="section">
      <div className="wrap">
        <h2>{problem.title}</h2>
        <p className="section-lede">{problem.lede}</p>
        <div className="grid-3">
          {problem.cards.map((c) => (
            <article className="card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <p className="eyebrow eyebrow-dark">{solution.eyebrow}</p>
        <h2>{solution.title}</h2>
        <div className="grid-3">
          {solution.cards.map((c) => (
            <article className="card card-raised" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <p className="card-meta">{c.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <h2>{how.title}</h2>
        <p className="section-lede">{how.lede}</p>
        <ol className="steps">
          {how.steps.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <span className="step-time">{s.time}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Code() {
  return (
    <section className="section section-dark">
      <Spots />
      <div className="wrap code-grid">
        <div>
          <h2>{code.title}</h2>
          <p className="section-lede">{code.lede}</p>
          <p className="code-foot">{code.footnote}</p>
          <p className="mcp">{code.mcp}</p>
        </div>
        <pre className="code">
          <code>{code.snippet}</code>
        </pre>
      </div>
    </section>
  );
}

function Chains() {
  return (
    <section className="section" id="chains">
      <div className="wrap">
        <h2>{chains.title}</h2>
        <p className="section-lede">{chains.lede}</p>
        <ul className="chains">
          {chains.rows.map((r) => (
            <li key={r.name}>
              <div className="chain-head">
                <h3>{r.name}</h3>
                <span className="pill" data-planned={r.status === 'Planned'}>
                  {r.status}
                </span>
              </div>
              <p>{r.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <h2>{useCases.title}</h2>
        <div className="grid-3">
          {useCases.cards.map((c) => (
            <article className="card card-raised" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <p className="card-meta">Example: {c.example}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <h2>{pricing.title}</h2>
        <p className="section-lede">{pricing.lede}</p>
        <div className="grid-3">
          {pricing.cards.map((c) => (
            <article className="card price" key={c.title}>
              <h3>{c.title}</h3>
              <p className="price-value">{c.price}</p>
              <p>{c.body}</p>
            </article>
          ))}
        </div>
        <p className="disclaimer">{pricing.note}</p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="section section-alt">
      <div className="wrap">
        <h2>Frequently asked</h2>
        <div className="faq">
          {faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="section section-dark cta">
      <Spots />
      <div className="wrap">
        <h2>{finalCta.title}</h2>
        <p className="section-lede">{finalCta.lede}</p>
        <div className="cta-row">
          <a className="btn" href={finalCta.primary.href}>
            {finalCta.primary.label}
          </a>
          <a className="btn btn-ghost" href={finalCta.secondary.href}>
            {finalCta.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Wordmark />
          <p className="footer-tagline">{footer.tagline}</p>
          <p className="footer-pron">{footer.pronunciation}</p>
        </div>
        {footer.groups.map((g) => (
          <div key={g.title}>
            <h4>{g.title}</h4>
            <ul>
              {g.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap footer-base">
        <span>Apache-2.0</span>
        <span>&copy; {new Date().getFullYear()} ChettaPay</span>
      </div>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <How />
        <Code />
        <Chains />
        <UseCases />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
