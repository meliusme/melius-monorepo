import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Item } from './item';

export const SingleItem: Story = () => {
  const [selected, setSelected] = useState(false);
  return (
    <Item
      title="Click me to toggle"
      selected={selected}
      onClick={() => setSelected(!selected)}
    />
  );
};

export const MultipleItems: Story = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const items = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map((title, index) => (
        <Item
          key={index}
          title={title}
          selected={selected === index}
          onClick={() => setSelected(index === selected ? null : index)}
        />
      ))}
    </div>
  );
};

export const PreSelected: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Item title="Not Selected" selected={false} onClick={() => {}} />
      <Item title="Selected" selected={true} onClick={() => {}} />
    </div>
  );
};
