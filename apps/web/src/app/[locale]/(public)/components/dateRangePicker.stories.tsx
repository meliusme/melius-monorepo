import type { Story } from '@ladle/react';
import { useState } from 'react';
import { DateRangePicker, DateRangeValue } from './dateRangePicker';

export const DefaultEnglish: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <div style={{ padding: '2rem', maxWidth: '50rem' }}>
      <DateRangePicker value={value} onChange={setValue} />
      {value && (
        <div style={{ marginTop: '2rem', fontSize: '1.4rem' }}>
          <p>
            <strong>Selected:</strong> {value.preset}
          </p>
          <p>
            <strong>From:</strong> {value.fromISO}
          </p>
          <p>
            <strong>To:</strong> {value.toISO}
          </p>
        </div>
      )}
    </div>
  );
};

export const DefaultPolish: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <div style={{ padding: '2rem', maxWidth: '50rem' }}>
      <DateRangePicker value={value} onChange={setValue} />
      {value && (
        <div style={{ marginTop: '2rem', fontSize: '1.4rem' }}>
          <p>
            <strong>Wybrano:</strong> {value.preset}
          </p>
          <p>
            <strong>Od:</strong> {value.fromISO}
          </p>
          <p>
            <strong>Do:</strong> {value.toISO}
          </p>
        </div>
      )}
    </div>
  );
};

export const WithMaxRange: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <div style={{ padding: '2rem', maxWidth: '50rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Max 7 days range</h3>
      <DateRangePicker value={value} onChange={setValue} maxRangeDays={7} />
      {value && (
        <div style={{ marginTop: '2rem', fontSize: '1.4rem' }}>
          <p>
            <strong>Selected:</strong> {value.preset}
          </p>
          <p>
            <strong>From:</strong> {value.fromISO}
          </p>
          <p>
            <strong>To:</strong> {value.toISO}
          </p>
        </div>
      )}
    </div>
  );
};

export const PresetComparison: Story = () => {
  const [today, setToday] = useState<DateRangeValue>();
  const [tomorrow, setTomorrow] = useState<DateRangeValue>();
  const [nextWeek, setNextWeek] = useState<DateRangeValue>();

  return (
    <div
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}
    >
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Today</h3>
        <DateRangePicker
          value={today ? { ...today, preset: 'today' } : undefined}
          onChange={setToday}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Tomorrow</h3>
        <DateRangePicker
          value={tomorrow ? { ...tomorrow, preset: 'tomorrow' } : undefined}
          onChange={setTomorrow}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Next Week</h3>
        <DateRangePicker
          value={nextWeek ? { ...nextWeek, preset: 'nextWeek' } : undefined}
          onChange={setNextWeek}
        />
      </div>
    </div>
  );
};
