import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";

interface UploadResponse {
  fileUrl: string;
  message: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export const uploadCustomReportFile = async (formData: FormData): Promise<UploadResponse> => {
  const response = await axiosInstance.post<UploadResponse>("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const useUploadCustomReportFile = () => {
  return useMutation<UploadResponse, ApiError, FormData>({
    mutationFn: uploadCustomReportFile,
    onSuccess: () => {
      toast.success("File uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });
};
