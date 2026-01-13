import styles from './item.module.scss';

interface ItemProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

export function Item({ title, selected, onClick }: ItemProps) {
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
      <span className={styles.title}>{title}</span>

      <div className={styles.select}>
        {selected ? <div className={styles.selection} /> : null}
      </div>
    </div>
  );
}
