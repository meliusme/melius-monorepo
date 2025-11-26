import Link from 'next/link';

const highlights = [
  {
    title: 'API-first foundation',
    body: 'NestJS backend wired for Prisma, auth, and background jobs so the frontend can ship faster.',
  },
  {
    title: 'Frontend ready to grow',
    body: 'Next.js app with typed routes, modern tooling, and a focused landing page to start iterating UI.',
  },
  {
    title: 'Monorepo workflow',
    body: 'One workspace for linting, builds, and shared contracts so backend and frontend stay in sync.',
  },
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">Melius platform</div>
        <h1>Ship faster with a unified stack.</h1>
        <p className="lede">
          A streamlined monorepo with NestJS for your API and Next.js for the web, ready for product work
          instead of scaffolding.
        </p>
        <div className="cta-row">
          <Link className="primary" href="#" aria-label="Start developing">
            Start developing
          </Link>
          <Link className="ghost" href="#" aria-label="View API docs">
            View API docs
          </Link>
        </div>
        <div className="badge">Backend runs at /apps/backend, frontend at /apps/web.</div>
      </section>

      <section className="grid">
        {highlights.map((item) => (
          <article key={item.title} className="card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div>
          <p className="label">What to do next</p>
          <h2>Connect the UI to your API.</h2>
          <p>
            Point API calls to your NestJS routes, add auth guards, and deploy the monorepo with the workflow
            you prefer. The structure is intentionally lean so you can swap tools without friction.
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span>01</span>
            <p>Run <code>pnpm install</code> at the repo root to hydrate workspace dependencies.</p>
          </div>
          <div className="step">
            <span>02</span>
            <p>Start both apps with <code>pnpm dev:backend</code> and <code>pnpm dev:web</code>.</p>
          </div>
          <div className="step">
            <span>03</span>
            <p>Build shared types or API clients in a shared package when you are ready.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
