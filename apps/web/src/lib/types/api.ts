import type { ApiResponse } from '@lib/api/types';

export type ProblemsResponse = ApiResponse<'/matches/problems', 'get'>;
export type SearchWithSlotsResponse = ApiResponse<'/matches/search-with-slots', 'post'>;
