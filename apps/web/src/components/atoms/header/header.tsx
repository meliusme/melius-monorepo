import Logo from '@/assets/illustrations/logo.svg';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Logo.src} alt="Melius" className={styles.logo} />
      </div>
    </header>
  );
}
