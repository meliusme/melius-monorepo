'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import styles from './stepWrapper.module.scss';

type StepWrapperProps = {
  stepNumber: 0 | 1 | 2 | 3;
  children: ReactNode;
  footer?: ReactNode;
  image?: string;
  variables?: Record<string, string | number>;
  disableContentScroll?: boolean;
  centerContent?: boolean;
};

export default function StepWrapper({
  stepNumber,
  children,
  footer,
  image,
  variables,
  disableContentScroll = false,
  centerContent = false,
}: StepWrapperProps) {
  const t = useTranslations('Stepper');

  const stepKey = `step${stepNumber}`;

  // on mobile show hero only for the initial step
  const showHeroOnMobile = stepNumber === 0;

  return (
    <div className={styles.stepperContainer}>
      <section
        className={`${styles.heroSection} ${showHeroOnMobile ? styles.showOnMobile : ''}`}
      >
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt="" />
        )}
        {t(`${stepKey}.quote`) && (
          <p className={styles.quote}>&ldquo;{t(`${stepKey}.quote`)}&rdquo;</p>
        )}
      </section>
      <section className={styles.contentSection}>
        <div
          className={`${styles.contentWrapper} ${centerContent ? styles.centerContent : ''}`}
        >
          <div className={styles.headerZone}>
            <p className={styles.headerText}>
              {t.rich(`${stepKey}.header`, {
                em: (chunks) => <em>{chunks}</em>,
              })}
            </p>
          </div>
          <div className={styles.subheaderZone}>
            <p className={styles.subheaderText}>
              {t.rich(`${stepKey}.subheader`, {
                em: (chunks) => <em>{chunks}</em>,
                ...(variables || {}),
              })}
            </p>
          </div>
          <div
            className={`${styles.stepContent} ${disableContentScroll ? styles.noScroll : ''}`}
          >
            {children}
          </div>
          {footer && <div className={styles.footerZone}>{footer}</div>}
        </div>
      </section>
    </div>
  );
}
