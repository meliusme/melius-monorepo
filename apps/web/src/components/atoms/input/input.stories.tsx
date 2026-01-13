import type { Story } from '@ladle/react';
import { useState } from 'react';
import { Input } from './input';

export const Normal: Story = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      name="normal"
      label="Normal Input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export const Password: Story = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      name="password"
      label="Password"
      variant="password"
      type="password"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export const Textarea: Story = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      name="textarea"
      label="Textarea"
      variant="textarea"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export const Large: Story = () => {
  const [value, setValue] = useState('');
  return (
    <Input
      name="large"
      label="Large Input"
      large
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export const WithError: Story = () => {
  return <Input name="error" label="Input with Error" error="This field is required" />;
};

export const WithMultipleErrors: Story = () => {
  return (
    <Input
      name="errors"
      label="Multiple Errors"
      errors={[
        'Error 1: Too short',
        'Error 2: Invalid format',
        'Error 3: Already exists',
      ]}
    />
  );
};
