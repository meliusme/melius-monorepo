'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './iconButton.module.scss';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ariaLabel: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  disableTranslate?: boolean;
};

export default function IconButton({
  type = 'button',
  ariaLabel,
  onClick,
  icon,
  disabled = false,
  disableTranslate = false,
  className,
  ...rest
}: IconButtonProps) {
  const buttonClassName = [
    styles.button,
    disableTranslate ? styles.noTranslate : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const renderedIcon = icon ?? <ArrowLeft aria-hidden="true" />;

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      className={buttonClassName}
      disabled={disabled}
      {...rest}
    >
      <span className={styles.icon}>{renderedIcon}</span>
    </button>
  );
}
