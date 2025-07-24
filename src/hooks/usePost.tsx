// Third-Party Library
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';

type onSuccess<TResponse> = (data: TResponse) => void;
type onError = (error: AxiosError<{ success: boolean; message?: string }>) => void;

const postFetcher = async <TRequest, TResponse>(url: string, payload: TRequest): Promise<TResponse> => {
  const response = await axiosInstance.post<TResponse>(url, payload);
  return response.data;
};

const usePost = <TRequest, TResponse>(
  key: string[],
  onSuccess?: onSuccess<TResponse>,
  showToast: boolean = false,
  onError?: onError
) => {
  const queryClient = useQueryClient();

  return useMutation<TResponse, unknown, { url: string; payload: TRequest }>({
    mutationFn: async ({ url, payload }) => {
      return postFetcher<TRequest, TResponse>(url, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      const successMessage = (data as { message: string }).message;
      if (showToast) {
        setTimeout(() => {
          toast.success(successMessage);
        }, 100);
      }
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message;
        toast.error(errorMessage ? errorMessage : 'Something went wrong');
        if (onError) {
          onError(error);
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
};

export default usePost;
