import type { Story } from '@ladle/react';
import { Rate } from './rate';

export const CompactHighRating: Story = () => (
  <Rate rate={4.8} ratesLot={156} compact={true} />
);

export const CompactMediumRating: Story = () => (
  <Rate rate={3.5} ratesLot={42} compact={true} />
);

export const CompactLowRating: Story = () => (
  <Rate rate={2.3} ratesLot={8} compact={true} />
);

export const CompactPerfectRating: Story = () => (
  <Rate rate={5.0} ratesLot={203} compact={true} />
);

export const FullStarsHighRating: Story = () => (
  <Rate rate={4.7} ratesLot={89} compact={false} />
);

export const FullStarsMediumRating: Story = () => (
  <Rate rate={3.2} ratesLot={24} compact={false} />
);

export const FullStarsLowRating: Story = () => (
  <Rate rate={1.8} ratesLot={5} compact={false} />
);

export const FullStarsPerfectRating: Story = () => (
  <Rate rate={5.0} ratesLot={150} compact={false} />
);

export const NoRatings: Story = () => <Rate rate={0} ratesLot={0} compact={true} />;

export const ComparisonView: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Compact View</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Rate rate={5.0} ratesLot={200} compact={true} />
        <Rate rate={4.5} ratesLot={150} compact={true} />
        <Rate rate={3.5} ratesLot={75} compact={true} />
        <Rate rate={2.5} ratesLot={30} compact={true} />
        <Rate rate={1.5} ratesLot={10} compact={true} />
      </div>
    </div>

    <div>
      <h3 style={{ marginBottom: '1rem' }}>Full Stars View</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Rate rate={5.0} ratesLot={200} compact={false} />
        <Rate rate={4.5} ratesLot={150} compact={false} />
        <Rate rate={3.5} ratesLot={75} compact={false} />
        <Rate rate={2.5} ratesLot={30} compact={false} />
        <Rate rate={1.5} ratesLot={10} compact={false} />
      </div>
    </div>
  </div>
);
