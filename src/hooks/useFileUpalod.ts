import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { toast } from "react-toastify";

export const uploadCustomReportFile = async (formData) => {
  console.log("formData", formData);
  const response = await axiosInstance.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const useUploadCustomReportFile = () => {
  return useMutation({
    mutationFn: (formData) => uploadCustomReportFile(formData),
    onSuccess: () => {
      toast.success("File uploaded successfully!");
    },
    onError: (error) => {
      toast.error(` ${error.response?.data?.message || error.message}`);
    },
  });
};
