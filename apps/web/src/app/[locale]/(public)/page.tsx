import { backendFetch } from '@lib/api/server/backend';
import type { ApiResponse } from '@lib/api/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { safeFetch } from '@lib/api/server/safe-fetch';
import ProblemList from './components/problemList/problemList';
import HeadSvg from '@/assets/illustrations/head.svg';
import styles from './page.module.scss';

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
      <section className={styles.problemsSection}>
        <div className={styles.headerSection}>
          <h1 className={styles.header}>{t('problemsHeader')}</h1>
          <p className={styles.subheader}>{t('problemsSubheader')}</p>
        </div>
        {errorMessage ? (
          <div>
            <h3>{errorMessage}</h3>
          </div>
        ) : (
          <ProblemList problems={problems} translations={problemTranslations} />
        )}
      </section>
      <section className={styles.heroSection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HeadSvg.src} alt="Hero illustration" />
      </section>
    </main>
  );
}
