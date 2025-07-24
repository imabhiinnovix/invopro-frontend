
// Third-Party Library
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';

type onSuccess<TResponse> = (data: TResponse) => void;
type onError = (error: AxiosError<{ success: boolean; message?: string }>) => void;

async function deleteFetcher<TResponse>(url: string): Promise<TResponse> {
  const response = await axiosInstance.delete<TResponse>(url);
  return response.data;
}

function useDelete<TResponse>(
  key: string[],
  onSuccess?: onSuccess<TResponse>,
  showToast: boolean = false,
  onError?: onError
) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, unknown, { url: string }>({
    mutationFn: async ({ url }) => {
      return deleteFetcher<TResponse>(url);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      const successMessage = (data as { message?: string }).message;
      if (showToast && successMessage) {
        setTimeout(() => {
          toast.success(successMessage);
        }, 100);
      }
      onSuccess && onSuccess(data);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message;
        toast.error(errorMessage ? errorMessage : 'Something went wrong');
        onError && onError(error);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
}

export default useDelete; 
