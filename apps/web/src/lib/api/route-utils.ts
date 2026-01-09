export function getOptionalQuery(req: Request) {
  const { searchParams } = new URL(req.url);
  const query: Record<string, string> = {};

  for (const [key, value] of searchParams) {
    query[key] = value;
  }

  return Object.keys(query).length ? query : undefined;
}
