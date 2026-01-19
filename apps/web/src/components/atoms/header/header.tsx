import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>melius</h1>
    </header>
  );
}
