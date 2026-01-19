import type { Story } from '@ladle/react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import Button from './button';

export const Primary: Story = () => (
  <Button label="Primary Button" onClick={() => console.log('clicked')} />
);

export const Secondary: Story = () => (
  <Button
    label="Secondary Button"
    onClick={() => console.log('clicked')}
    variant="secondary"
  />
);

export const Tertiary: Story = () => (
  <Button
    label="Tertiary Button"
    onClick={() => console.log('clicked')}
    variant="tertiary"
  />
);

export const Large: Story = () => (
  <Button label="Large Button" onClick={() => console.log('clicked')} large />
);

export const Disabled: Story = () => (
  <Button label="Disabled Button" onClick={() => console.log('clicked')} disabled />
);

export const WithCustomWidth: Story = () => (
  <Button label="Custom Width" onClick={() => console.log('clicked')} width={300} />
);

export const Rounded: Story = () => (
  <Button label="Rounded Button" onClick={() => console.log('clicked')} rounded />
);

export const RoundedLarge: Story = () => (
  <Button label="Large Rounded" onClick={() => console.log('clicked')} large rounded />
);

export const WithIcon: Story = () => (
  <Button
    label="Button with Icon"
    onClick={() => console.log('clicked')}
    icon={<ArrowRight size={16} />}
  />
);

export const RoundedWithIcon: Story = () => (
  <Button
    label="Rounded with Icon"
    onClick={() => console.log('clicked')}
    rounded
    icon={<Send size={16} />}
  />
);

export const LargeRoundedWithIcon: Story = () => (
  <Button
    label="Large Rounded with Icon"
    onClick={() => console.log('clicked')}
    large
    rounded
    icon={<Sparkles size={20} />}
  />
);
