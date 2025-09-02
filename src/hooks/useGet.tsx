import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';

const fetcher = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
  console.log('🔍 Fetching URL:', url);
  const { data } = await axiosInstance.get<T>(url, {
    signal,
  });
  return data;
};

const useGet = <T,>(key: string[], url: string, enabled: boolean = true): UseQueryResult<T> => {
  return useQuery<T>({
    queryKey: key,
    queryFn: ({ signal }) => fetcher<T>(url, signal),
    enabled: enabled,
    staleTime: 0,
  });
};

export default useGet;
