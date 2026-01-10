import { backendFetch } from 'src/lib/api/server/backend';
import type { ApiResponse } from 'src/lib/api/types';

type SearchResponse = ApiResponse<'/matches/search-with-slots', 'post'>;

type SearchParams = {
  problemId?: string;
  from?: string;
  to?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const problemId = searchParams.problemId
    ? Number(searchParams.problemId)
    : undefined;

  const data = await backendFetch<SearchResponse>({
    method: 'POST',
    path: '/matches/search-with-slots',
    body: {
      problemId,
      from: searchParams.from,
      to: searchParams.to,
    },
    auth: false,
  });

  return <div>{JSON.stringify(data)}</div>;
}
