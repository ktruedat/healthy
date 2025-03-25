import { useQuery } from '@tanstack/react-query';

export function useDashboardTrends() {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/trends');
      if (!response.ok) {
        throw new Error('Failed to fetch trends data');
      }
      return response.json();
    }
  });
}