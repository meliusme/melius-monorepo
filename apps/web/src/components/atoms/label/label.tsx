'use client';

import styles from './label.module.scss';

type LabelProps = {
  text: string;
  className?: string;
};

export default function Label({ text, className }: LabelProps) {
  const labelClassName = [styles.label, className ?? ''].filter(Boolean).join(' ');

  return <div className={labelClassName}>{text}</div>;
}
