'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/atoms/button/button';
import StepLabel from '@/components/atoms/stepLabel/stepLabel';
import StepDescription from '@/components/atoms/stepDescription/stepDescription';
import styles from './initialStep.module.scss';

type InitialStepProps = {
  onStart: () => void;
};

export default function InitialStep({ onStart }: InitialStepProps) {
  const t = useTranslations('Home');

  return (
    <div className={styles.initialStep}>
      <div className={styles.content}>
        <StepLabel mainText={t('findClarity')} italicText={t('findYourself')} />
        <StepDescription text={t('initialDescription')} />
      </div>
      <div className={styles.buttonContainer}>
        <Button
          label={t('startMatching')}
          onClick={onStart}
          large
          rounded
          icon={<ArrowRight size={20} />}
          fullWidth
        />
      </div>
    </div>
  );
}
