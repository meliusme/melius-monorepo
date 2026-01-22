'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import Button from '@/components/atoms/button/button';
import StepWrapper from './StepWrapper';
import styles from './initialStep.module.scss';

type InitialStepProps = {
  onStart: () => void;
  image: string;
};

export default function InitialStep({ onStart, image }: InitialStepProps) {
  const t = useTranslations('Home');

  const features = [
    {
      icon: Check,
      title: t('matchTitle'),
      description: t('matchDesc'),
    },
    {
      icon: ShieldCheck,
      title: t('verifiedTitle'),
      description: t('verifiedDesc'),
    },
  ];

  return (
    <StepWrapper
      stepNumber={0}
      image={image}
      footer={
        <>
          <div className={styles.buttonWrapper}>
            <p className={styles.timeNote}>{t('timeNote')}</p>
            <Button
              label={t('startMatching')}
              onClick={onStart}
              large
              rounded
              icon={<ArrowRight size={20} />}
              fullWidth
            />
          </div>
        </>
      }
    >
      <div className={styles.featureGrid}>
        {features.map(({ icon: Icon, title, description }) => (
          <div className={styles.featureCard} key={title}>
            <span className={styles.featureIcon}>
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <div className={styles.featureText}>
              <p className={styles.featureTitle}>{title}</p>
              <p className={styles.featureSubtitle}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </StepWrapper>
  );
}
