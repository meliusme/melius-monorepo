import type { Story } from '@ladle/react';
import { useEffect, useState } from 'react';
import Icon from '@/components/atoms/icon/icon';
import NoAvatarIcon from '@/assets/icons/no-avatar.svg';
import styles from './avatar.module.scss';

// Simple wrapper for Ladle - Avatar uses next/image which doesn't work in Vite
const AvatarDemo = ({
  avatarUrl,
  name,
  sizeRem = 15,
}: {
  avatarUrl?: string;
  name: string;
  sizeRem?: number;
}) => {
  const [open, setOpen] = useState(false);
  const sizePx = sizeRem * 16;
  const hasAvatar = avatarUrl && avatarUrl.trim() !== '';

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.avatar}
        style={{ width: sizePx, height: sizePx }}
        disabled={!hasAvatar}
        onClick={() => hasAvatar && setOpen(true)}
      >
        {hasAvatar ? (
          <img src={avatarUrl} alt={name} className={styles.image} />
        ) : (
          <Icon src={NoAvatarIcon} className={styles.placeholder} />
        )}
      </button>

      {open && hasAvatar && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <img
              src={avatarUrl}
              alt={name}
              style={{
                width: 512,
                height: 512,
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const WithAvatar: Story = () => (
  <div style={{ padding: '2rem' }}>
    <AvatarDemo
      avatarUrl="https://i.pravatar.cc/300?img=1"
      name="John Doe"
      sizeRem={15}
    />
  </div>
);

export const WithoutAvatar: Story = () => (
  <div style={{ padding: '2rem' }}>
    <AvatarDemo name="Jane Smith" sizeRem={15} />
  </div>
);
