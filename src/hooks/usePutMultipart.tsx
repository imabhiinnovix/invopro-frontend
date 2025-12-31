import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";

type onSuccess<TResponse> = (data: TResponse) => void;
type onError = (
  error: AxiosError<{ success: boolean; message?: string }>
) => void;
type ApiBaseResponse = {
  message?: string;
};

const objectToFormData = <TRequest,>(
  obj: TRequest,
  form?: FormData,
  namespace?: string
): FormData => {
  const fd = form || new FormData();
  for (const property in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, property)) continue;
    const formKey = namespace ? `${namespace}[${property}]` : property;
    const value = obj[property];

    if (value instanceof File) {
      fd.append(formKey, value);
    } else if (value instanceof Date) {
      fd.append(formKey, value.toISOString());
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      (value instanceof File || value instanceof Blob)
    ) {
      value.forEach((file: File) => {
        fd.append(formKey, file);
      });
    } else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof File)
    ) {
      objectToFormData(value, fd, formKey);
    } else if (value !== undefined && value !== null) {
      fd.append(formKey, String(value));
    }
  }
  return fd;
};

const filePutFetcher = async <TRequest, TResponse>(
  url: string,
  payload: TRequest
): Promise<TResponse> => {
  const formData = objectToFormData(payload);
  const response = await axiosInstance.put(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const usePutMultipart = <TRequest, TResponse extends ApiBaseResponse>(
  key: string[],
  onSuccess?: onSuccess<TResponse>,
  showToast: boolean = false,
  onError?: onError
) => {
  const queryClient = useQueryClient();

  return useMutation<TResponse, unknown, { url: string; payload: TRequest }>({
    mutationFn: ({ url, payload }) =>
      filePutFetcher<TRequest, TResponse>(url, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: key });

      if (showToast) {
        const successMessage = data?.message || "Operation successful";
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
        toast.error(errorMessage ? errorMessage : "Something went wrong");
        if (onError) onError(error);
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
};

export default usePutMultipart;
