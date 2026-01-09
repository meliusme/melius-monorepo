import { backendFetch } from 'src/lib/api/backend';
import type { ApiResponse } from 'src/lib/api/types';

type ProblemsResponse = ApiResponse<'/matches/problems', 'get'>;

export default async function Home() {
  const problems = await backendFetch<ProblemsResponse>({
    method: 'GET',
    path: '/matches/problems',
    auth: false,
  });

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">Problems</div>
        <h1>Available problem areas</h1>
        <p className="lede">Fetched from the backend as a server component.</p>
      </section>

      <section className="grid">
        {problems.map((problem) => (
          <article key={problem.id} className="card">
            <h3>{problem.problemKey}</h3>
            <p>ID: {problem.id}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
