import styles from './rate.module.scss';
import Icon from '@/components/atoms/icon/icon';
import StarFilled from '@/assets/icons/star-filled.svg';
import StarLined from '@/assets/icons/star-lined.svg';

type RateProps = {
  rate: number;
  ratesLot: number;
  compact?: boolean;
};

function formatRate(rate: number) {
  return (Math.round(rate * 10) / 10).toFixed(1);
}

export function Rate({ rate, ratesLot, compact = true }: RateProps) {
  if (ratesLot <= 0) return null;

  if (compact) {
    return (
      <div
        className={styles.compact}
        aria-label={`Rate ${formatRate(rate)} out of 5, ${ratesLot} reviews`}
      >
        <span className={styles.icon} aria-hidden="true">
          <Icon src={StarFilled} />
        </span>
        <span className={styles.value}>{formatRate(rate)}</span>
        <span className={styles.lot}>({ratesLot})</span>
      </div>
    );
  }

  return (
    <div
      className={styles.rate}
      aria-label={`Rate ${formatRate(rate)} out of 5, ${ratesLot} reviews`}
    >
      <Stars rate={rate} />
      <span className={styles.lot}>({ratesLot})</span>
    </div>
  );
}

function Stars({ rate }: { rate: number }) {
  const full = Math.round(rate);

  return (
    <div className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={styles.star}>
          <Icon src={i + 1 <= full ? StarFilled : StarLined} />
        </span>
      ))}
    </div>
  );
}
