import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FieldErrors, FieldValues, useForm } from "react-hook-form";
import ExcelJS from "exceljs";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  styled,
  tableCellClasses,
  TableCell,
  Paper,
  Typography,
  Stack,
  Backdrop,
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import { toast } from "react-toastify";
import ViewMapping from "../report/viewMapping";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useUploadCustomReportFile } from "../../../hooks/useFileUpalod";
import { objectToFormData } from "../../../utils/utils";

interface UploadMultipleFilesProps {
  reportId: string;
  versionValue: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setReload: Dispatch<SetStateAction<boolean>>;
}

export interface CustomReportData {
  mappings: {
    [key: string]: Record<string, null> | Record<string, string>;
  };
  customReportId: string;
  versionValue: string;
  files?: (File | null)[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

const UploadMultipleFiles: React.FC<UploadMultipleFilesProps> = ({
  open,
  setOpen,
  reportId,
  versionValue,
  setReload,
}) => {
  const [openMappingModal, setOpenMappingModal] = useState(-1);
  const [processingCount, setProcessingCount] = useState(0);
  const [, setFileUploads] = useState<Record<string, File | null>>({});
  const [fileHeader, setFileHeader] = useState<Record<string, string[] | null>>(
    {}
  );

  const requiredVersionValues = useGet<{
    success: boolean;
    versionValueDetails: {
      _id: string;
      requiredFiles: {
        name: string;
        _id: string;
        sheetName: string;
        isRequired: string;
      }[];
      entityId: { attributes: { name: string; mappingName: string }[] };
      versions: [];
    }[];
  }>(
    [`versionValue`, String(reportId), String(versionValue)],
    GET?.Custom_Report +
      `/getVersionValue/?reportRequestId=${reportId}&versionValue=${versionValue}`,
    !!reportId && !!versionValue
  );

  const requiredFiles = useMemo(() => {
    return (
      requiredVersionValues?.data?.versionValueDetails?.flatMap((data) =>
        data.requiredFiles.map((file, index) => ({
          ...file,
          isVersionAvailable: (data.versions?.length ?? 0) > 0,
          extededName:
            file.name + (file.sheetName ? `__${file.sheetName}` : ""),
          detailId: data._id,
          attributes: data.entityId.attributes,
          fileIndex: index,
        }))
      ) ?? []
    );
  }, [requiredVersionValues?.data]);

  useEffect(() => {
    reset({
      customReportId: reportId,
      versionValue: versionValue,
      files: requiredFiles?.map(() => null),
      mappings: {},
    });
    trigger();
  }, [requiredVersionValues?.data]);

  const validationSchema = Yup.object({
    files: Yup.array()
      .of(Yup.mixed<File>().nullable())
      .test(
        "all-required-files-present",
        "Please upload all required files.",
        (files, context) => {
          const missingFiles = requiredFiles.filter((file, index) => {
            const { isVersionAvailable, isRequired } = file;

            if (isVersionAvailable) return false;

            return isRequired && !files?.[index];
          });

          if (missingFiles.length > 0) {
            return context.createError({
              path: "files",
              message: "Please upload all required files.",
            });
          }

          return true;
        }
      ),

    mappings: Yup.object().test(
      "all-files-mapped",
      "Each uploaded file must have a complete mapping with unique values.",
      (mappings: Record<string, Record<string, string | null>>, context) => {
        if (!mappings || typeof mappings !== "object") return false;

        const errors: Record<string, { isError: boolean; msg: string }> = {};
        let hasErrors = false;

        Object.keys(mappings).forEach((fileName) => {
          const fileMapping = mappings[fileName];

          if (!fileMapping) {
            errors[fileName] = {
              isError: true,
              msg: `No mapping found for ${fileName}`,
            };
            hasErrors = true;
          } else {
            const localValueOccurrences = new Set<string>();

            Object.entries(fileMapping).forEach(([, value]) => {
              if (value === null || value === undefined) {
                errors[fileName] = {
                  isError: true,
                  msg: `Mapping incomplete for ${fileName}`,
                };
                hasErrors = true;
              } else {
                // Check for duplicate values within the same file

                if (value !== "Extra-Attribute-Ignore") {
                  if (localValueOccurrences.has(value)) {
                    errors[fileName] = {
                      isError: true,
                      msg: `Duplicate mapping within ${fileName} for value "${value}"`,
                    };
                    hasErrors = true;
                  } else {
                    localValueOccurrences.add(value);
                  }
                }
              }
            });
          }
        });

        if (hasErrors) {
          return context.createError({
            path: "mappings",
            message: errors,
          });
        }

        return true;
      }
    ),

    customReportId: Yup.string().required(),
    versionValue: Yup.string().required(),
  }) as Yup.ObjectSchema<CustomReportData>;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<CustomReportData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      customReportId: reportId,
      versionValue: versionValue,
      files: requiredFiles?.map(() => null),
      mappings: {},
    },
  });

  const removeExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileName?: string,
    index: number = -1
  ) => {
    if (!event.target.files?.length) return;

    const selectedFiles = Array.from(event.target.files);
    const currentFiles =
      watch("files")?.length === 0
        ? Array(requiredFiles.length).fill(null)
        : watch("files") ?? [];

    selectedFiles.forEach((selectedFile) => {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        toast.error("Please upload a valid Excel file.");
        return;
      }

      // Increase processing counter for each file
      setProcessingCount((prev) => prev + 1);

      const fileIndexes = requiredFiles
        .map((reqFile, index) =>
          reqFile.name === removeExtension(selectedFile.name) ? index : -1
        )
        .filter((index) => index !== -1);

      fileIndexes.forEach((i) => {
        currentFiles[index !== -1 ? index : i] = selectedFile;
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();

          try {
            await workbook.xlsx.load(arrayBuffer);
          } catch {
            toast.error(
              "Failed to load the Excel file. Ensure the file is valid."
            );
            return;
          }

          if (!workbook.worksheets?.length) {
            toast.error("No sheets found in the Excel file.");
            return;
          }

          const worksheet = workbook.worksheets[0];
          const headers = extractHeaders(worksheet);

          if (!headers.length) {
            toast.error("Headers not found.");
            return;
          }

          if (hasDuplicateHeaders(headers)) return;

          const keyName = fileName ?? removeExtension(selectedFile.name);

          const sheets = requiredFiles?.filter((_, ind) =>
            index !== -1 ? index : fileIndexes.includes(ind)
          );
          const sheetNames = sheets?.map((file) => file.sheetName);

          const extendedNames =
            sheetNames.length > 0
              ? sheetNames.map((name) =>
                  name
                    ? `${
                        fileName ?? removeExtension(selectedFile.name)
                      }__${name}`
                    : `${fileName ?? removeExtension(selectedFile.name)}`
                )
              : [`${fileName ?? removeExtension(selectedFile.name)}`];

          setFileHeader((prev) => {
            const updatedHeaders = { ...prev };
            extendedNames.forEach((name) => {
              updatedHeaders[name] = [...headers, "Extra-Attribute-Ignore"];
            });
            return updatedHeaders;
          });

          setFileUploads((prev) => {
            const updatedUploads = { ...prev };
            extendedNames.forEach((name) => {
              updatedUploads[name] = selectedFile;
            });
            return updatedUploads;
          });

          const emptyMappingData =
            requiredVersionValues?.data?.versionValueDetails
              .filter((data) =>
                data?.requiredFiles.some((file) => file.name === keyName)
              )
              ?.map((data) => data?.entityId?.attributes);

          emptyMappingData?.forEach((attributeSet, index) => {
            if (!attributeSet) return;

            const sheetName = extendedNames[index];

            attributeSet.forEach((option) => {
              const matchedHeader =
                headers.find(
                  (name) =>
                    name
                      ?.replace(/[^a-zA-Z0-9/]/g, "")
                      .replace(/\//g, " or ")
                      .replace(/\s+/g, "")
                      .trim()
                      .toLowerCase() ===
                    option.mappingName
                      ?.replace(/[^a-zA-Z0-9/]/g, "")
                      .replace(/\//g, " or ")
                      .replace(/\s+/g, "")
                      .trim()
                      .toLowerCase()
                ) || null;

              setValue(
                `mappings.${sheetName}.${option.name ?? ""}`,
                matchedHeader,
                {
                  shouldValidate: true,
                }
              );
            });

            trigger();
          });
        } catch {
          toast.error(
            "Something went wrong while processing the file. Please try again."
          );
        } finally {
          // Decrement processing counter when done
          setProcessingCount((prev) => prev - 1);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    });

    setValue("files", [...currentFiles], { shouldValidate: true });
    trigger();
  };

  console.log("wac()", watch());

  // Helper function to extract headers
  const extractHeaders = (worksheet: ExcelJS.Worksheet): string[] => {
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value?.toString() || "");
    });
    return headers;
  };

  // Check for duplicate headers
  const hasDuplicateHeaders = (headers: string[]): boolean => {
    const headerCounts: Record<string, number> = headers.reduce(
      (acc, header) => {
        acc[header] = (acc[header] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const duplicates = Object.entries(headerCounts).filter(
      ([, count]) => count > 1
    );

    if (duplicates.length) {
      duplicates.forEach(([header, count]) => {
        toast.error(`The header '${header}' is duplicated ${count} times.`);
      });
      return true;
    }

    return false;
  };

  const { mutate: mutateReportUpload, isPending: isLoadingReportUpload } =
    useUploadCustomReportFile();

  const onSubmit = (data: FieldValues) => {
    const tempData = {
      ...data,
      mappings: JSON.stringify(data?.mappings),
      operation: "customreport",
    };
    const formData = objectToFormData(tempData);
    mutateReportUpload(formData, {
      onSuccess: () => {
        setOpen(false);
        setReload(true);
      },
    });
  };

  const onError = (
    errors: FieldErrors<{
      files?: { message?: string };
      mappings?: {
        message?: Record<string, { isError: boolean; msg: string }>;
      };
    }>
  ) => {
    const filesError =
      typeof errors.files?.message === "string"
        ? errors.files.message
        : undefined;

    // Ensure mappings.message exists and is an object
    const mappingMessage = errors.mappings?.message;

    if (typeof mappingMessage !== "object" || mappingMessage === null) {
      toast.error(filesError);
      return;
    }

    // Extract the first key dynamically
    const firstKey = Object.keys(mappingMessage)[0];

    // Ensure errorMessage is extracted safely
    const errorMessage =
      mappingMessage[firstKey]?.msg && typeof mappingMessage[firstKey]?.isError
        ? "Please Map all files."
        : undefined;

    // Show the error message
    toast.error(filesError || errorMessage);
  };

  useEffect(() => {
    trigger();
  }, [trigger]);

  return (
    <>
      {(isLoadingReportUpload || processingCount > 0) && (
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.modal + 1 })}
          open={true}
        >
          <Box sx={{ width: "80%", textAlign: "center" }}>
            <Typography variant="h6" mb={2}>
              {processingCount > 0 ? `Validating ...` : `Uploading ...`}
            </Typography>
            <LinearProgress />
          </Box>
        </Backdrop>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogTitle
          display="flex"
          justifyContent="space-between"
          alignItems={"center"}
        >
          <Typography> Version Value: {versionValue} </Typography>
          <Stack>
            <Button
              variant="contained"
              component="label"
              sx={{
                fontWeight: "bold",
                bgcolor: "#007bff",
                color: "#fff",
                "&:hover": { bgcolor: "#0056b3" },
                padding: 2,
              }}
            >
              <Box gap={1} display="flex" justifyContent="center">
                <UploadFileIcon />
                Upload Files
              </Box>
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => handleFileChange(e)}
              />
            </Button>
            {errors.files && (
              <Typography variant="caption" color="error">
                {String(errors.files.message)}
              </Typography>
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ width: "100%" }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>FILE NAME</StyledTableCell>
                  <StyledTableCell>UPLOAD FILE</StyledTableCell>
                  <StyledTableCell align="center">MAPPINGS</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requiredFiles?.map((fileName, index) => (
                  <StyledTableRow key={`${fileName._id}`}>
                    <StyledTableCell>
                      {fileName?.extededName || "-"}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box>
                        <Button
                          variant="contained"
                          component="label"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "#007bff",
                            color: "#fff",
                            "&:hover": { bgcolor: "#0056b3" },
                            padding: 1,
                            marginBottom: 1,
                            position: "relative",
                          }}
                        >
                          <Stack
                            gap={1}
                            direction="row"
                            justifyContent="center"
                            alignContent="center"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            <UploadFileIcon sx={{ fontSize: "1.5rem" }} />
                            <Typography
                              component="span"
                              variant="button"
                              fontWeight={600}
                            >
                              {fileName?.isVersionAvailable ||
                              watch("files")?.[index]
                                ? "Reupload File"
                                : "Upload File"}
                            </Typography>
                          </Stack>
                          <input
                            type="file"
                            hidden
                            onChange={(e) =>
                              handleFileChange(e, fileName.name, index)
                            }
                          />
                          {fileName?.isRequired && (
                            <Typography
                              component="span"
                              color="error"
                              sx={{
                                fontSize: 35,
                                position: "absolute",
                                top: -23,
                                right: -8,
                              }}
                            >
                              *
                            </Typography>
                          )}
                        </Button>
                        {fileName?.isVersionAvailable ? (
                          <Typography
                            component="div"
                            variant="caption"
                            color="info"
                          >
                            Data Available
                          </Typography>
                        ) : null}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {fileHeader[fileName.extededName] ? (
                        <Stack
                          direction="row"
                          gap={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <ViewMapping
                            fileName={fileName}
                            CustomButton={<Button>View Mappings</Button>}
                            title={`Mapping for ${fileName.name}`}
                            settingAttributeOption={fileName.attributes}
                            fileHeaders={fileHeader[fileName.extededName]!}
                            control={control}
                            setValue={setValue}
                            index={index}
                            setOpen={setOpenMappingModal}
                            open={openMappingModal}
                            trigger={trigger}
                            watch={watch}
                          />
                          {(
                            (errors?.mappings?.message ||
                              errors?.mappings?.root
                                ?.message) as unknown as Record<
                              string,
                              { isError: boolean; msg: string }
                            >
                          )?.[fileName?.extededName]?.isError ? (
                            <ErrorOutlineIcon color="error" />
                          ) : (
                            <CheckCircleIcon color="success" />
                          )}
                        </Stack>
                      ) : fileName?.isVersionAvailable ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        "-"
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit, onError)}
            variant="contained"
            color="primary"
            disabled={isLoadingReportUpload || !!errors.files}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadMultipleFiles;
