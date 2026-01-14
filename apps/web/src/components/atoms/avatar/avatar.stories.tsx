import type { Story } from '@ladle/react';
import Avatar from './avatar';

export const WithAvatar: Story = () => (
  <div style={{ padding: '2rem' }}>
    <Avatar avatarUrl="https://i.pravatar.cc/300?img=1" name="John Doe" sizeRem={8} />
  </div>
);

export const WithoutAvatar: Story = () => (
  <div style={{ padding: '2rem' }}>
    <Avatar name="Jane Smith" sizeRem={8} />
  </div>
);

export const SmallSize: Story = () => (
  <div style={{ padding: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <Avatar avatarUrl="https://i.pravatar.cc/300?img=2" name="Small Avatar" sizeRem={6} />
    <Avatar name="Small No Avatar" sizeRem={6} />
  </div>
);

export const LargeSize: Story = () => (
  <div style={{ padding: '2rem' }}>
    <Avatar
      avatarUrl="https://i.pravatar.cc/300?img=3"
      name="Large Avatar"
      sizeRem={12}
    />
  </div>
);
