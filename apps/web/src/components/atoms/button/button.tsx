'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'preset';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  width?: number;
  fullWidth?: boolean;
  large?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  rounded?: boolean;
  selected?: boolean;
  disableTranslate?: boolean;
}

export default function Button({
  type = 'button',
  label,
  onClick,
  variant = 'primary',
  width,
  fullWidth = false,
  large = false,
  disabled = false,
  icon,
  rounded,
  selected,
  disableTranslate = false,
  className,
  ...rest
}: ButtonProps) {
  const buttonClassName = [
    styles.button,
    variant === 'secondary' ? styles.secondary : '',
    variant === 'tertiary' ? styles.tertiary : '',
    variant === 'preset' ? styles.preset : '',
    selected && variant === 'preset' ? styles.presetSelected : '',
    disableTranslate ? styles.noTranslate : '',
    large ? styles.large : '',
    disabled ? styles.disabled : '',
    fullWidth ? styles.fullWidth : '',
    rounded ? styles.rounded : '',
    icon ? styles.withIcon : '',
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
      aria-pressed={selected ?? undefined}
      {...rest}
    >
      {label}
      {icon ? <span className={styles.icon}>{icon}</span> : null}
    </button>
  );
}
