export type RangePreset = 'today' | 'tomorrow' | 'nextWeek' | 'range';

export type DateRangeValue = {
  preset: RangePreset;
  fromISO: string; // YYYY-MM-DD
  toISO: string; // YYYY-MM-DD
};
