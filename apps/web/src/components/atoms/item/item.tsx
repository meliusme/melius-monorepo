import { memo, ReactNode } from 'react';
import styles from './item.module.scss';

interface ItemProps {
  id: number;
  icon: ReactNode;
  title: string;
  selected: boolean;
  onClick: (id: number) => void;
}

const Item = memo(function Item({ id, icon, title, selected, onClick }: ItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(id);
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
});

export default Item;
