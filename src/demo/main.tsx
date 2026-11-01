import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const stats = [
  { label: 'UX score', value: '96%' },
  { label: 'Avg. time', value: '1.8m' },
  { label: 'Engagement', value: '+42%' }
];

const features = [
  'Component mode selection',
  'Computed style capture',
  'Framework detection',
  'AI-friendly payloads'
];

const cards = [
  { title: 'Growth funnel', body: 'New users from organic search have accelerated after the redesign.', tag: 'High conversion' },
  { title: 'Retention health', body: 'Returning visitors and account-level engagement are trending upward.', tag: 'Stable' },
  { title: 'Campaign lift', body: 'Paid social experiments now convert more efficiently than last quarter.', tag: '+28%' }
];

function App() {
  return (
    <div className="demo-shell">
      <header className="demo-header">
        <div className="brand-group">
          <div className="brand-dot">A</div>
          <div>
            <p className="eyebrow">Advait demo</p>
            <h1>Design intelligence for AI-ready UI capture</h1>
          </div>
        </div>
        <button type="button" className="cta-button">Export capture</button>
      </header>

      <nav className="demo-nav">
        <span>Overview</span>
        <span>Components</span>
        <span>Insights</span>
        <span>Reports</span>
      </nav>

      <main className="demo-grid">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="chip">Live product</p>
            <h2>Turn interface design into implementation-ready context.</h2>
            <p>
              Analyse layouts, styles, hierarchy, and core interaction signals from a live webpage,
              then export them as a structured payload for AI tools.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary">Inspect UI</button>
              <button type="button" className="secondary">View report</button>
            </div>
          </div>

          <div className="mini-panel">
            <div className="mini-header">
              <span className="dot green" />
              <span className="dot amber" />
              <span className="dot red" />
            </div>
            <div className="mini-graph">
              <span style={{ height: '28%' }} />
              <span style={{ height: '38%' }} />
              <span style={{ height: '54%' }} />
              <span style={{ height: '72%' }} />
              <span style={{ height: '95%' }} />
            </div>
          </div>
        </section>

        <aside className="stats-panel">
          {stats.map((item) => (
            <div key={item.label} className="stat-box">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </aside>

        <section className="feature-panel">
          <h3>Extraction capabilities</h3>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="cards-panel">
          {cards.map((card) => (
            <article key={card.title} className="info-card">
              <span className="tag">{card.tag}</span>
              <h4>{card.title}</h4>
              <p>{card.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('demo-root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
