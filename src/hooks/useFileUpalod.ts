import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";

export const uploadCustomReportFile = async (formData) => {
  const response = await axiosInstance.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000,
  });
  return response.data;
};

export const useUploadCustomReportFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => uploadCustomReportFile(formData),
    onSuccess: () => {
      toast.success("File uploaded successfully!");
      queryClient.invalidateQueries("reportRequestList");
    },
    onError: (error) => {
      toast.error(` ${error.response?.data?.message || error.message}`);
    },
  });
};
