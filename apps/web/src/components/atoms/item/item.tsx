import { ReactNode } from 'react';
import styles from './item.module.scss';

interface ItemProps {
  icon: ReactNode;
  title: string;
  selected: boolean;
  onClick: () => void;
}

export default function Item({ icon, title, selected, onClick }: ItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
    >
      <div className={styles.iconWrapper}>
        <div className={styles.icon}>{icon}</div>
      </div>

      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.select} />
    </div>
  );
}
