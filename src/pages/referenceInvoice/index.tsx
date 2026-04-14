import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Tooltip,
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
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface FileItem {
  label: string;
  url: string;
  type: "pdf" | "excel";
}

export default function ReferenceInvoice() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const errorId = searchParams.get("errorId"); // kept
  const dataSourceId = searchParams.get("dataSourceId");
  const dataSourceVersionId = searchParams.get("dataSourceVersionId");
  const isErrorLog = searchParams.get("isErrorLog") ? Number(searchParams.get("isErrorLog")) : 1;


  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [derivedVendorId, setDerivedVendorId] = useState<string | null>(null);
  const [pendingDirection, setPendingDirection] = useState(null);

  const [rowList, setRowList] = useState<any[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [triggerSave, setTriggerSave] = useState(0);
const [navLoading, setNavLoading] = useState(false);
const limit = 10;
const [totalPage, setTotalPage] = useState(1);
const initialPage = useMemo(() => {
  return searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;
}, []);

const initialRowNumber = useMemo(() => {
  return searchParams.get("rowNumber")
    ? Number(searchParams.get("rowNumber"))
    : null;
}, []);
const [page, setPage] = useState(initialPage);
const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  

  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list
  );

  const currentDataSource = commonDataSourceList?.find(
    (ds: any) => ds?._id === dataSourceId
  );

  const versionId = dataSourceVersionId;

  let fileUploadPath = "";

  if (currentDataSource?.dataSourceVersion?._id === versionId) {
    fileUploadPath = currentDataSource.dataSourceVersion.filePath || "";
  } else {
    const version = currentDataSource?.allDataSourceVersions?.find(
      (v: any) => v._id === versionId
    );
    fileUploadPath = version?.filePath || "";
  }

 const ErrorList = useGet<any>(
  ["ErrorList", dataSourceVersionId, page],
  dataSourceVersionId
    ? `${GET.NO_ERROR_ROW_DATA}?page=${page}
        &limit=${limit}
        &dataSourceVersionId=${dataSourceVersionId}
        &dataSourceId=${dataSourceId}
        &isErrorLog=${isErrorLog}
        &sort=${encodeURIComponent(JSON.stringify({ rowNumber: 1 }))}`
    : "",
  !!dataSourceVersionId
);


useEffect(() => {
  const list = ErrorList?.data?.data;
  const pagination = ErrorList?.data?.pagination;

  // ✅ SET TOTAL PAGE (always)
  if (pagination?.totalPages) {
    setTotalPage(pagination.totalPages);
  }

  if (!Array.isArray(list)) return;

  setRowList(list);

  // ❗ IMPORTANT: handle empty list (last page edge case)
  if (list.length === 0) {
    setNavLoading(false);
    return;
  }

  // ✅ ONLY apply initialRowNumber on first page
  // ✅ ONLY FIRST LOAD → apply rowNumber
  if (!isInitialLoadDone && initialRowNumber != null) {
    const idx = list.findIndex(
      (r) => Number(r.rowNumber) === initialRowNumber
    );

    setCurrentIndex(idx >= 0 ? idx : 0);
    setIsInitialLoadDone(true);
  }

  // ✅ NO rowNumber → default first row
  if (!isInitialLoadDone && initialRowNumber == null) {
    setCurrentIndex(0);
    setIsInitialLoadDone(true);
  }

  setNavLoading(false); // ✅ stop loader after API
}, [ErrorList?.data]);

// useEffect(() => {
//   const list = ErrorList?.data?.data || [];
//   if (!list.length) return;

//   setRowList(list);

//   if (initialRowNumber != null) {
//     const idx = list.findIndex(
//       (r) => Number(r.rowNumber) === initialRowNumber
//     );

//     setCurrentIndex(idx >= 0 ? idx : 0);
//   } else {
//     setCurrentIndex(0);
//   }
// }, [ErrorList.data]);

useEffect(() => {
  console.log("FULL API RESPONSE:", ErrorList?.data);
}, [ErrorList?.data]);

const activeRowNumber = useMemo(() => {
  return rowList?.[currentIndex]?.rowNumber ?? null;
}, [rowList, currentIndex]);

const activeRow = rowList[currentIndex] || null;

const goNext = () => {
  if (navLoading || loadingEdit) return;

  const isSingleRow = rowList.length <= 1;
  const isLastRow = currentIndex >= rowList.length - 1;

  setNavLoading(true);

  // 🔥 SINGLE ROW → save only
  if (isSingleRow) {
    setPendingDirection(null);
    setTriggerSave((prev) => prev + 1);
    return;
  }

  // 🔥 LAST ROW → save only
  if (isLastRow) {
     // ❌ NO MORE PAGES → ONLY SAVE
  if (page >= totalPage) {
    setPendingDirection(null);
    setTriggerSave((prev) => prev + 1);
    return;
  }
    setPendingDirection("next-page");
    setTriggerSave((prev) => prev + 1);
    return;
  }

  // 🔥 NORMAL CASE → save + next
  setPendingDirection("next");
  setTriggerSave((prev) => prev + 1);
};
const goPrev = () => {
  if (navLoading || loadingEdit) return;

  const isSingleRow = rowList.length <= 1;
  const isFirst = currentIndex === 0;

  setNavLoading(true);

  if (isSingleRow) return;
   // 🔥 FIRST ROW → PREVIOUS PAGE
  if (isFirst) {
  if (page === 1) {
    // ✅ ONLY SAVE (no API call)
    setPendingDirection(null);
    setTriggerSave((prev) => prev + 1);
    return;
  }

    setPendingDirection("prev-page"); // 👈 NEW
    setTriggerSave((prev) => prev + 1);
    return;
  }


  setPendingDirection("prev");
  setTriggerSave((prev) => prev + 1);
};

// const handleAfterSave = () => {
//   console.log('sssss');
//   const hasMultipleRows = rowList.length > 1;
//  setTriggerSave(0);
//   setCurrentIndex((prev) => {
//     console.log('set current index..')
//     if (!hasMultipleRows) return prev; // 🔥 SINGLE ROW: NO CHANGE

//     if (pendingDirection === "next") {
//       return Math.min(prev + 1, rowList.length - 1);
//     }

//     if (pendingDirection === "prev") {
//       return Math.max(prev - 1, 0);
//     }

//     return prev;
//   });

//   setPendingDirection(null);
// };
const handleAfterSave = () => {
  const hasMultipleRows = rowList.length > 1;

  setTriggerSave(0);

  // ✅ NEXT PAGE
  if (pendingDirection === "next-page") {
    setPage((prev) => prev + 1);
    setCurrentIndex(0);
    setPendingDirection(null);
    return;
  }

  // ✅ PREVIOUS PAGE
  if (pendingDirection === "prev-page") {
    setPage((prev) => prev - 1);
    setCurrentIndex(limit - 1);
    setPendingDirection(null);
    return;
  }

  // ✅ NORMAL NAVIGATION
  setCurrentIndex((prev) => {
    if (!hasMultipleRows) return prev;

    if (pendingDirection === "next") {
      return Math.min(prev + 1, rowList.length - 1);
    }

    if (pendingDirection === "prev") {
      return Math.max(prev - 1, 0);
    }

    return prev;
  });

  setPendingDirection(null);
};

const isSingleRow = rowList.length <= 1;
const isFirst = currentIndex === 0;
const isLast = currentIndex === rowList.length - 1;

useEffect(() => {
  if (!loadingEdit && navLoading && !pendingDirection) {
    setNavLoading(false);
  }
}, [loadingEdit, navLoading, pendingDirection]);

  // ✅ KEEP API, but remove errorId + selectedRow usage
useEffect(() => {
  const fetchEditData = async () => {
    if (!dataSourceId || !dataSourceVersionId || !activeRowNumber) return;

    setLoadingEdit(true);

    try {
      const url = `${GET.ERROR_ROW_DATA}?dataSourceVersionId=${dataSourceVersionId}&dataSourceId=${dataSourceId}&rowNumber=${activeRowNumber}`;

      const response = await axiosInstance.get(url);

      if (response.data?.success) {
        setEditData(response.data.data);
      }
    } finally {
      setLoadingEdit(false);
    }
  };

  fetchEditData();
}, [activeRowNumber, dataSourceId, dataSourceVersionId]);

// useEffect(() => {
//   const list = ErrorList?.data?.data?.data;
//   if (!Array.isArray(list) || list.length === 0) return;

//   setRowList(list);

//   if (initialRowNumber != null) {
//     const idx = list.findIndex(
//       (r) => Number(r.rowNumber) === initialRowNumber
//     );

//     setCurrentIndex(idx >= 0 ? idx : 0);
//   } else {
//     setCurrentIndex(0);
//   }
// }, [ErrorList?.data?.data, initialRowNumber]);

// const rowNumbers = useMemo(() => {
//   return activeRowNumber ? [activeRowNumber] : [];
// }, [activeRowNumber]);
console.log("rowList", rowList);
console.log("currentIndex", currentIndex);
console.log("activeRowNumber", activeRowNumber);

  // ✅ NEW: VALIDATION ERROR LIST
 const validationErrorList = useGet<any>(
  [
    "validationErrorList",
    activeRowNumber,
    dataSourceVersionId,
    dataSourceId,
  ],
  dataSourceVersionId && activeRowNumber
    ? `${GET.VALIDATION_ERROR_LIST}?dataSourceVersionId=${dataSourceVersionId}&dataSourceId=${dataSourceId}&filters=${encodeURIComponent(
        JSON.stringify({ rowNumber: [activeRowNumber], status: "open" })
      )}&paginate=false`
    : "",
  !!dataSourceVersionId && !!activeRowNumber
);

  // ✅ SET ALL ERRORS FROM VALIDATION API
useEffect(() => {
  const list = validationErrorList?.data?.data;

  if (validationErrorList?.isLoading) return;

  // ❌ NO validation errors → SKIP
  if (!list || list.length === 0) {
    setSelectedRow(null);

    // 🔥 LAST ROW → go next page
    if (currentIndex >= rowList.length - 1) {
      if (page < totalPage) {
        setPage((p) => p + 1);
        setCurrentIndex(0);
      }
      return;
    }

    // 🔥 FIRST ROW + PREV → go previous page
    if (currentIndex === 0 && pendingDirection === "prev") {
      if (page > 1) {
        setPage((p) => p - 1);
        setCurrentIndex(limit - 1);
      }
      return;
    }

    // 🔥 NORMAL SKIP
    setCurrentIndex((prev) => {
      if (pendingDirection === "prev") {
        return Math.max(prev - 1, 0);
      }
      return Math.min(prev + 1, rowList.length - 1);
    });

    return;
  }

  // ✅ HAS validation errors → show modal
  setSelectedRow(list);

}, [validationErrorList?.data?.data]);

  const vendorList = useGet<{
    success: boolean;
    data: any[];
  }>(
    ["vendorListAll"],
    `${GET.Vendor_List}?paginate=false`,
    true
  );

  useEffect(() => {
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
      ? rawLawFirm[0]?.trim().toLowerCase()
      : rawLawFirm?.trim().toLowerCase();

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
  ["activityListAll", editData?.versionValue],
  editData?.versionValue
    ? `${GET.Activity_File_List}?versionValue=${editData.versionValue}`
    : "",
  !!editData?.versionValue // ✅ prevent early call
);

  const vendorInvoiceList = useGet<any>(
  ["vendorInvoiceListAll", finalVendorId, editData?.versionValue],
  editData?.versionValue
    ? `${GET.Vendor_Invoice_List}?paginate=false&versionValue=${editData.versionValue}${
        finalVendorId ? `&vendorId=${finalVendorId}` : ""
      }`
    : "",
  !!editData?.versionValue // ✅ prevent early call
);

  const loading = activityList.isLoading || vendorInvoiceList.isLoading;

  const mergedFiles: FileItem[] = useMemo(() => {
    const files: FileItem[] = [];

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
      // if (!["disclosure", "portfolio"].includes(item.activityType)) return;

      const names = Array.isArray(item.activityFileName)
        ? item.activityFileName
        : [item.activityFileName];

      const paths = Array.isArray(item.activityFilePath)
        ? item.activityFilePath
        : [item.activityFilePath];

      names.forEach((name: string, i: number) => {
        const url = `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${paths[i]}`;

        files.push({
          label: `[Activity - ${item.activityType} - ${item.versionValue}] ${name}`,
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
  
      <Box sx={{ width: "100%", overflow: "visible", position: "relative" }}>
        {/* SIDE NAVIGATION */}
<Box
  sx={{
    position: "absolute",
    top: "50%",
    left: -50,
    transform: "translateY(-50%)",
    zIndex: 20,
  }}
>
  <Tooltip title="Previous">
    <span>
      <IconButton
        onClick={goPrev}
        disabled={isSingleRow || navLoading || loadingEdit}
        sx={{
          background: "#fff",
          border: "1px solid #ddd",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
    </span>
  </Tooltip>
</Box>

<Box
  sx={{
    position: "absolute",
    top: "50%",
    right: -50,
    transform: "translateY(-50%)",
    zIndex: 20,
  }}
>
  <Tooltip title="Next">
    <span>
      <IconButton
        onClick={goNext}
        disabled={navLoading || loadingEdit}
        sx={{
          background: "#fff",
          border: "1px solid #ddd",
          boxShadow: 2,
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </span>
  </Tooltip>
</Box>
        {loadingEdit ? (
          <CircularProgress />
        ) : editData ? (
          isErrorLog > 0 ? (
            <ValidationInlineErrorModal
              openModal={true}
              rowData={selectedRow}
              rowDetailData={activeRow}
              attributeListData={attributeList?.data?.data || []}
              handleCloseModal={() => window.close()}
              refreshData={() => {}}
              currentDataSource={currentDataSource}
              onSaved={handleAfterSave}
              triggerSave={triggerSave}
            />
          ) : (
            <ValidationNoErrorInlineErrorModal
              openModal={true}
              rowData={editData}
              rowDetailData={editData}
              attributeListData={attributeList?.data?.data || []}
              handleCloseModal={() => window.close()}
              refreshData={() => {}}
              currentDataSource={currentDataSource}
              onSaved={handleAfterSave}
              triggerSave={triggerSave}
            />
          )
        ) : (
          <Typography>No data found</Typography>
        )}
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
{/* <button
  onClick={goPrev}
  disabled={isSingleRow || isFirst || navLoading || loadingEdit}
  style={{
    opacity: isSingleRow || isFirst || navLoading || loadingEdit ? 0.5 : 1,
    cursor: isSingleRow || isFirst || navLoading || loadingEdit
      ? "not-allowed"
      : "pointer",
  }}
>
  ⬅ Prev
</button> */}
{/* <Typography>
    {currentIndex + 1} of {rowList.length}
  </Typography> */}
{/* <button
  onClick={goNext}
  disabled={navLoading || loadingEdit}
  style={{
    opacity: navLoading || loadingEdit ? 0.5 : 1,
    cursor: navLoading || loadingEdit ? "not-allowed" : "pointer",
  }}
>
  Next ➡
</button> */}
</Box>

      {/* RIGHT side unchanged */}
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