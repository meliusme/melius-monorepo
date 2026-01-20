import type { ProblemsResponse } from '@/lib/types/api';
import ProblemList from '../../problemList/problemList';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/atoms/button/button';
import IconButton from '@/components/atoms/iconButton/iconButton';
import StepWrapper from './StepWrapper';
import styles from '../matchStepper.module.scss';

type ProblemSelectionStepProps = {
  problems: ProblemsResponse;
  translations: Record<string, string>;
  selectedProblemId: number | null;
  onProblemSelect: (problemId: number | null) => void;
  onBack: () => void;
  onNext: () => void;
  backLabel: string;
  buttonLabel: string;
  image: string;
};

export default function ProblemSelectionStep({
  problems,
  translations,
  selectedProblemId,
  onProblemSelect,
  onBack,
  onNext,
  backLabel,
  buttonLabel,
  image,
}: ProblemSelectionStepProps) {
  return (
    <StepWrapper stepNumber={1} image={image}>
      <ProblemList
        problems={problems}
        translations={translations}
        selectedProblemId={selectedProblemId}
        onProblemSelect={onProblemSelect}
      />
      <div className={styles.buttonContainer}>
        <div className={styles.buttonGroup}>
          <IconButton ariaLabel={backLabel} onClick={onBack} />
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
      </div>
    </StepWrapper>
  );
}
