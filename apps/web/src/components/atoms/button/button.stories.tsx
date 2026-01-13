import type { Story } from '@ladle/react';
import { Button } from './button';

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
  <Button
    label="Large Button"
    onClick={() => console.log('clicked')}
    large
  />
);

export const Disabled: Story = () => (
  <Button
    label="Disabled Button"
    onClick={() => console.log('clicked')}
    disabled
  />
);

export const WithCustomWidth: Story = () => (
  <Button
    label="Custom Width"
    onClick={() => console.log('clicked')}
    width={300}
  />
);
