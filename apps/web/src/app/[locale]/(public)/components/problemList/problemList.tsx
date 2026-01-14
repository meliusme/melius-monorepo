'use client';

import { useState } from 'react';
import { Item } from '@/components/atoms/item/item';
import styles from './problemList.module.scss';

export type Problem = {
  id: number;
  problemKey: string;
};

type ProblemListProps = {
  problems: Problem[];
  translations: Record<string, string>;
};

export default function ProblemList({ problems, translations }: ProblemListProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const handleProblemClick = (problemId: number) => {
    setSelectedProblemId(problemId === selectedProblemId ? null : problemId);
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
