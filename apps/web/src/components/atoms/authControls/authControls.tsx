'use client';

import { useTranslations } from 'next-intl';
import Button from '@/components/atoms/button/button';
import Avatar from '@/components/atoms/avatar/avatar';
import styles from './authControls.module.scss';

export default function AuthControls() {
  const t = useTranslations('Header');

  return (
    <div className={styles.authControls}>
      <Button
        label={t('loginButton')}
        onClick={() => undefined}
        variant="tertiary"
        rounded
        disableTranslate
      />
      <Avatar name={t('userName')} sizeRem={2.2} />
    </div>
  );
}
