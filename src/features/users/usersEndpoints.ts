export const usersEndpoints = {
  search: (query: string) =>
    `/users/search?q=${encodeURIComponent(query)}`,
} as const;
