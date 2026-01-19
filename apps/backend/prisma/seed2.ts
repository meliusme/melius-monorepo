import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const problemSpecializations = [
  {
    problemKey: 'mood_disorders',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  { problemKey: 'mood_disorders', specializationKey: 'interpersonal_therapy' },
  { problemKey: 'mood_disorders', specializationKey: 'mindfulness' },

  {
    problemKey: 'anxiety_and_panic',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  {
    problemKey: 'anxiety_and_panic',
    specializationKey: 'dialectical_behavioral_therapy',
  },

  {
    problemKey: 'depression',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  { problemKey: 'depression', specializationKey: 'mindfulness' },

  {
    problemKey: 'trauma',
    specializationKey: 'trauma_focused_cognitive_behavioral_therapy',
  },

  {
    problemKey: 'eating_disorders',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  { problemKey: 'eating_disorders', specializationKey: 'family_based_therapy' },

  {
    problemKey: 'personality_disorders',
    specializationKey: 'dialectical_behavioral_therapy',
  },
  {
    problemKey: 'personality_disorders',
    specializationKey: 'mentalization_based_therapy',
  },

  {
    problemKey: 'sleep_disorders',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  {
    problemKey: 'sleep_disorders',
    specializationKey: 'sleep_hygiene_education',
  },

  {
    problemKey: 'addictions',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  {
    problemKey: 'addictions',
    specializationKey: 'motivational_interviewing',
  },

  {
    problemKey: 'family_and_relationship_issues',
    specializationKey: 'systemic_therapy',
  },
  {
    problemKey: 'family_and_relationship_issues',
    specializationKey: 'emotional_focused_therapy',
  },

  {
    problemKey: 'life_crises',
    specializationKey: 'cognitive_behavioral_therapy',
  },
  { problemKey: 'life_crises', specializationKey: 'solution_focused_therapy' },

  {
    problemKey: 'developmental_issues',
    specializationKey: 'behavioral_therapy',
  },
  {
    problemKey: 'developmental_issues',
    specializationKey: 'occupational_therapy',
  },

  {
    problemKey: 'sexuality_and_related_issues',
    specializationKey: 'sex_therapy',
  },
  {
    problemKey: 'sexuality_and_related_issues',
    specializationKey: 'gender_therapy',
  },

  {
    problemKey: 'lgbtqia_specific_issues',
    specializationKey: 'affirmative_therapy',
  },
  {
    problemKey: 'lgbtqia_specific_issues',
    specializationKey: 'nonbinary_therapy',
  },

  { problemKey: 'personal_development', specializationKey: 'coaching' },

  { problemKey: 'career_development', specializationKey: 'career_coaching' },

  {
    problemKey: 'neurobiological_disorders',
    specializationKey: 'applied_behavior_analysis',
  },

  { problemKey: 'mood_disorders', specializationKey: 'gestalt_therapy' },
  {
    problemKey: 'anxiety_and_panic',
    specializationKey: 'solution_focused_therapy',
  },
  { problemKey: 'life_crises', specializationKey: 'humanistic_therapy' },
  {
    problemKey: 'developmental_issues',
    specializationKey: 'integrative_therapy',
  },
];

async function seedMatches() {
  await prisma.match.deleteMany();
  await prisma.$executeRaw`ALTER SEQUENCE "Match_id_seq" RESTART WITH 1;`;
  const problems = await prisma.problem.findMany();
  const specializations = await prisma.specialization.findMany();

  const matches = [];

  for (const { problemKey, specializationKey } of problemSpecializations) {
    const problem = problems.find((p) => p.problemKey === problemKey);
    const specialization = specializations.find(
      (s) => s.specializationKey === specializationKey,
    );

    if (problem && specialization) {
      matches.push({
        problemId: problem.id,
        specializationId: specialization.id,
      });
    } else {
      console.warn(
        `Problem or specialization not found for keys: ${problemKey}, ${specializationKey}`,
      );
    }
  }

  await prisma.match.createMany({
    data: matches,
    skipDuplicates: true,
  });
}

seedMatches()
  .then(async () => {
    console.log('Finished seeding problem-specialization matches.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding matches:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
