'use client';

import type { ReactNode } from 'react';
import Button from '@/components/atoms/button/button';
import IconButton from '@/components/atoms/iconButton/iconButton';
import styles from './stepButtonGroup.module.scss';

type StepButtonGroupProps = {
  backLabel: string;
  onBack: () => void;
  backDisabled?: boolean;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryIcon?: ReactNode;
  rounded?: boolean;
  large?: boolean;
  fullWidth?: boolean;
  error?: string | null;
};

export default function StepButtonGroup({
  backLabel,
  onBack,
  backDisabled = false,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryIcon,
  error,
  rounded = true,
  large = true,
  fullWidth = true,
}: StepButtonGroupProps) {
  return (
    <div className={styles.buttonContainer}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonGroup}>
        <IconButton ariaLabel={backLabel} onClick={onBack} disabled={backDisabled} />
        <Button
          label={primaryLabel}
          onClick={onPrimary}
          disabled={primaryDisabled}
          icon={primaryIcon}
          fullWidth={fullWidth}
          rounded={rounded}
          large={large}
        />
      </div>
    </div>
  );
}
