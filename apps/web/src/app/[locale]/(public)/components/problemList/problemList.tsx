'use client';

import Item from '@/components/atoms/item/item';
import styles from './problemList.module.scss';

export type Problem = {
  id: number;
  problemKey: string;
};

type ProblemListProps = {
  problems: Problem[];
  translations: Record<string, string>;
  selectedProblemId: number | null;
  onProblemSelect: (problemId: number | null) => void;
};

export default function ProblemList({
  problems,
  translations,
  selectedProblemId,
  onProblemSelect,
}: ProblemListProps) {
  const handleProblemClick = (problemId: number) => {
    const newValue = problemId === selectedProblemId ? null : problemId;
    onProblemSelect(newValue);
  };

  return (
    <div className={styles.problemList}>
      <div className={styles.grid}>
        {problems.map((problem) => (
          <Item
            key={problem.id}
            title={translations[problem.problemKey] || problem.problemKey}
            selected={selectedProblemId === problem.id}
            onClick={() => handleProblemClick(problem.id)}
          />
        ))}
      </div>
    </div>
  );
}
