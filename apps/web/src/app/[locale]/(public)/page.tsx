import { backendFetch } from '@lib/api/server/backend';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { safeFetch } from '@lib/api/server/safe-fetch';
import type { ProblemsResponse } from '@/lib/types/api';
import MatchStepper from './components/matchStepper/matchStepper';
import HeadSvg from '@/assets/illustrations/head.svg';
import styles from './page.module.scss';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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

  // Prepare translations object for client component
  const problemTranslations = problems.reduce(
    (acc, problem) => {
      acc[problem.problemKey] = tProblems(problem.problemKey);
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <main className={styles.homeContainer}>
      {errorMessage ? (
        <div>
          <h3>{errorMessage}</h3>
        </div>
      ) : (
        <MatchStepper problems={problems} translations={problemTranslations} />
      )}
      <section className={styles.heroSection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HeadSvg.src} alt="Hero illustration" />
      </section>
    </main>
  );
}
