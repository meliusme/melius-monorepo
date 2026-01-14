import { ReactNode } from 'react';
import styles from './card.module.scss';

type CardProps = {
  children: ReactNode;
  padding?: number;
};

export default function Card({ children, padding = 1 }: CardProps) {
  return (
    <div className={styles.card} style={{ padding: `${padding}rem` }}>
      {children}
    </div>
  );
}
