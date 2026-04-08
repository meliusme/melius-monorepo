import type { Story } from '@ladle/react';
import { useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import DateRangePicker from './dateRangePicker';
import type { DateRangeValue } from '@/lib/types/date';

const messages = {
  en: {
    DateRangePicker: {
      quickSelect: 'Quick select',
      today: 'Today',
      tomorrow: 'Tomorrow',
      nextWeek: 'Next week',
      range: 'Range',
      from: 'From',
      to: 'To',
    },
  },
  pl: {
    DateRangePicker: {
      quickSelect: 'Szybki wybór',
      today: 'Dzisiaj',
      tomorrow: 'Jutro',
      nextWeek: 'W przyszłym tygodniu',
      range: 'Zakres',
      from: 'Od',
      to: 'Do',
    },
  },
};

export const DefaultEnglish: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <NextIntlClientProvider locale="en" messages={messages.en}>
      <div style={{ padding: '2rem', maxWidth: '50rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>English (week starts Sunday)</h3>
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
    </NextIntlClientProvider>
  );
};

export const DefaultPolish: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <NextIntlClientProvider locale="pl" messages={messages.pl}>
      <div style={{ padding: '2rem', maxWidth: '50rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>
          Polski (tydzień zaczyna się w poniedziałek)
        </h3>
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
    </NextIntlClientProvider>
  );
};

export const LocaleComparison: Story = () => {
  const [enValue, setEnValue] = useState<DateRangeValue>();
  const [plValue, setPlValue] = useState<DateRangeValue>();

  return (
    <div
      style={{
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
      }}
    >
      <NextIntlClientProvider locale="en" messages={messages.en}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>🇺🇸 English (Sunday start)</h3>
          <DateRangePicker value={enValue} onChange={setEnValue} />
        </div>
      </NextIntlClientProvider>

      <NextIntlClientProvider locale="pl" messages={messages.pl}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>🇵🇱 Polski (Monday start)</h3>
          <DateRangePicker value={plValue} onChange={setPlValue} />
        </div>
      </NextIntlClientProvider>
    </div>
  );
};

export const WithMaxRange: Story = () => {
  const [value, setValue] = useState<DateRangeValue>();

  return (
    <NextIntlClientProvider locale="en" messages={messages.en}>
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
    </NextIntlClientProvider>
  );
};
