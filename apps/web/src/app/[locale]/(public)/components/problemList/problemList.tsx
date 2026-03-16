'use client';

import Item from '@/components/atoms/item/item';
import styles from './problemList.module.scss';
import {
  Brain,
  Wind,
  CloudDrizzle,
  Stethoscope,
  Moon,
  Wine,
  Apple,
  User,
  Users,
  AlertCircle,
  Baby,
  Heart,
  Rainbow,
  TrendingUp,
  Briefcase,
  Activity,
} from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef } from 'react';

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

const problemIcons: Record<string, ReactNode> = {
  mood_disorders: <Brain size={20} />,
  anxiety_and_panic: <Wind size={20} />,
  depression: <CloudDrizzle size={20} />,
  trauma: <Stethoscope size={20} />,
  sleep_disorders: <Moon size={20} />,
  addictions: <Wine size={20} />,
  eating_disorders: <Apple size={20} />,
  personality_disorders: <User size={20} />,
  family_and_relationship_issues: <Users size={20} />,
  life_crises: <AlertCircle size={20} />,
  developmental_issues: <Baby size={20} />,
  sexuality_and_related_issues: <Heart size={20} />,
  lgbtqia_specific_issues: <Rainbow size={20} />,
  personal_development: <TrendingUp size={20} />,
  career_development: <Briefcase size={20} />,
  neurobiological_disorders: <Activity size={20} />,
};

export default function ProblemList({
  problems,
  translations,
  selectedProblemId,
  onProblemSelect,
}: ProblemListProps) {
  const selectedProblemIdRef = useRef(selectedProblemId);
  useEffect(() => {
    selectedProblemIdRef.current = selectedProblemId;
  }, [selectedProblemId]);

  const handleProblemClick = useCallback(
    (problemId: number) => {
      const newValue = problemId === selectedProblemIdRef.current ? null : problemId;
      onProblemSelect(newValue);
    },
    [onProblemSelect],
  );

  return (
    <div className={styles.problemList}>
      <div className={styles.grid}>
        {problems.map((problem) => (
          <Item
            key={problem.id}
            id={problem.id}
            icon={problemIcons[problem.problemKey] || <Brain size={20} />}
            title={translations[problem.problemKey] || problem.problemKey}
            selected={selectedProblemId === problem.id}
            onClick={handleProblemClick}
          />
        ))}
      </div>
    </div>
  );
}
