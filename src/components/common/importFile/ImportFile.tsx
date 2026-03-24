import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  Stack,
  DialogActions,
  IconButton,
  Autocomplete,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { GET, POST } from "../../../services/apiRoutes";
import CommonDatePicker from "../datePicker/datePicker";
import ProgressBar from "../../molecule/progressBar";
import useGet from "../../../hooks/useGet";
import { DateTime } from "luxon";
import ExcelJS from "exceljs";
import { toast } from "react-toastify";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks/useComponentTypography";
import { useDropzone } from "react-dropzone";
import { GridCloseIcon } from "@mui/x-data-grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useUploadCustomReportFile } from "../../../hooks/useFileUpalod";
import DialogContainer from "../../molecule/dialog";
import { StyledButton } from "../index";

// Global polling state that persists across components
const globalPollingState = {
  activePolls: new Map<string, NodeJS.Timeout>(),
  isPolling: false,
  pollingId: null as string | null,
};

interface GlobalPollingManagerProps {
  setShowProcessingDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  dataSourceId?: string;
}

/**
 * Starts global polling with 5-second interval
 * @param pollingId - Unique identifier for the polling session
 * @param callback - Function to execute on each poll
 */
export const startGlobalPolling = (pollingId: string, callback: () => void) => {
  // Clear any existing timer for this ID
  if (globalPollingState.activePolls.has(pollingId)) {
    clearTimeout(globalPollingState.activePolls.get(pollingId));
  }

  // Set new timer with 5-second interval
  const timer = setTimeout(() => {
    callback();
  }, 5000);

  globalPollingState.activePolls.set(pollingId, timer);
  globalPollingState.isPolling = true;
  globalPollingState.pollingId = pollingId;

  // Store in sessionStorage to survive page reloads
  sessionStorage.setItem("activePollingId", pollingId);
  sessionStorage.setItem("pollingStartTime", Date.now().toString());
};

/**
 * Stops global polling for a specific session
 * @param pollingId - Unique identifier for the polling session
 */
export const stopGlobalPolling = (pollingId: string) => {
  if (globalPollingState.activePolls.has(pollingId)) {
    clearTimeout(globalPollingState.activePolls.get(pollingId));
    globalPollingState.activePolls.delete(pollingId);
  }

  if (globalPollingState.pollingId === pollingId) {
    globalPollingState.isPolling = false;
    globalPollingState.pollingId = null;
  }

  sessionStorage.removeItem("activePollingId");
  sessionStorage.removeItem("pollingStartTime");
};

// Check for active polling on app initialization
if (typeof window !== "undefined") {
  const activePollingId = sessionStorage.getItem("activePollingId");
  const pollingStartTime = sessionStorage.getItem("pollingStartTime");

  if (activePollingId && pollingStartTime) {
    const startTime = parseInt(pollingStartTime);
    const elapsed = Date.now() - startTime;

    // If polling was started less than 5 minutes ago, resume it
    if (elapsed < 5 * 60 * 1000) {
      globalPollingState.isPolling = true;
      globalPollingState.pollingId = activePollingId;
    } else {
      // Clear stale polling data
      sessionStorage.removeItem("activePollingId");
      sessionStorage.removeItem("pollingStartTime");
    }
  }
}

/**
 * GlobalPollingManager Component
 * Manages global polling state across the application
 * Handles polling for file processing status
 */
const GlobalPollingManager: React.FC<GlobalPollingManagerProps> = ({
  setShowProcessingDialog,
  dataSourceId,
}) => {
  const navigate = useNavigate();
  const [pollingTimestamp, setPollingTimestamp] = useState(Date.now());
  const isMountedRef = useRef(true);
  const pollingRef = useRef({
    lastPollTime: 0,
    isPolling: false,
  });

  // Get polling ID from global state
  const pollingId = globalPollingState.pollingId;

  const pollingData = useGet<{
    success: boolean;
    data: { status: string };
  }>(
    [`pollingStatus`, pollingId, pollingTimestamp],
    `${GET?.GET_DATA_SOURCE_VERSION_BY_ID}${pollingId}`,
    !!pollingId && globalPollingState.isPolling
  );

  // Effect to handle polling response
  useEffect(() => {
    if (globalPollingState.isPolling && pollingId) {
      if (pollingData.isSuccess) {
        const status = pollingData.data.data?.status;
        const dataSourceId = pollingData.data.data?.dataSourceId;

        if (status === "completed") {
          // Stop global polling
          stopGlobalPolling(pollingId);
          setShowProcessingDialog?.(false);

          // Show success toast
          toast.success("File processed successfully!");
          window?.dispatchEvent(
            new CustomEvent("dataSourceStatusChanged", {
              detail: { status: "completed", id: pollingId, refresh: true },
            })
          );
          navigate(`/data-source-new/${dataSourceId}`);

          // Update state if component is still mounted
          if (isMountedRef.current) {
            // Additional actions if needed
          }
        } else if (status === "failed") {
          // Stop global polling
          stopGlobalPolling(pollingId);
          setShowProcessingDialog?.(false);

          toast.error("Processing failed. Redirecting to validation errors...");
          // navigate(`/notivix/validation-errors/${data?.dataSourceVersionId}`);
          // Dispatch custom event
          window?.dispatchEvent(
            new CustomEvent("dataSourceStatusChanged", {
              detail: { status: "failed", id: pollingId },
            })
          );
          // Navigate to error page
          navigate(`/validation-errors/${pollingId}`);
        } else {
          // Still processing, schedule next poll
          startGlobalPolling(pollingId, () => {
            setPollingTimestamp(Date.now());
          });
        }
      } else if (pollingData.isError) {
        // Stop global polling on error
        stopGlobalPolling(pollingId);

        setShowProcessingDialog?.(false);

        // Show error toast
        toast.error("Error checking processing status");
        // Dispatch event on error too
        window?.dispatchEvent(
          new CustomEvent("dataSourceStatusChanged", {
            detail: { status: "error", id: pollingId },
          })
        );
      }
    }
  }, [pollingData, pollingId, navigate]);

  // Effect to check for active polling on mount
  useEffect(() => {
    isMountedRef.current = true;

    // If there's an active polling session, start it
    if (globalPollingState.isPolling && globalPollingState.pollingId) {
      startGlobalPolling(globalPollingState.pollingId, () => {
        setPollingTimestamp(Date.now());
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Effect to periodically check if polling should be active
  useEffect(() => {
    const interval = setInterval(() => {
      if (globalPollingState.isPolling && globalPollingState.pollingId) {
        const now = Date.now();
        // If we haven't polled in the last 5 seconds, trigger a poll
        if (now - pollingRef.current.lastPollTime > 5000) {
          pollingRef.current.lastPollTime = now;
          setPollingTimestamp(now);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

interface ImportFileProps {
  setReload?: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
  dataSourceId?: string;
}

interface FormValues {
  dataSourceId: string;
  versionValue: string;
  files: FileList | null;
  mappings: { [key: string]: string[] };
  separator: { [key: string]: string };
  vendorId: string | null; // ✅ NEW
}

interface Attribute {
  name: string;
  type: string;
  required: string;
}

interface FileDropzoneProps {
  fileNames: string[];
  onFileChange: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  buttonName: string;
}

/**
 * FileDropzone Component
 * Handles file upload with drag-and-drop functionality
 * @param fileNames - Array of selected file names
 * @param onFileChange - Function to handle file selection
 * @param onFileRemove - Function to handle file removal
 * @param buttonName - Text to display on the upload button
 */
const FileDropzone: React.FC<FileDropzoneProps> = ({
  fileNames,
  onFileChange,
  onFileRemove,
  buttonName,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const onDrop = (acceptedFiles: File[]) => {
    setIsDragActive(false);
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles);
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    onDropRejected: (fileRejections) => {
      setIsDragActive(false);
      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          if (error.code === "file-invalid-type") {
            toast.error("Please upload valid Excel files (.xlsx or .xls)");
          } else {
            toast.error(error.message);
          }
        });
      });
    },
  });
  return (
    <Box display="flex" flexDirection="column" gap={STYLE_GUIDE.SPACING.s2}>
      <Box
        {...getRootProps()}
        sx={{
          position: "relative",
          display: "inline-block",
        }}
      >
        <StyledButton variant="primary" icon={<CloudUploadIcon />}>
          {buttonName}
        </StyledButton>
        <input {...getInputProps()} style={{ display: "none" }} />
        {isDragActive && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              border: `2px dashed ${STYLE_GUIDE.COLORS.bootstrapPrimary}`,
              borderRadius: STYLE_GUIDE.SPACING.s1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.bold,
                color: STYLE_GUIDE.COLORS.bootstrapPrimary,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                padding: STYLE_GUIDE.SPACING.s2,
                borderRadius: STYLE_GUIDE.SPACING.s1,
              }}
            >
              Drop files here
            </Typography>
          </Box>
        )}
      </Box>
      {fileNames.length > 0 && (
        <Box
          display="flex"
          flexDirection="column"
          gap={STYLE_GUIDE.SPACING.s1}
          sx={{
            backgroundColor: STYLE_GUIDE.COLORS.backgroundLightGray + "40",
            borderRadius: STYLE_GUIDE.SPACING.s1,
            padding: STYLE_GUIDE.SPACING.s2,
            border: `1px solid ${STYLE_GUIDE.COLORS.borderGray}`,
            maxWidth: "100%",
            marginTop: "8px",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            Selected Files:
          </Typography>
          {fileNames.map((fileName, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              gap={STYLE_GUIDE.SPACING.s1}
            >
              <Box
                component="span"
                sx={{
                  fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.base,
                  color: STYLE_GUIDE.COLORS.darkText,
                  fontFamily: STYLE_GUIDE.TYPOGRAPHY.fontFamily,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flexGrow: 1,
                }}
                title={fileName}
              >
                {fileName}
              </Box>
              <IconButton
                onClick={() => onFileRemove && onFileRemove(index)}
                size="small"
                sx={{
                  color: STYLE_GUIDE.COLORS.textSecondary,
                  "&:hover": {
                    color: STYLE_GUIDE.COLORS.error,
                    backgroundColor: STYLE_GUIDE.COLORS.error + "10",
                  },
                }}
              >
                <GridCloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

/**
 * ImportFile Component
 * Main component that handles the file import process
 * @param setReload - Function to trigger reload of parent component
 * @param CustomButton - Custom button component to trigger the import dialog
 * @param title - Title for the import dialog
 * @param dataSourceId - ID of the data source to import files to
 */
const ImportFile: React.FC<ImportFileProps> = ({
  setReload,
  CustomButton,
  title,
  dataSourceId,
}) => {
  const theme = useUnifiedTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fileUploadLoader, setFileUploadLoader] = useState(false);
  const [settingAttribute, setSettingAttribute] = useState<Attribute[]>([]);
  const [settingAttributeOption, setSettingAttributeOption] = useState<
    string[]
  >([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const { getDialogTitleSx } = useComponentTypography();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      dataSourceId: dataSourceId || "",
      versionValue: "",
      files: null,
      mappings: {},
      separator: {},
    },
  });
  const { mutate: mutateReportUpload, isPending: isLoadingReportUpload } =
    useUploadCustomReportFile();

  /**
   * Reset mappings whenever files change to ensure clean mapping state
   */
  useEffect(() => {
    setValue("mappings", {});
  }, [files, setValue]);

  /**
   * Validate form to enable/disable submit button
   */
const versionValue = watch("versionValue");

useEffect(() => {
  const isValid =
    versionValue &&
    files.length > 0 &&
    Object.keys(errors).length === 0 &&
    !fileUploadLoader;

  setIsFormValid(!!isValid);
}, [versionValue, files, errors, fileUploadLoader]);

  /**
   * Set data source ID when dialog opens
   */
  useEffect(() => {
    if (open && dataSourceId) {
      setValue("dataSourceId", dataSourceId);
    }
  }, [open, dataSourceId, setValue]);

  // Force refetch attributes when modal reopens
  useEffect(() => {
    if (open && dataSourceId) {
      setRefetchTrigger((prev) => prev + 1);
    }
  }, [open]);

  /**
   * Reset form state when dialog closes
   */
  useEffect(() => {
    if (!open) {
      setFiles([]);
      setFileNames([]);
      setFileHeaders([]);
      setFileUploadLoader(false);
      setSettingAttribute([]);
      setSettingAttributeOption([]);
      reset({
        dataSourceId: dataSourceId || "",
        versionValue: "",
        files: null,
        mappings: {},
        separator: {},
      });
    }
  }, [open, reset, dataSourceId]);

  /**
   * Close dialog and reset processing state
   */
  const handleCancel = () => {
    setOpen(false);
    setShowProcessingDialog(false);
  };

   const { data: vendorApiData, isLoading: vendorLoading } = useGet<{
  success: boolean;
  data: any[];
}>(
  ["vendorList"],
  `${GET.Vendor_List}?page=1&limit=1000`,
  true
);
const vendorOptions = [
  { label: "All", value: null },
  ...(vendorApiData?.data || []).map((v: any) => ({
    label: v.name,
    value: v._id,
  })),
];

  /**
   * Fetch data source details including attributes
   */
  const dataSourceDetails = useGet<{
    success: boolean;
    available: boolean;
    data: {  versionType: string, entityId: { attributes: Attribute[] } };
  }>(
    [`dataSourceDetails`, watch("dataSourceId"), refetchTrigger],
    GET?.Data_Source + `/${watch("dataSourceId")}`,
    !!watch("dataSourceId")
  );

  const versionType = dataSourceDetails?.data?.data?.versionType;

  /**
   * Update setting attributes when data source details are loaded
   */
  useEffect(() => {
    if (
      !dataSourceDetails.isFetching &&
      dataSourceDetails.isSuccess &&
      dataSourceDetails.data
    ) {
      setSettingAttribute(dataSourceDetails.data.data.entityId.attributes);
      setSettingAttributeOption([
        ...dataSourceDetails.data.data.entityId.attributes.map(
          (data: Attribute) => data.name
        ),
      ]);
      if (dataSourceDetails.data.data.versionType !== "monthly") {
      setValue("vendorId", null); // reset vendor if not monthly
    }
    }
  }, [
    dataSourceDetails.isFetching,
    dataSourceDetails.isSuccess,
    dataSourceDetails.data,
  ]);

  // Handle custom events for data source status changes
  useEffect(() => {
    const handleDataSourceStatusChanged = (event: CustomEvent) => {
      localStorage.setItem("dataSourceProcessingStatus", event.detail.status);

      if (
        (event.detail.status === "completed" ||
          event.detail.status === "failed") &&
        event.detail.id === watch("dataSourceId")
      ) {
        // Close the processing dialog
        setShowProcessingDialog(false);

        // Only refetch if it's completed and has refresh flag
        if (event.detail.status === "completed" && event.detail.refresh) {
          setRefetchTrigger((prev) => prev + 1);
        }
      }
    };

    window.addEventListener(
      "dataSourceStatusChanged",
      handleDataSourceStatusChanged as any
    );

    return () => {
      window.removeEventListener(
        "dataSourceStatusChanged",
        handleDataSourceStatusChanged as any
      );
    };
  }, [watch("dataSourceId")]);

  /**
   * Close the form dialog
   */
  const handleFormClose = () => {
    setOpen(false);
  };

  /**
   * Convert form data to FormData for API submission
   * @param obj - Form data object
   * @param form - Existing FormData (optional)
   * @param namespace - Namespace for form fields (optional)
   * @returns FormData object ready for submission
   */
  const objectToFormData = (
    obj: any,
    form?: FormData,
    namespace?: string
  ): FormData => {
    const fd = form || new FormData();
    for (const property in obj) {
      if (!obj.hasOwnProperty(property)) continue;
      const formKey = namespace ? `${namespace}[${property}]` : property;
      const value = obj[property];
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        value[0] instanceof File
      ) {
        value.forEach((file: File) => {
          fd.append("files", file);
        });
      } else if (
        typeof value === "object" &&
        value !== null &&
        !(value instanceof File)
      ) {
        objectToFormData(value, fd, formKey);
      } else if (value !== undefined && value !== null) {
        fd.append(formKey, value);
      }
    }
    return fd;
  };

  /**
   * Handle form submission
   * Validates mandatory attributes, generates unique version name,
   * and submits files to the backend
   */
  const onSubmit = async (formData: FormValues) => {
    const reverseMap: Record<string, string[]> = {};
    Object.entries(formData.mappings).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach((value) => {
          if (!reverseMap[value]) {
            reverseMap[value] = [];
          }
          if (!["Extra-Attribute-Ignore"].includes(value)) {
            reverseMap[value].push(key);
          }
        });
      }
    });

    // Check for mandatory attributes
    const mandatoryAttributes = settingAttribute
      .filter((attr) => attr.required === "Mandatory")
      .map((attr) => attr.name);

    const missingMandatoryAttributes = mandatoryAttributes.filter(
      (attr) => !formData.mappings[attr] || formData.mappings[attr].length === 0
    );

    if (missingMandatoryAttributes.length > 0) {
      missingMandatoryAttributes.forEach((attr) => {
        toast.error(`Mandatory attribute is not mapped: ${attr}`);
      });
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    const versionValue = watch("versionValue");
    const formattedVersion = DateTime.fromISO(versionValue).toFormat("yyyy-LL");
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    // Generate unique version name using timestamp
    // const uniqueVersionName = `version_${Date.now()}`;
    const uniqueVersionName = `version_${Date.now()}_${randomSuffix}`;

    const payload = {
      dataSourceId: formData.dataSourceId,
      versionValue: formattedVersion,
      versionName: uniqueVersionName,
      operation: "dataSourceVersion",
      mappings: JSON.stringify(formData.mappings),
      files: files,
      vendorId:
        versionType === "monthly"
          ? formData.vendorId ?? null
          : null,
    };

    const formDataToSend = objectToFormData(payload);

    try {
      await mutateReportUpload(formDataToSend, {
        onSuccess: (data: any) => {
          if (data?.status === "pending" && data?.dataSourceVersionId) {
            const id = data.dataSourceVersionId;

            setOpen(false);
            setShowProcessingDialog(true);
            toast.info("File uploaded successfully. Processing in progress...");

            // Start global polling with 5-second interval
            startGlobalPolling(id, () => {});
          } else if (data?.status === "completed") {
            window?.dispatchEvent(
              new CustomEvent("dataSourceStatusChanged", {
                detail: {
                  status: "completed",
                  id: formData.dataSourceId,
                  refresh: true,
                },
              })
            );
            toast.success("File uploaded successfully!");
            handleCancel();
            // navigate(`/data-source-new/69086541e57ad7055f976d60`);
          } else if (data?.status === "failed") {
            navigate(`/validation-errors/${data?.dataSourceVersionId}`);
            handleCancel();
          } else {
            toast.success("File uploaded successfully!");
            handleCancel();
          }
        },
        onError: (error: any) => {
          toast.error(
            `Upload failed: ${error.response?.data?.message || error.message}`
          );
        },
      });
    } catch (error) {
      toast.error("Upload failed!");
    }
  };

  /**
   * Remove a file from the selected files list
   * @param index - Index of the file to remove
   */
  const handleFileRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    const newFileNames = [...fileNames];
    newFileNames.splice(index, 1);
    setFileNames(newFileNames);
    // Reset mappings when files change
    setValue("mappings", {});
    if (newFiles.length === 0) {
      setFileHeaders([]);
    } else {
      processFilesForHeaders(newFiles);
    }
  };

  /**
   * Process uploaded files to extract headers
   * @param filesToProcess - Array of files to process
   */
  const processFilesForHeaders = async (filesToProcess: File[]) => {
    if (filesToProcess.length === 0) {
      setFileHeaders([]);
      return;
    }
    setFileUploadLoader(true);
    try {
      for (const file of filesToProcess) {
        const arrayBuffer = await file.arrayBuffer();
        // Read workbook using xlsx
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        if (!ws) {
          toast.error(`No sheets found in ${file.name}`);
          continue;
        }
        // Extract first row (headers)
        const headers: string[] = [];
        const range = XLSX.utils.decode_range(ws["!ref"]!);
        const firstRow = range.s.r; // start row index (usually 0)
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = ws[XLSX.utils.encode_cell({ r: firstRow, c })];
          headers.push(cell?.v?.toString() || "");
        }
        // Add "Extra-Attribute-Ignore" and deduplicate
        setFileHeaders((prev) => [
          ...new Set([...prev, ...headers, "Extra-Attribute-Ignore"]),
        ]);
      }
    } catch (error) {
      toast.error("Error processing files. Please try again.");
    } finally {
      setFileUploadLoader(false);
    }
  };

  /**
   * Handle file selection through drag-and-drop or file picker
   * @param acceptedFiles - Array of accepted files
   */
  const handleFileChange = (acceptedFiles: File[]) => {
    const excelFiles = acceptedFiles.filter(
      (file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
    );
    if (excelFiles.length === 0) {
      toast.error("Please upload valid Excel files (.xlsx or .xls)");
      return;
    }
    setFiles(excelFiles);
    setFileNames(excelFiles.map((file) => file.name));
    // Reset mappings when files change
    setValue("mappings", {});
    processFilesForHeaders(excelFiles);
  };

  /**
   * Auto-map headers to attributes when both are available
   * Only maps attributes that don't have existing mappings
   */
  useEffect(() => {
    if (fileHeaders.length > 0 && settingAttributeOption.length > 0) {
      const currentMappings = watch("mappings") || {};
      settingAttributeOption.forEach((attr) => {
        // Only set mapping if it doesn't exist or is empty
        if (!currentMappings[attr] || currentMappings[attr].length === 0) {
          const normalize = (str: string) =>
            str.replace(/\s+/g, "").toLowerCase();
          const matchedHeader = fileHeaders.find(
            (header) => normalize(header) === normalize(attr)
          );
          if (matchedHeader && matchedHeader !== "Extra-Attribute-Ignore") {
            setValue(`mappings.${attr}`, [matchedHeader]);
          }
        }
      });
    }
  }, [fileHeaders, settingAttributeOption, setValue, watch]);

  return (
    <div>
      <GlobalPollingManager
        setShowProcessingDialog={setShowProcessingDialog}
        dataSourceId={dataSourceId}
      />

      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>

      {/* Main Import Dialog */}
      <DialogContainer
        open={open}
        onClose={handleFormClose}
        title={title}
        maxWidth="sm"
        actions={
          <>
            {isLoadingReportUpload ? (
              <ProgressBar />
            ) : (
              <StyledButton
                variant="primary"
                onClick={handleSubmit(onSubmit)}
                disabled={
                  !isFormValid || fileUploadLoader || isLoadingReportUpload
                }
              >
                Save
              </StyledButton>
            )}
          </>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <CommonDatePicker
              name={"versionValue"}
              control={control}
              views={["year", "month"]}
              label="Period*"
              disableFuture={true}
              rules={{ required: "Period is required" }}
            />

            {versionType === "monthly" && (
  <Controller
    name="vendorId"
    control={control}
    defaultValue={null}
    render={({ field }) => (
      <Autocomplete
        options={vendorOptions}
        loading={vendorLoading}
        getOptionLabel={(option) => option.label}
        value={
          vendorOptions.find((opt) => opt.value === field.value) || null
        }
        onChange={(_, selected) => {
          field.onChange(selected?.value ?? null);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Vendor" />
        )}
      />
    )}
  />
)}

            {/* Removed version name field */}

            {fileUploadLoader ? (
              <ProgressBar />
            ) : (
              <FileDropzone
                fileNames={fileNames}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                buttonName={"Upload Files"}
              />
            )}
            {fileHeaders.length > 0 &&
              settingAttribute.length > 0 &&
              settingAttributeOption.length > 0 &&
              !dataSourceDetails.isFetching && (
                <>
                  <Typography
                    variant="body2"
                    sx={{ mt: 2, fontWeight: "bold" }}
                  >
                    Map file headers to entity attributes:
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            backgroundColor:
                              theme.palette.table?.headerBackground,
                            color: theme.palette.table?.headerText,
                            fontWeight: "medium",
                          }}
                        >
                          Entity Setting Attribute
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor:
                              theme.palette.table?.headerBackground,
                            color: theme.palette.table?.headerText,
                            fontWeight: "medium",
                          }}
                        >
                          File Headers
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {settingAttributeOption.map((option, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell>{option}</TableCell>
                            <TableCell>
                              <Controller
                                name={`mappings.${option}`}
                                control={control}
                                defaultValue={[]}
                                rules={{
                                  required: "Please select at least one header",
                                }}
                                render={({ field }) => (
                                  <Autocomplete
                                    {...field}
                                    multiple
                                    options={fileHeaders}
                                    getOptionLabel={(option) => option}
                                    renderTags={(value, getTagProps) =>
                                      value.map((option, index) => (
                                        <Chip
                                          key={index}
                                          variant="outlined"
                                          label={option}
                                          {...getTagProps({ index })}
                                          size="small"
                                        />
                                      ))
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Map to headers"
                                        placeholder="Select headers"
                                        error={!!errors.mappings?.[option]}
                                        helperText={
                                          errors.mappings?.[option]?.message ||
                                          `Select one or more headers to map with ${option}`
                                        }
                                      />
                                    )}
                                    onChange={(_, data) => {
                                      field.onChange(data);
                                    }}
                                  />
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}
          </Stack>
        </Box>
      </DialogContainer>

      <DialogContainer
        open={showProcessingDialog}
        onClose={() => setShowProcessingDialog(false)}
        title="Processing Your Files"
        actions={
          <StyledButton variant="secondary" onClick={() => setShowProcessingDialog(false)}>
            Close
          </StyledButton>
        }
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={STYLE_GUIDE.SPACING.s3}
          textAlign="center"
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" fontWeight="bold">
            Processing Your Files
          </Typography>
          <Typography variant="body1">
            Your files have been uploaded and are now in the processing queue.
            You may close this message and continue using the platform. Once the
            processing is complete, you will be notified!
          </Typography>
        </Box>
      </DialogContainer>
    </div>
  );
};

// Export both components
export { GlobalPollingManager };
export default ImportFile;
