'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { searchWithSlotsAction } from '../../actions/search-with-slots.action';
import { toAPIDateRange } from '@/lib/utils/date';
import type { ProblemsResponse, SearchWithSlotsResponse } from '@/lib/types/api';
import type { DateRangeValue } from '@/lib/types/date';
import { getErrorMessage } from '@/lib/errors';
import { defaultValues, type MatchStepperFormData } from './matchStepperSchema';
import ProblemSelectionStep from './steps/ProblemSelectionStep';
import DateSelectionStep from './steps/DateSelectionStep';
import DocSelectionStep from './steps/DocSelectionStep';
import InitialStep from './steps/InitialStep';
import Step0Svg from '@/assets/illustrations/step0.svg';
import Step1Svg from '@/assets/illustrations/step1.svg';
import Step2Svg from '@/assets/illustrations/step2.svg';
import Step3Svg from '@/assets/illustrations/step3.svg';
import styles from './matchStepper.module.scss';

// Step images mapping
const STEP_IMAGES: Record<number, string> = {
  0: Step0Svg.src,
  1: Step1Svg.src,
  2: Step2Svg.src,
  3: Step3Svg.src,
};

type MatchStepperProps = {
  problems: ProblemsResponse;
  translations: Record<string, string>;
};

export default function MatchStepper({ problems, translations }: MatchStepperProps) {
  const t = useTranslations('Home');
  const tErrors = useTranslations('Errors');
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  const [state, setState] = useState<MatchStepperFormData>(defaultValues);
  const [docs, setDocs] = useState<SearchWithSlotsResponse>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { problemId, dateRange } = state;

  const handleProblemSelect = (problemId: number | null) => {
    // Clear dependent data when problem changes
    setState((prev) => ({
      ...prev,
      problemId,
      dateRange: null,
      selectedSlotId: null,
    }));
    setDocs([]);
    setError(null);
  };

  const handleDateRangeChange = (value: DateRangeValue) => {
    // Clear dependent data when date range changes
    setState((prev) => ({
      ...prev,
      dateRange: value,
      selectedSlotId: null,
    }));
    setDocs([]);
    setError(null);
  };

  const handleSlotSelect = (slotId: number) => {
    setState((prev) => ({ ...prev, selectedSlotId: slotId }));
    // TODO: Navigate to booking confirmation or next step
  };

  const handleNextToDatePicker = () => {
    if (problemId !== null) {
      setCurrentStep(2);
    }
  };

  const handleBackToProblemList = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleBackToDatePicker = () => {
    setCurrentStep(2);
  };

  const handleNextToDocList = async () => {
    if (dateRange !== null && problemId !== null) {
      setLoading(true);
      setError(null);

      try {
        // Convert local date range to API date-time format (UTC)
        const apiDateRange = toAPIDateRange(dateRange);

        const { data, error } = await searchWithSlotsAction({
          problemId,
          from: apiDateRange.from,
          to: apiDateRange.to,
        });

        if (error) {
          setError(error);
        } else if (data) {
          setDocs(data);
          setCurrentStep(3);
        }
      } catch (err) {
        setError(getErrorMessage(err, tErrors));
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep = () => {
    const image = STEP_IMAGES[currentStep];

    switch (currentStep) {
      case 0:
        return <InitialStep onStart={() => setCurrentStep(1)} image={image} />;
      case 1:
        return (
          <ProblemSelectionStep
            problems={problems}
            translations={translations}
            selectedProblemId={problemId}
            onProblemSelect={handleProblemSelect}
            onBack={() => setCurrentStep(0)}
            onNext={handleNextToDatePicker}
            backLabel={t('backButton')}
            buttonLabel={t('selectDateButton')}
            image={image}
          />
        );

      case 2:
        return (
          <DateSelectionStep
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onBack={handleBackToProblemList}
            onNext={handleNextToDocList}
            error={error}
            loading={loading}
            backLabel={t('backButton')}
            nextLabel={t('searchTherapistButton')}
            searchingLabel={t('searchingButton')}
            image={image}
          />
        );

      case 3:
        return (
          <DocSelectionStep
            docs={docs}
            onSlotSelect={handleSlotSelect}
            onBack={handleBackToDatePicker}
            backLabel={t('backButton')}
            emptyStateLabel={t('docEmptyState')}
            prevAriaLabel={t('docPrevAria')}
            nextAriaLabel={t('docNextAria')}
            getIndicatorAriaLabel={(index) => t('docIndicatorAria', { index: index + 1 })}
            image={image}
          />
        );
    }
  };

  return <>{renderStep()}</>;
}
