import styles from './stepLabel.module.scss';

type StepLabelProps = {
  mainText: string;
  italicText: string;
};

export default function StepLabel({ mainText, italicText }: StepLabelProps) {
  return (
    <div className={styles.label}>
      <p className={styles.text}>
        <span className={styles.textWrapper}>
          {mainText}
          <br />
        </span>
        <span className={styles.span}>{italicText}</span>
      </p>
    </div>
  );
}
