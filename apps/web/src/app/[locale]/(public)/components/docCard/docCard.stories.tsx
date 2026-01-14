import type { Story } from '@ladle/react';
import { DocCard } from './docCard';
import type { components } from '@/generated/openapi';

type SearchMatchResult = components['schemas']['SearchMatchesResultDto'];

const mockDoc: SearchMatchResult = {
  id: 1,
  firstName: 'Anna',
  lastName: 'Kowalska',
  profession: 'psychologist',
  rate: 4.5,
  ratesLot: 10,
  unitAmount: 15000, // 150.00 PLN
  currency: 'pln',
  isApproved: true,
  avatar: {
    url: 'https://i.pravatar.cc/300?img=47',
  },
  language: 'pl',
  slots: [
    {
      id: 1,
      startTime: '2026-01-15T09:00:00.000Z',
      endTime: '2026-01-15T09:50:00.000Z',
    },
    {
      id: 2,
      startTime: '2026-01-15T10:00:00.000Z',
      endTime: '2026-01-15T10:50:00.000Z',
    },
    {
      id: 3,
      startTime: '2026-01-15T14:00:00.000Z',
      endTime: '2026-01-15T14:50:00.000Z',
    },
    {
      id: 4,
      startTime: '2026-01-16T09:00:00.000Z',
      endTime: '2026-01-16T09:50:00.000Z',
    },
    {
      id: 5,
      startTime: '2026-01-16T11:00:00.000Z',
      endTime: '2026-01-16T11:50:00.000Z',
    },
    {
      id: 6,
      startTime: '2026-01-17T10:00:00.000Z',
      endTime: '2026-01-17T10:50:00.000Z',
    },
  ],
};

const mockDocPsychotherapist: SearchMatchResult = {
  ...mockDoc,
  id: 2,
  firstName: 'Jan',
  lastName: 'Nowak',
  profession: 'psychotherapist',
  rate: 4.8,
  ratesLot: 12,
  unitAmount: 20000, // 200.00 PLN
};

const mockDocNoAvatar: SearchMatchResult = {
  ...mockDoc,
  id: 3,
  firstName: 'Maria',
  lastName: 'Wiśniewska',
  profession: 'sexologist',
  avatar: null,
  rate: 5.0,
  ratesLot: 10,
};

const mockDocManySlots: SearchMatchResult = {
  ...mockDoc,
  id: 4,
  slots: Array.from({ length: 20 }, (_, i) => {
    const day = String(15 + Math.floor(i / 4)).padStart(2, '0');
    const hour = String(9 + (i % 4) * 2).padStart(2, '0');
    return {
      id: i + 100,
      startTime: `2026-01-${day}T${hour}:00:00.000Z`,
      endTime: `2026-01-${day}T${hour}:50:00.000Z`,
    };
  }),
};

export const Default: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard doc={mockDoc} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
  </div>
);

export const Psychotherapist: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard
      doc={mockDocPsychotherapist}
      onSlotSelect={(id) => alert(`Selected slot ${id}`)}
    />
  </div>
);

export const NoAvatar: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard doc={mockDocNoAvatar} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
  </div>
);

export const ManySlots: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard doc={mockDocManySlots} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
  </div>
);

export const NoRating: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard
      doc={{ ...mockDoc, rate: null, ratesLot: null }}
      onSlotSelect={(id) => alert(`Selected slot ${id}`)}
    />
  </div>
);

export const WithoutCallback: Story = () => (
  <div style={{ maxWidth: '400px' }}>
    <DocCard doc={mockDoc} />
  </div>
);

export const MobileView: Story = () => (
  <div style={{ maxWidth: '375px', margin: '0 auto' }}>
    <DocCard doc={mockDoc} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
  </div>
);
MobileView.meta = {
  width: 375,
};

export const MobileViewManySlots: Story = () => (
  <div style={{ maxWidth: '375px', margin: '0 auto' }}>
    <DocCard doc={mockDocManySlots} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
  </div>
);
MobileViewManySlots.meta = {
  width: 375,
};

export const MobileViewMultipleDays: Story = () => {
  const multiDayDoc: SearchMatchResult = {
    ...mockDoc,
    slots: [
      // Day 1
      {
        id: 1,
        startTime: '2026-01-15T09:00:00.000Z',
        endTime: '2026-01-15T09:50:00.000Z',
      },
      {
        id: 2,
        startTime: '2026-01-15T10:00:00.000Z',
        endTime: '2026-01-15T10:50:00.000Z',
      },
      {
        id: 3,
        startTime: '2026-01-15T11:00:00.000Z',
        endTime: '2026-01-15T11:50:00.000Z',
      },
      {
        id: 4,
        startTime: '2026-01-15T14:00:00.000Z',
        endTime: '2026-01-15T14:50:00.000Z',
      },
      {
        id: 5,
        startTime: '2026-01-15T15:00:00.000Z',
        endTime: '2026-01-15T15:50:00.000Z',
      },
      {
        id: 6,
        startTime: '2026-01-15T16:00:00.000Z',
        endTime: '2026-01-15T16:50:00.000Z',
      },
      // Day 2
      {
        id: 7,
        startTime: '2026-01-16T09:00:00.000Z',
        endTime: '2026-01-16T09:50:00.000Z',
      },
      {
        id: 8,
        startTime: '2026-01-16T10:00:00.000Z',
        endTime: '2026-01-16T10:50:00.000Z',
      },
      {
        id: 9,
        startTime: '2026-01-16T11:00:00.000Z',
        endTime: '2026-01-16T11:50:00.000Z',
      },
      {
        id: 10,
        startTime: '2026-01-16T13:00:00.000Z',
        endTime: '2026-01-16T13:50:00.000Z',
      },
      {
        id: 11,
        startTime: '2026-01-16T14:00:00.000Z',
        endTime: '2026-01-16T14:50:00.000Z',
      },
      {
        id: 12,
        startTime: '2026-01-16T15:00:00.000Z',
        endTime: '2026-01-16T15:50:00.000Z',
      },
      // Day 3
      {
        id: 13,
        startTime: '2026-01-17T10:00:00.000Z',
        endTime: '2026-01-17T10:50:00.000Z',
      },
      {
        id: 14,
        startTime: '2026-01-17T11:00:00.000Z',
        endTime: '2026-01-17T11:50:00.000Z',
      },
      {
        id: 15,
        startTime: '2026-01-17T14:00:00.000Z',
        endTime: '2026-01-17T14:50:00.000Z',
      },
      {
        id: 16,
        startTime: '2026-01-17T15:00:00.000Z',
        endTime: '2026-01-17T15:50:00.000Z',
      },
      // Day 4
      {
        id: 17,
        startTime: '2026-01-18T09:00:00.000Z',
        endTime: '2026-01-18T09:50:00.000Z',
      },
      {
        id: 18,
        startTime: '2026-01-18T10:00:00.000Z',
        endTime: '2026-01-18T10:50:00.000Z',
      },
      {
        id: 19,
        startTime: '2026-01-18T13:00:00.000Z',
        endTime: '2026-01-18T13:50:00.000Z',
      },
      {
        id: 20,
        startTime: '2026-01-18T14:00:00.000Z',
        endTime: '2026-01-18T14:50:00.000Z',
      },
    ],
  };

  return (
    <div style={{ maxWidth: '375px', margin: '0 auto' }}>
      <DocCard doc={multiDayDoc} onSlotSelect={(id) => alert(`Selected slot ${id}`)} />
    </div>
  );
};
MobileViewMultipleDays.meta = {
  width: 375,
};
