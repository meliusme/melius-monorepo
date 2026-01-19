import type { ProblemsResponse } from '@/lib/types/api';
import ProblemList from '../../problemList/problemList';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/atoms/button/button';
import styles from '../matchStepper.module.scss';

type ProblemSelectionStepProps = {
  problems: ProblemsResponse;
  translations: Record<string, string>;
  selectedProblemId: number | null;
  onProblemSelect: (problemId: number | null) => void;
  onNext: () => void;
  buttonLabel: string;
};

export default function ProblemSelectionStep({
  problems,
  translations,
  selectedProblemId,
  onProblemSelect,
  onNext,
  buttonLabel,
}: ProblemSelectionStepProps) {
  return (
    <>
      <ProblemList
        problems={problems}
        translations={translations}
        selectedProblemId={selectedProblemId}
        onProblemSelect={onProblemSelect}
      />
      <div className={styles.buttonContainer}>
        <Button
          label={buttonLabel}
          onClick={onNext}
          disabled={selectedProblemId === null}
          icon={<ArrowRight size={16} />}
          fullWidth
          rounded
          large
        />
      </div>
    </>
  );
}
