import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";

type ApiBaseResponse = {
  success: boolean;
  message?: string;
};

type onSuccess<TResponse> = (data: TResponse) => void;
type onError = (
  error: AxiosError<{ success: boolean; message?: string }>
) => void;

type MultipartRequest<T> = {
  url: string;
  payload: T;
};

// ✅ CLEAN FormData builder (no indexing issue)
const buildFormData = (payload: any): FormData => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    // ✅ multiple files
    if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      value.forEach((file: File) => {
        formData.append(key, file); // 👈 repeated same key
      });
    }

    // ✅ single file
    else if (value instanceof File) {
      formData.append(key, value);
    }

    // ✅ objects (like mappings)
    else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    }

    // ✅ primitives
    else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

const filePostFetcher = async <TRequest, TResponse>(
  url: string,
  payload: TRequest
): Promise<TResponse> => {
  const formData = buildFormData(payload);

  // 🔍 debug (optional)
  // for (let pair of formData.entries()) {
  //   console.log(pair[0], pair[1]);
  // }

  const response = await axiosInstance.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const usePostMultipleMultipart = <
  TRequest,
  TResponse extends ApiBaseResponse
>(
  key: string[],
  onSuccess?: onSuccess<TResponse>,
  showToast: boolean = false,
  onError?: onError
) => {
  const queryClient = useQueryClient();

  return useMutation<TResponse, unknown, MultipartRequest<TRequest>>({
    mutationFn: ({ url, payload }) =>
      filePostFetcher<TRequest, TResponse>(url, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });

      if (showToast) {
        toast.success(data?.message || "Operation successful");
      }

      onSuccess?.(data);
    },

    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Something went wrong");
        onError?.(error);
      } else {
        toast.error("Unexpected error");
      }
    },
  });
};

export default usePostMultipleMultipart;