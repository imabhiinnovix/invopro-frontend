import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";

import FilePreview from "../../components/common/FilePreview";
import ExcelFilePreview from "../../components/common/ExcelFilePreview";
import axiosInstance from "../../services/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import { AttributeOptionRequestPayload } from "../../components/atom/attributeOption/types";
import { ValidationInlineErrorModal } from "../validationErrors/ValidationInlineErrorModal";
import { ValidationNoErrorInlineErrorModal } from "../validationErrors/ValidationNoErrorInlineModal";

interface FileItem {
  label: string;
  url: string;
  type: "pdf" | "excel";
}

export default function ReferenceInvoice() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const errorId = searchParams.get("errorId");
  const dataSourceId = searchParams.get("dataSourceId");
  const dataSourceVersionId = searchParams.get("dataSourceVersionId");
  const rowNumber = searchParams.get("rowNumber");

  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [derivedVendorId, setDerivedVendorId] = useState<string | null>(null);

  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list
  );

  const currentDataSource = commonDataSourceList?.find(
    (ds: any) => ds?._id === dataSourceId
  );

  const versionId = dataSourceVersionId;

let fileUploadPath = "";

if (currentDataSource?.dataSourceVersion?._id === versionId) {
  // ✅ Current version
  fileUploadPath = currentDataSource.dataSourceVersion.filePath || "";
} else {
  // ✅ Previous versions
  const version = currentDataSource?.allDataSourceVersions?.find(
    (v: any) => v._id === versionId
  );

  fileUploadPath = version?.filePath || "";
}

  

  useEffect(() => {
    const fetchEditData = async () => {
      if (!errorId || !dataSourceId || !dataSourceVersionId) return;

      setLoadingEdit(true);

      try {
        const url = `${GET.ERROR_ROW_DATA}?dataSourceVersionId=${dataSourceVersionId}&dataSourceId=${dataSourceId}&errorId=${errorId}&rowNumber=${rowNumber}`;
        const response = await axiosInstance.get(url);

        if (response.data?.success) {
          setEditData(response.data.data);
          setSelectedRow(response.data.data?.errorRecord);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEdit(false);
      }
    };

    fetchEditData();
  }, [errorId, dataSourceId, dataSourceVersionId]);


  const vendorList = useGet<{
  success: boolean;
  data: any[];
}>(
  ["vendorListAll"],
  `${GET.Vendor_List}?paginate=false`,
  true
);

useEffect(() => {
  // Only run when vendorId is NOT in URL
  if (vendorId || !vendorList?.data?.data || !selectedRow) return;

  const vendorMap = new Map<string, string>();

  vendorList.data.data.forEach((vendor: any) => {
    if (vendor?.name) {
      vendorMap.set(vendor.name.trim().toLowerCase(), vendor._id);
    }
  });

  console.log('data', editData);

  const rawLawFirm = editData?.rowData?.["Law Firm Name"];

  const lawFirmName = Array.isArray(rawLawFirm)
    ? rawLawFirm[0]?.trim().toLowerCase()  // first element if array
    : rawLawFirm?.trim().toLowerCase();   // just trim if string

  if (lawFirmName && vendorMap.has(lawFirmName)) {
    setDerivedVendorId(vendorMap.get(lawFirmName) || null);
  }
}, [vendorId, vendorList.data, selectedRow]);

const finalVendorId: any = vendorId || derivedVendorId;

  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
  }>([`attributeList`], GET?.Attribute_Option_List + `?paginate=false`);

  const activityList = useGet<any>(
    ["activityListAll"],
    `${GET.Activity_List}?page=1&limit=1000`,
    true
  );

  const vendorInvoiceList = useGet<any>(
    ["vendorInvoiceListAll", finalVendorId],
    `${GET.Vendor_Invoice_List}?page=1&limit=1000${
      finalVendorId ? `&vendorId=${finalVendorId}` : ""
    }`,
    true
  );

  const loading = activityList.isLoading || vendorInvoiceList.isLoading;

  const mergedFiles: FileItem[] = useMemo(() => {
    const files: FileItem[] = [];

     // ✅ Add fileUploadPath FIRST
  if (fileUploadPath) {
    const url = `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${fileUploadPath}`;
    const name = fileUploadPath.split("/").pop() || "Invoice Sheet";

    files.push({
      label: `[Invoice Sheet] ${name}`,
      url,
      type:
        name.endsWith(".xlsx") || name.endsWith(".xls")
          ? "excel"
          : "pdf",
    });
  }

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
          label: `[Invoice PDF] ${name}`,
          url,
          type: "pdf",
        });
      });
    });

    return files;
  }, [activityList.data, vendorInvoiceList.data, fileUploadPath]);

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* LEFT - 40% */}
      <Box sx={{ width: "100%", overflow: "auto", position: "relative" }}>

        {loadingEdit ? (
          <CircularProgress />
        ) : editData ? (
           selectedRow ? (
          <ValidationInlineErrorModal
            openModal={true}
            rowData={selectedRow}
            rowDetailData={editData}
            attributeListData={attributeList?.data?.data || []}
            handleCloseModal={() => window.close()}
            refreshData={() => {}}
            currentDataSource={currentDataSource}
          />
        ):  <ValidationNoErrorInlineErrorModal
            openModal={true}
            rowData={editData}
            rowDetailData={editData}
            attributeListData={attributeList?.data?.data || []}
            handleCloseModal={() => window.close()}
            refreshData={() => {}}
            currentDataSource={currentDataSource}
          /> ) : (
          <Typography>No data found</Typography>
        )}
      </Box>

      {/* RIGHT - 60% */}
      <Box sx={{ width: "100%", overflow: "hidden" }}>
        <Box p={3}>
          <Typography variant="h5" mb={2}>
            Invoice List Reference Files
          </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" mb={2}>
              <CircularProgress />
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select File</InputLabel>
            <Select
              value={selectedFile?.url || ""}
              label="Select File"
              onChange={(e) => {
                const file = mergedFiles.find(
                  (f) => f.url === e.target.value
                );
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

          {/* PDF */}
          {selectedFile?.type === "pdf" && (
            <Box
              sx={{
                width: "100%",
                height: "800px",
                border: "1px solid #ddd",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <FilePreview fileUrl={selectedFile.url} />
            </Box>
          )}

          {/* EXCEL */}
          {selectedFile?.type === "excel" && (
            <Box
              sx={{
                width: "100%",
                height: "800px",
                border: "1px solid #ddd",
                borderRadius: 2,
                overflowX: "auto",
                overflowY: "auto",
              }}
            >
              <ExcelFilePreview fileUrl={selectedFile.url} />
            </Box>
          )}

          {!selectedFile && !loading && (
            <Typography color="text.secondary">
              Please select a file to preview
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}