// Third-Party Library
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-toastify';
import axios from 'axios';

type onSuccess = () => void;

const filePostFetcher = async <
  TRequest extends Record<string, string | Blob | File | File[] | null | undefined>,
  TResponse,
>(
  url: string,
  payload: TRequest,
): Promise<TResponse> => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append(key, file);
          }
        });
      } else {
        formData.append(key, value);
      }
    }
  });
  const response = await axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const useFilePostData = <TRequest extends Record<string, string | Blob | File | File[] | null | undefined>, TResponse>(
  key: string[],
  onSuccess?: onSuccess,
  showToast: boolean = false,
) => {
  const queryClient = useQueryClient();
  return useMutation<TResponse, unknown, { url: string; payload: TRequest }>({
    mutationFn: ({ url, payload }) => filePostFetcher<TRequest, TResponse>(url, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      const successMessage = (data as { message: string }).message;
      if (showToast) {
        toast.success(successMessage);
      }
      onSuccess && onSuccess();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message;
        toast.error(errorMessage ? errorMessage : 'Something went wrong');
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
};

export default useFilePostData;
