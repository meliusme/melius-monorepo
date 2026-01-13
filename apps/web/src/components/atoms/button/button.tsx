'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  width?: number;
  large?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export function Button({
  type = 'button',
  label,
  onClick,
  variant = 'primary',
  width,
  large = false,
  disabled = false,
  icon,
  className,
  ...rest
}: ButtonProps) {
  const buttonClassName = [
    styles.button,
    variant === 'secondary' ? styles.secondary : '',
    variant === 'tertiary' ? styles.tertiary : '',
    large ? styles.large : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled) onClick();
      }}
      className={buttonClassName}
      tabIndex={disabled ? -1 : 0}
      style={width ? { width: `${width}px` } : undefined}
      disabled={disabled}
      {...rest}
    >
      {label}
      {icon ? <span className={styles.icon}>{icon}</span> : null}
    </button>
  );
}
