// Third-Party Library
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";
import axios from "axios";

type onSuccess<TResponse> = (data: TResponse, fileName?: string) => void;

const postFetcher = async <TResponse,>(url: string): Promise<TResponse> => {
  const response = await axiosInstance.get<TResponse>(url, {
    responseType: "blob",
  }); // calling get call
  return response.data;
};

const useFileDownload = <TResponse,>(
  onSuccess?: onSuccess<TResponse>,
  showToast: boolean = false
) => {
  return useMutation<TResponse, unknown, { url: string; fileName?: string }>({
    mutationFn: async ({ url }) => {
      return postFetcher<TResponse>(url);
    },
    onSuccess: (data, variables) => {
      const successMessage = (data as { message: string }).message;
      if (showToast) {
        toast.success(successMessage);
      }
      onSuccess && onSuccess(data, variables?.fileName);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message;
        toast.error(errorMessage ? errorMessage : "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
};

export default useFileDownload;
