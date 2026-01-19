'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/atoms/button/button';
import StepWrapper from './StepWrapper';
import styles from './initialStep.module.scss';

type InitialStepProps = {
  onStart: () => void;
  image: string;
};

export default function InitialStep({ onStart, image }: InitialStepProps) {
  const t = useTranslations('Home');

  return (
    <StepWrapper stepNumber={0} image={image}>
      <div className={styles.buttonWrapper}>
        <Button
          label={t('startMatching')}
          onClick={onStart}
          large
          rounded
          icon={<ArrowRight size={20} />}
          fullWidth
        />
      </div>
    </StepWrapper>
  );
}
