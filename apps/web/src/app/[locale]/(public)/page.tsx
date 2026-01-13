import { backendFetch } from '@lib/api/server/backend';
import type { ApiResponse } from '@lib/api/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { safeFetch } from '@lib/api/server/safe-fetch';

type ProblemsResponse = ApiResponse<'/matches/problems', 'get'>;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const tProblems = await getTranslations('Problems');
  const tErrors = await getTranslations('Errors');

  const { data: problems, error: errorMessage } = await safeFetch(
    () =>
      backendFetch<ProblemsResponse>({
        method: 'GET',
        path: '/matches/problems',
        auth: false,
      }),
    tErrors,
    [],
  );

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">{t('eyebrow')}</div>
        <h1>{t('title')}</h1>
        <p className="lede">{t('lede')}</p>
      </section>

      <section className="grid">
        {errorMessage ? (
          <article className="card">
            <h3>{errorMessage}</h3>
          </article>
        ) : (
          problems.map((problem) => (
            <article key={problem.id} className="card">
              <h3>{tProblems(problem.problemKey)}</h3>
              <p>ID: {problem.id}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
