import styles from './stepDescription.module.scss';

type StepDescriptionProps = {
  text: string;
};

export default function StepDescription({ text }: StepDescriptionProps) {
  return (
    <div className={styles.container}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
