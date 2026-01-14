'use client';

import Image from 'next/image';
import { useEffect, useId, useState } from 'react';
import styles from './avatar.module.scss';
import Icon from '@/components/atoms/icon/icon';
import NoAvatarIcon from '@/assets/illustrations/no-avatar.svg';

type AvatarProps = {
  avatarUrl?: string;
  name: string;
  sizeRem?: number; // domyślnie 8rem
};

export default function Avatar({ avatarUrl, name, sizeRem = 8 }: AvatarProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const sizePx = sizeRem * 16;
  const hasAvatar = avatarUrl && avatarUrl.trim() !== '';

  return (
    <>
      <button
        type="button"
        className={styles.avatar}
        onClick={() => hasAvatar && setOpen(true)}
        aria-haspopup={hasAvatar ? 'dialog' : undefined}
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        style={{ width: sizePx, height: sizePx }}
        disabled={!hasAvatar}
      >
        {hasAvatar ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={sizePx}
            height={sizePx}
            className={styles.image}
            sizes={`${sizePx}px`}
          />
        ) : (
          <Icon src={NoAvatarIcon} className={styles.placeholder} />
        )}
      </button>

      {open && hasAvatar && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setOpen(false)}
        >
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span id={titleId} className={styles.srOnly}>
              {name}
            </span>

            <Image
              src={avatarUrl}
              alt={name}
              width={512}
              height={512}
              className={styles.preview}
              sizes="(max-width: 768px) 90vw, 512px"
            />
          </div>
        </div>
      )}
    </>
  );
}
