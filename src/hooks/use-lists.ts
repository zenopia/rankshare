import { keepPreviousData } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { List } from "@/types/list";

interface ListsResponse {
  lists: List[];
}

async function fetchLists(params: URLSearchParams): Promise<List[]> {
  const response = await fetch(`/api/lists/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lists');
  }
  const data = await response.json() as ListsResponse;
  return data.lists;
}

export function useLists(params: URLSearchParams) {
  return useQuery({
    queryKey: ['lists', params.toString()],
    queryFn: () => fetchLists(params),
    placeholderData: keepPreviousData,
  });
} 