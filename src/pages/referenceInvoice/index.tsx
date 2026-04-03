import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { useSearchParams } from "react-router-dom"; // ✅ ADDED

import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";

import FilePreview from "../../components/common/FilePreview";
import ExcelFilePreview from "../../components/common/ExcelFilePreview";

interface FileItem {
  label: string;
  url: string;
  type: "pdf" | "excel";
}

export default function ReferenceInvoice() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // ✅ GET vendorId from URL
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId");

  const activityList = useGet<any>(
    ["activityListAll"],
    `${GET.Activity_List}?page=1&limit=1000`,
    true
  );

  // ✅ UPDATED: vendorId conditionally added
  const vendorInvoiceList = useGet<any>(
    ["vendorInvoiceListAll", vendorId],
    `${GET.Vendor_Invoice_List}?page=1&limit=1000${
      vendorId ? `&vendorId=${vendorId}` : ""
    }`,
    true
  );

  const loading = activityList.isLoading || vendorInvoiceList.isLoading;

  const mergedFiles: FileItem[] = useMemo(() => {
    const files: FileItem[] = [];

    // ✅ Activity Files
    activityList?.data?.data?.forEach((item: any) => {
      if (!["disclosure", "portfolio"].includes(item.activityType)) return;

      const names = Array.isArray(item.activityFileName)
        ? item.activityFileName
        : [item.activityFileName];

      const paths = Array.isArray(item.activityFilePath)
        ? item.activityFilePath
        : [item.activityFilePath];

      names.forEach((name: string, i: number) => {
        const url = `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${paths[i]}`;

        files.push({
          label: `[Activity - ${item.activityType}] ${name}`,
          url,
          type:
            name.endsWith(".xlsx") || name.endsWith(".xls")
              ? "excel"
              : "pdf",
        });
      });
    });

    // ✅ Vendor Invoice Files
    vendorInvoiceList?.data?.data?.forEach((item: any) => {
      const names = Array.isArray(item.fileName)
        ? item.fileName
        : item.fileName
        ? [item.fileName]
        : [];

      const paths = Array.isArray(item.filePath)
        ? item.filePath
        : item.filePath
        ? [item.filePath]
        : [];

      names.forEach((name: string, i: number) => {
        const url = `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${paths[i]}`;

        files.push({
          label: `[Invoice] ${name}`,
          url,
          type: "pdf",
        });
      });
    });

    return files;
  }, [activityList.data, vendorInvoiceList.data]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Invoice List Reference Files
      </Typography>

      {/* Loader */}
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {/* Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select File</InputLabel>
        <Select
          value={selectedFile?.url || ""}
          label="Select File"
          onChange={(e) => {
            const file = mergedFiles.find((f) => f.url === e.target.value);
            setSelectedFile(file || null);
          }}
        >
          {mergedFiles.map((file, index) => (
            <MenuItem key={index} value={file.url}>
              {file.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Preview */}
      {selectedFile?.type === "pdf" && (
        <FilePreview fileUrl={selectedFile.url} />
      )}

      {selectedFile?.type === "excel" && (
        <ExcelFilePreview fileUrl={selectedFile.url} />
      )}

      {!selectedFile && !loading && (
        <Typography color="text.secondary">
          Please select a file to preview
        </Typography>
      )}
    </Box>
  );
}