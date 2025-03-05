import React, { Dispatch, SetStateAction, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import useGet from "../../../hooks/useGet";
import { GET } from "../../../services/apiRoutes";
import { toast } from "react-toastify";
import ViewMapping from "../report/viewMapping";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface UploadMultipleFilesProps {
  reportId: string;
  versionValue: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface CustomReportData {
  mappings: {
    [key: string]: Record<string, null> | Record<string, string>;
  };
  customReportId: string;
  versionValue: string;
  files?: File[]; // Optional files tracking
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
}) => {
  const [fileUploads, setFileUploads] = useState<Record<string, File | null>>(
    {}
  );
  const [fileHeader, setFileHeader] = useState<Record<string, string[] | null>>(
    {}
  );
  // const [customReportData, setCustomReportData] = useState<CustomReportData>({
  //   operation: "",
  //   customReportId: "",
  //   versionValue: "",
  //   mappings: {},
  //   files: [],
  // });

  // const validationSchema = Yup.object().shape({
  //   files: Yup.array()
  //     .of(
  //       Yup.mixed().test(
  //         "file-required",
  //         "All required files must be uploaded.",
  //         (value) => !!value
  //       )
  //     )
  //     .test("all-files-present", "Please upload all required files.", (files) =>
  //       files?.every((file) => file !== null && file !== undefined)
  //     ),
  //   mappings: Yup.object().test(
  //     "all-files-mapped",
  //     "Each uploaded file must have a complete mapping.",
  //     (mappings: Record<string, Record<string, string | null>>, context) => {
  //       const { files } = context.parent;
  //       if (!files || !Array.isArray(files)) return false;
  //       if (!mappings || typeof mappings !== "object") return false;

  //       return files.every((file) => {
  //         if (!file) return false; // Ensure file exists

  //         const fileName = removeExtension(file.name); // Normalize file name
  //         const fileMapping = mappings?.[fileName];

  //         if (!fileMapping) return false; // Ensure file has a mapping

  //         return Object.values(fileMapping).every(
  //           (value) => value !== null && value !== undefined
  //         );
  //       });
  //     }
  //   ),
  //   customReportId: Yup.string().required(),
  //   versionValue: Yup.string().required(),
  // }) as Yup.ObjectSchema<CustomReportData>;

  const validationSchema = Yup.object({
    files: Yup.array()
      .of(
        Yup.mixed<File>().test(
          "file-required",
          "All required files must be uploaded.",
          (value) => !!value
        )
      )
      .test("all-files-present", "Please upload all required files.", (files) =>
        files?.every((file) => file !== null && file !== undefined)
      ),

    mappings: Yup.object().test(
      "all-files-mapped",
      "Each uploaded file must have a complete mapping.",
      (mappings: Record<string, Record<string, string | null>>, context) => {
        if (!mappings || typeof mappings !== "object") return false;

        const errors: Record<string, { isError: boolean; msg: string }> = {};
        let hasErrors = false;

        Object.keys(mappings).forEach((fileName) => {
          const fileMapping = mappings[fileName];

          if (!fileMapping) {
            // Case: Mapping object is missing
            errors[fileName] = {
              isError: true,
              msg: `No mapping found for ${fileName}`,
            };
            hasErrors = true;
          } else if (
            Object.values(fileMapping).some(
              (value) => value === null || value === undefined
            )
          ) {
            // Case: Mapping has incomplete values
            errors[fileName] = {
              isError: true,
              msg: `Mapping incomplete for ${fileName}`,
            };
            hasErrors = true;
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
    getValues,
    watch,
    formState: { errors },
  } = useForm<CustomReportData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      customReportId: reportId,
      versionValue: versionValue,
      files: [],
      mappings: {},
    },
  });
  console.log("getValues", getValues());
  // Fetch required files from API
  const requiredVersionValues = useGet<{
    success: boolean;
    versionValueDetails: {
      _id: string;
      requiredFiles: { name: string; _id: string }[];
      entityId: { attributes: { name: string; mappingName: string }[] };
    }[];
  }>(
    [`versionValue`, String(reportId), String(versionValue)],
    GET?.Custom_Report +
      `/getVersionValue/?reportRequestId=${reportId}&versionValue=${versionValue}`,
    !!reportId && !!versionValue
  );

  const removeExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, "");
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileName?: string
  ) => {
    if (!event.target.files?.length) return;

    const selectedFiles = Array.from(event.target.files);
    const requiredFiles =
      requiredVersionValues?.data?.versionValueDetails?.flatMap(
        (data) => data.requiredFiles
      ) || [];

    const currentFiles =
      watch("files") || Array(requiredFiles.length).fill(null);

    selectedFiles.forEach((selectedFile) => {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        toast.error("Please upload a valid Excel file.");
        return;
      }

      const fileIndex = requiredFiles.findIndex(
        (reqFile) => reqFile.name === removeExtension(selectedFile.name)
      );

      if (fileIndex === -1) return; // Skip if file isn't required

      currentFiles[fileIndex] = selectedFile;

      // setValue(`mappings.${selectedFile?.name}.${option.name}`);
      console.log("emptyMappingData");
      processExcelFile(selectedFile, fileName);
    });

    setValue("files", [...currentFiles], { shouldValidate: false });
  };

  // ✅ Helper function to process Excel file
  const processExcelFile = async (file: File, fileName?: string) => {
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

        const keyName = fileName ?? removeExtension(file.name);

        setFileHeader((prev) => ({
          ...prev,
          [keyName]: [...headers, "Extra-Attribute-Ignore"],
        }));

        setFileUploads((prev) => ({
          ...prev,
          [keyName]: file,
        }));
      } catch {
        toast.error(
          "Something went wrong while processing the file. Please try again."
        );
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract headers from Excel worksheet
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

  // Upload handler
  const onSubmit = (formData: FieldValues) => {
    console.log("Uploading files:", formData);
    setOpen(false);
  };

  // // Ensure all required files are uploaded before enabling the Upload button
  // const allFilesUploaded =
  //   requiredVersionValues.data?.versionValueDetails?.every((data) =>
  //     data?.requiredFiles?.every(
  //       (fileName: string) =>
  //         fileUploads[fileName] !== null && fileUploads[fileName] !== undefined
  //     )
  //   ) ?? false;

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Requested Report:</DialogTitle>
        <DialogTitle
          display="flex"
          justifyContent="space-between"
          alignItems={"center"}
        >
          <Typography> Version Value: {versionValue} </Typography>
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
            <p className="error">{String(errors.files.message)}</p>
          )}
        </DialogTitle>

        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ width: "100%" }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>FILE NAME</StyledTableCell>
                  <StyledTableCell>UPLOAD FILE</StyledTableCell>
                  <StyledTableCell>MAPPINGS</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requiredVersionValues.data?.versionValueDetails?.map((data) =>
                  data?.requiredFiles?.map(
                    (
                      fileName: { name: string; _id: string },
                      index: number
                    ) => (
                      <StyledTableRow key={`${data._id}-${fileName._id}`}>
                        <StyledTableCell>
                          {fileName?.name || "-"}
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box display="flex" alignItems="center" gap={2}>
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
                              <Box
                                gap={1}
                                display="flex"
                                justifyContent="center"
                              >
                                <UploadFileIcon />
                                Upload File
                              </Box>

                              <input
                                type="file"
                                hidden
                                onChange={(e) =>
                                  handleFileChange(e, fileName.name)
                                }
                              />
                            </Button>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          {fileHeader[fileName.name] ? (
                            <ViewMapping
                              fileName={fileName}
                              CustomButton={<Button>View Mappings</Button>}
                              title={"Mappings"}
                              settingAttributeOption={data.entityId.attributes}
                              fileHeaders={fileHeader[fileName.name]!}
                              control={control}
                              setValue={setValue}
                              reset={reset}
                              errors={errors}
                              index={index}
                            />
                          ) : (
                            "-"
                          )}
                          {(
                            errors?.mappings?.root
                              ?.message as unknown as Record<
                              string,
                              { isError: boolean; msg: string }
                            >
                          )?.[fileName?.name]?.isError ? (
                            <ErrorOutlineIcon />
                          ) : null}
                        </StyledTableCell>
                      </StyledTableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadMultipleFiles;
