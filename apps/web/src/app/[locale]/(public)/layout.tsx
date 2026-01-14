import type { ReactNode } from 'react';
import Logo from '@/assets/illustrations/logo.svg';
import styles from './layout.module.scss';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={Logo.src} alt="Melius" className={styles.logo} />
        </div>
      </header>
      {children}
    </>
  );
}
