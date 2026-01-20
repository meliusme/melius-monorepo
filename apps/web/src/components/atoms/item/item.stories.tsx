import type { Story } from '@ladle/react';
import { useState } from 'react';
import Item from './item';
import { User, Calendar, Settings, Bell } from 'lucide-react';

export const SingleItem: Story = () => {
  const [selected, setSelected] = useState(false);
  return (
    <Item
      icon={<User />}
      title="Click me to toggle"
      selected={selected}
      onClick={() => setSelected(!selected)}
    />
  );
};

export const MultipleItems: Story = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const items = [
    { title: 'User Profile', icon: <User /> },
    { title: 'Calendar', icon: <Calendar /> },
    { title: 'Settings', icon: <Settings /> },
    { title: 'Notifications', icon: <Bell /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map((item, index) => (
        <Item
          key={index}
          icon={item.icon}
          title={item.title}
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
      <Item icon={<User />} title="Not Selected" selected={false} onClick={() => {}} />
      <Item icon={<Calendar />} title="Selected" selected={true} onClick={() => {}} />
    </div>
  );
};
