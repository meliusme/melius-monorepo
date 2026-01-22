import * as bcrypt from 'bcrypt';
import {
  DocVerificationStatus,
  Language,
  PrismaClient,
  Profession,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const seedPassword = 'test1234';
const passwordRounds = 10;

const slotDurationMinutes = 50;
const slotDays = 7;

const docs = [
  {
    email: 'doc.anna.nowak@example.com',
    firstName: 'Anna',
    lastName: 'Nowak',
    profession: Profession.psychotherapist,
    rate: 4.8,
    ratesLot: 26,
    unitAmount: 18000,
    currency: 'PLN',
    language: Language.pl,
    slotHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], // Full day availability
    specializationKeys: [
      'cognitive_behavioral_therapy',
      'mindfulness',
      'interpersonal_therapy',
    ],
  },
  {
    email: 'doc.piotr.kowalski@example.com',
    firstName: 'Piotr',
    lastName: 'Kowalski',
    profession: Profession.psychotherapist,
    rate: 4.7,
    ratesLot: 19,
    unitAmount: 16000,
    currency: 'PLN',
    language: Language.pl,
    slotHours: [9, 10, 11, 14, 15, 16, 17], // Morning and afternoon
    specializationKeys: [
      'systemic_therapy',
      'emotional_focused_therapy',
      'solution_focused_therapy',
    ],
  },
  {
    email: 'doc.katarzyna.zielinska@example.com',
    firstName: 'Katarzyna',
    lastName: 'Zielinska',
    profession: Profession.psychotherapist,
    rate: 4.9,
    ratesLot: 14,
    unitAmount: 22000,
    currency: 'PLN',
    language: Language.pl,
    slotHours: [14, 15, 16, 17, 18, 19, 20], // Afternoon and evening
    specializationKeys: [
      'trauma_focused_cognitive_behavioral_therapy',
      'dialectical_behavioral_therapy',
      'mentalization_based_therapy',
    ],
  },
  {
    email: 'doc.agnieszka.wozniak@example.com',
    firstName: 'Agnieszka',
    lastName: 'Wozniak',
    profession: Profession.psychotherapist,
    rate: 4.6,
    ratesLot: 11,
    unitAmount: 15000,
    currency: 'PLN',
    language: Language.pl,
    slotHours: [8, 9, 10, 11, 12, 13], // Morning only
    specializationKeys: [
      'gestalt_therapy',
      'humanistic_therapy',
      'integrative_therapy',
    ],
  },
  {
    email: 'doc.marcin.kaminsky@example.com',
    firstName: 'Marcin',
    lastName: 'Kaminsky',
    profession: Profession.psychotherapist,
    rate: 4.5,
    ratesLot: 8,
    unitAmount: 14000,
    currency: 'PLN',
    language: Language.pl,
    slotHours: [10, 12, 14, 16, 18], // Scattered throughout the day
    specializationKeys: [
      'behavioral_therapy',
      'occupational_therapy',
      'career_coaching',
    ],
  },
];

const toDayStart = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const buildSlots = (docId: number, startDate: Date, slotHours: number[]) => {
  const slots = [];

  for (let dayOffset = 0; dayOffset < slotDays; dayOffset += 1) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + dayOffset);

    for (const hour of slotHours) {
      const startTime = new Date(day);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDurationMinutes);

      slots.push({
        docId,
        startTime,
        endTime,
      });
    }
  }

  return slots;
};

async function seedApprovedDocsWithSlots() {
  const hashedPassword = await bcrypt.hash(seedPassword, passwordRounds);
  const now = new Date();
  const startDate = toDayStart(now);

  const allKeys = [...new Set(docs.flatMap((doc) => doc.specializationKeys))];
  const specializations = await prisma.specialization.findMany({
    where: { specializationKey: { in: allKeys } },
    select: { id: true, specializationKey: true },
  });
  const specializationMap = new Map(
    specializations.map((spec) => [spec.specializationKey, spec.id]),
  );

  for (const doc of docs) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      create: {
        email: doc.email,
        password: hashedPassword,
        role: Role.doc,
        emailConfirmed: true,
        language: doc.language,
        tokenActivatedAt: now,
        docProfile: {
          create: {
            firstName: doc.firstName,
            lastName: doc.lastName,
            profession: doc.profession,
            rate: doc.rate,
            ratesLot: doc.ratesLot,
            unitAmount: doc.unitAmount,
            currency: doc.currency,
            docTermsAccepted: true,
            verificationStatus: DocVerificationStatus.approved,
            submittedAt: now,
            reviewedAt: now,
          },
        },
      },
      update: {
        password: hashedPassword,
        role: Role.doc,
        emailConfirmed: true,
        language: doc.language,
        tokenActivatedAt: now,
      },
      include: { docProfile: true },
    });

    const profile =
      user.docProfile ??
      (await prisma.docProfile.create({
        data: {
          docId: user.id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          profession: doc.profession,
          rate: doc.rate,
          ratesLot: doc.ratesLot,
          unitAmount: doc.unitAmount,
          currency: doc.currency,
          docTermsAccepted: true,
          verificationStatus: DocVerificationStatus.approved,
          submittedAt: now,
          reviewedAt: now,
        },
      }));

    await prisma.docProfile.update({
      where: { id: profile.id },
      data: {
        firstName: doc.firstName,
        lastName: doc.lastName,
        profession: doc.profession,
        rate: doc.rate,
        ratesLot: doc.ratesLot,
        unitAmount: doc.unitAmount,
        currency: doc.currency,
        docTermsAccepted: true,
        verificationStatus: DocVerificationStatus.approved,
        submittedAt: now,
        reviewedAt: now,
        specializations: {
          set: doc.specializationKeys
            .map((key) => specializationMap.get(key))
            .filter((id): id is number => Boolean(id))
            .map((id) => ({ id })),
        },
      },
    });

    await prisma.availabilitySlot.deleteMany({
      where: { docId: profile.id },
    });

    const slots = buildSlots(profile.id, startDate, doc.slotHours);

    await prisma.availabilitySlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    console.log(
      `✅ Seeded approved doc ${doc.email} with ${slots.length} slots.`,
    );
  }
}

seedApprovedDocsWithSlots()
  .then(async () => {
    console.log('Finished seeding approved docs with slots.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding approved docs with slots:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
