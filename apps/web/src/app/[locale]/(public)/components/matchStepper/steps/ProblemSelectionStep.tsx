import type { ProblemsResponse } from '@/lib/types/api';
import ProblemList from '../../problemList/problemList';
import { ArrowRight } from 'lucide-react';
import StepWrapper from './StepWrapper';
import StepButtonGroup from './StepButtonGroup';

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
    <StepWrapper
      stepNumber={1}
      image={image}
      footer={
        <StepButtonGroup
          backLabel={backLabel}
          onBack={onBack}
          primaryLabel={buttonLabel}
          onPrimary={onNext}
          primaryDisabled={selectedProblemId === null}
          primaryIcon={<ArrowRight size={16} />}
        />
      }
    >
      <ProblemList
        problems={problems}
        translations={translations}
        selectedProblemId={selectedProblemId}
        onProblemSelect={onProblemSelect}
      />
    </StepWrapper>
  );
}
