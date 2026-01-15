import { z } from 'zod';

// Schema for the entire multi-step form
export const matchStepperSchema = z.object({
  problemId: z.number().nullable(),
  dateRange: z
    .object({
      preset: z.enum(['today', 'tomorrow', 'nextWeek', 'range']),
      fromISO: z.string(),
      toISO: z.string(),
    })
    .nullable(),
  selectedSlotId: z.number().nullable(),
});

export type MatchStepperFormData = z.infer<typeof matchStepperSchema>;

export const defaultValues: MatchStepperFormData = {
  problemId: null,
  dateRange: null,
  selectedSlotId: null,
};

// Schema for API request to /matches/search-with-slots
export const searchMatchesSchema = z.object({
  problemId: z.number(),
  from: z.string(), // ISO 8601 date-time
  to: z.string(), // ISO 8601 date-time
});

export type SearchMatchesInput = z.infer<typeof searchMatchesSchema>;
