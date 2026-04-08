import type { DateRangeValue } from '@/lib/types/date';
import DateRangePicker from '@/components/molecules/dateRangePicker/dateRangePicker';
import { Search } from 'lucide-react';
import StepWrapper from './StepWrapper';
import StepButtonGroup from './StepButtonGroup';

type DateSelectionStepProps = {
  dateRange: DateRangeValue | null;
  onDateRangeChange: (value: DateRangeValue) => void;
  onBack: () => void;
  onNext: () => void;
  error: string | null;
  loading: boolean;
  backLabel: string;
  nextLabel: string;
  searchingLabel: string;
  image: string;
};

export default function DateSelectionStep({
  dateRange,
  onDateRangeChange,
  onBack,
  onNext,
  error,
  loading,
  backLabel,
  nextLabel,
  searchingLabel,
  image,
}: DateSelectionStepProps) {
  return (
    <StepWrapper
      stepNumber={2}
      image={image}
      footer={
        <StepButtonGroup
          backLabel={backLabel}
          onBack={onBack}
          backDisabled={loading}
          primaryLabel={loading ? searchingLabel : nextLabel}
          onPrimary={onNext}
          primaryDisabled={
            dateRange === null || !dateRange.fromISO || !dateRange.toISO || loading
          }
          primaryIcon={<Search size={16} />}
          error={error}
        />
      }
    >
      <DateRangePicker
        value={dateRange || undefined}
        onChange={onDateRangeChange}
        maxRangeDays={30}
      />
    </StepWrapper>
  );
}
