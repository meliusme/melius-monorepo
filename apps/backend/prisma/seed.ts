import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const problems = [
  { problemKey: 'mood_disorders' },
  { problemKey: 'anxiety_and_phobias' },
  { problemKey: 'anxiety_disorders' },
  { problemKey: 'trauma' },
  { problemKey: 'eating_disorders' },
  { problemKey: 'personality_disorders' },
  { problemKey: 'sleep_disorders' },
  { problemKey: 'addictions' },
  { problemKey: 'family_and_relationship_issues' },
  { problemKey: 'life_crises' },
  { problemKey: 'developmental_issues' },
  { problemKey: 'sexuality_and_related_issues' },
  { problemKey: 'lgbtqia_specific_issues' },
  { problemKey: 'personal_development' },
  { problemKey: 'career_development' },
  { problemKey: 'neurobiological_disorders' },
];

const specializations = [
  { specializationKey: 'cognitive_behavioral_therapy' },
  { specializationKey: 'interpersonal_therapy' },
  { specializationKey: 'mindfulness' },
  { specializationKey: 'dialectical_behavioral_therapy' },
  { specializationKey: 'trauma_focused_cognitive_behavioral_therapy' },
  { specializationKey: 'family_based_therapy' },
  { specializationKey: 'mentalization_based_therapy' },
  { specializationKey: 'sleep_hygiene_education' },
  { specializationKey: 'motivational_interviewing' },
  { specializationKey: 'systemic_therapy' },
  { specializationKey: 'emotional_focused_therapy' },
  { specializationKey: 'solution_focused_therapy' },
  { specializationKey: 'behavioral_therapy' },
  { specializationKey: 'occupational_therapy' },
  { specializationKey: 'sex_therapy' },
  { specializationKey: 'gender_therapy' },
  { specializationKey: 'affirmative_therapy' },
  { specializationKey: 'nonbinary_therapy' },
  { specializationKey: 'coaching' },
  { specializationKey: 'career_coaching' },
  { specializationKey: 'applied_behavior_analysis' },
  { specializationKey: 'gestalt_therapy' },
  { specializationKey: 'solution_focused_therapy' },
  { specializationKey: 'humanistic_therapy' },
  { specializationKey: 'integrative_therapy' },
];

async function seedData() {
  await prisma.problem.deleteMany();
  await prisma.specialization.deleteMany();
  await prisma.$executeRaw`ALTER SEQUENCE "Problem_id_seq" RESTART WITH 1;`;
  await prisma.$executeRaw`ALTER SEQUENCE "Specialization_id_seq" RESTART WITH 1;`;

  const createdProblems = await prisma.problem.createMany({
    data: problems,
    skipDuplicates: true,
  });
  console.log('✅ Seeded problems:', createdProblems);

  const createdSpecializations = await prisma.specialization.createMany({
    data: specializations,
    skipDuplicates: true,
  });
  console.log('✅ Seeded specializations:', createdSpecializations);
}

seedData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
