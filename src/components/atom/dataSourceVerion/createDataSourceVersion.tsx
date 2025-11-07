import React, { useEffect, useMemo, useState } from "react";
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
  DialogTitle,
  DialogContent,
  Stack,
  DialogActions,
} from "@mui/material";
import { useForm } from "react-hook-form";
import CommonDropdownSearch from "../../common/dropdown/searchableDropdown";
import { GET, POST } from "../../../services/apiRoutes";
import CommonDatePicker from "../../common/datePicker/datePicker";
import ProgressBar from "../../molecule/progressBar";
import useGet from "../../../hooks/useGet";
import { DateTime } from "luxon";
import FileUploadButton from "../file/fileUploadButton";
import ExcelJS from "exceljs";
import { toast } from "react-toastify";
import CommonSelect from "../../common/dropdown/commonSelect";
import useFilePostData from "../../../hooks/usePostMultipart";
import { STYLE_GUIDE } from "../../../styles";
import { useUnifiedTheme } from "../../../hooks/useUnifiedTheme";
import { useComponentTypography } from "../../../hooks";
import PrimaryButton from "../../common/PrimaryButton";
import DialogContainer from "../../molecule/dialog";

interface CreateDataSourceVersionProps {
  setReload?: React.Dispatch<React.SetStateAction<boolean>>;
  CustomButton: React.ReactElement;
  title: string;
}

interface FormValues {
  dataSourceId: string;
  versionValue: string;
  versionName: string;
  file: FileList | null;
  mappings: { [key: string]: string };
  separator: { [key: string]: string };
}

const CreateDataSourceVersion: React.FC<CreateDataSourceVersionProps> = ({
  setReload,
  CustomButton,
  title,
}) => {
  const theme = useUnifiedTheme();
  const [open, setOpen] = useState(false);
  const uniqueRandomVersionName = useMemo(() => {
    return `version_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }, []);
  const [versionName, setVersionName] = useState(uniqueRandomVersionName);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileHeader, setFileHeader] = useState<string[]>([]);
  const [fileUploadLoader, setFileUploadLoader] = useState(false);
  const [settingAttribute, setSettingAttribute] = useState<Record<any, any>[]>(
    []
  );
  const [settingAttributeOption, setSettingAttributeOption] = useState<
    string[]
  >([]);

  const { getDialogTitleSx } = useComponentTypography();

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
      dataSourceId: "",
      versionName: "",
      file: null,
      mappings: {},
      separator: {},
    },
  });

  const handleCancel = () => {
    setFile(null);
    setFileName(null);
    setOpen(false);
    setVersionName("");
    setFileHeader([]);
    setFileUploadLoader(false);
    setSettingAttribute([]);
    setSettingAttributeOption([]);
    reset(); // Reset form on cancel
  };

  const versionNameAvailability = useGet<{
    success: boolean;
    available: boolean;
    message: string;
  }>(
    [`codeAvailability`, versionName],
    GET?.Data_Source_Version +
      `/dataSourceId/${watch("dataSourceId")}/versionValue/${DateTime.fromISO(
        watch("versionValue")
      ).toFormat("yyyy-LL")}/versionName/${versionName}`,
    !!versionName && !!watch("dataSourceId") && !!watch("versionValue")
  );

  const dataSourceDetails = useGet<{
    success: boolean;
    available: boolean;
    data: any;
  }>(
    [`dataSourceDetails`, watch("dataSourceId")],
    GET?.Data_Source + `/${watch("dataSourceId")}`,
    !!watch("dataSourceId")
  );

  const { mutate, isPending } = useFilePostData<
    { files: File; operation: string },
    { message: string; data?: any }
  >(
    ["uploadedFiles"],
    (data) => {
      setReload(true);
      handleCancel();
    },
    { showToast: true }
  );

  useEffect(() => {
    if (!dataSourceDetails.isFetching && dataSourceDetails.isSuccess) {
      setSettingAttribute(dataSourceDetails.data?.data?.entityId.attributes);
      setSettingAttributeOption([
        ...dataSourceDetails.data?.data?.entityId.attributes.map(
          (data: any) => data.name
        ),
      ]);
    }
  }, [dataSourceDetails.isFetching]);

  const handleFormClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = (formData: any) => {
    const reverseMap: Record<string, string[]> = {};
    Object.entries(formData.mappings).forEach(([key, value]) => {
      if (!reverseMap[value as string]) {
        reverseMap[value as string] = [];
      }

      if (!["Extra-Attribute-Ignore"].includes(value as string))
        reverseMap[value as string].push(key);
    });

    const duplicateEntries = Object.entries(reverseMap)
      .filter(([, keys]) => keys.length > 1)
      .map(
        ([value, keys]) =>
          `Value "${value}" is duplicated for setting attributes: ${keys.join(
            ", "
          )}`
      );

    const mandatoryAttributes = settingAttribute
      .filter((attr) => attr.required === "Mandatory")
      .map((attr) => attr.name);

    const missingMandatoryAttributes = mandatoryAttributes.filter(
      (attr) => formData.mappings[attr] === "Extra-Attribute-Ignore"
    );

    if (duplicateEntries.length > 0) {
      duplicateEntries.forEach((message) => {
        toast.error(message);
      });
    }
    if (missingMandatoryAttributes.length > 0) {
      missingMandatoryAttributes.forEach((attr) => {
        toast.error(
          `Mandatory attribute are marked as Extra-Attribute-Ignore : ${attr}`
        );
      });
    }

    if (
      missingMandatoryAttributes.length === 0 &&
      duplicateEntries.length === 0
    ) {
      if (!file) {
        return;
      }

      const versionValue = watch("versionValue");
      const formattedVersion =
        DateTime.fromISO(versionValue).toFormat("yyyy-LL");
      mutate({
        url: `${POST.FILE_UPLOAD}`,
        payload: {
          files: file,
          operation: "dataSourceVersion",
          ...formData,
          mappings: JSON.stringify(formData.mappings),
          separator: JSON.stringify(formData.separator),
          versionValue: formattedVersion,
        },
      });
    }
  };

  //initial onsubmit
  // const onSubmit = (formData: any) => {
  //   const reverseMap: Record<string, string[]> = {};
  //   Object.entries(formData.mappings).forEach(([key, value]) => {
  //     if (!reverseMap[value as string]) {
  //       reverseMap[value as string] = [];
  //     }

  //     if (!['Extra-Skip Data'].includes(value as string)) reverseMap[value as string].push(key);
  //   });

  //   const duplicateEntries = Object.entries(reverseMap)
  //     .filter(([, keys]) => keys.length > 1)
  //     .map(([value, keys]) => `Value "${value}" is duplicated for file attributes: ${keys.join(', ')}`);

  //   const mandatoryAttributes = settingAttribute
  //     .filter((attr) => attr.required === 'Mandatory')
  //     .map((attr) => attr.name);

  //   const missingMandatoryAttributes = mandatoryAttributes.filter(
  //     (attr) => !Object.values(formData.mappings).includes(attr)
  //   );

  //   if (duplicateEntries.length > 0) {
  //     duplicateEntries.forEach((message) => {
  //       toast.error(message);
  //     });
  //   }
  //   if (missingMandatoryAttributes.length > 0) {
  //     missingMandatoryAttributes.forEach((attr) => {
  //       toast.error(`Mandatory attribute missing in mappings: ${attr}`);
  //     });
  //   }

  //   if (missingMandatoryAttributes.length === 0 && duplicateEntries.length === 0) {
  //     if (!file) {
  //       return;
  //     }

  //     const versionValue = watch('versionValue');
  //     const formattedVersion = DateTime.fromISO(versionValue).toFormat('yyyy-LL');
  //     mutate({
  //       url: `${POST.FILE_UPLOAD}`,
  //       payload: {
  //         files: file,
  //         operation: 'dataSourceVersion',
  //         ...formData,
  //         mappings: JSON.stringify(formData.mappings),
  //         separator: JSON.stringify(formData.separator),
  //         versionValue: formattedVersion,
  //       },
  //     });
  //   }
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);

      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        toast.error("Please upload a valid Excel file.");
        setFileName(null);
        setFile(null);
        setFileUploadLoader(false);
        return;
      }

      const reader = new FileReader();
      setFileUploadLoader(true);

      reader.onload = async (e) => {
        console.log("File loaded:", e.target?.result);
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          const workbook = new ExcelJS.Workbook();
          try {
            await workbook.xlsx.load(arrayBuffer);
          } catch (error) {
            toast.error(
              "Failed to load the Excel file. Ensure the file is valid."
            );
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          if (!workbook.worksheets || workbook.worksheets.length === 0) {
            toast.error("No sheets found in the Excel file.");
            setFileName(null);
            setFile(null);
            setFileUploadLoader(false);
            return;
          }

          const worksheet = workbook.worksheets[0];
          const headers: string[] = [];
          worksheet.getRow(1).eachCell((cell) => {
            headers.push(cell.value?.toString() || "");
          });

          if (headers.length > 0) {
            const headerCounts: Record<string, number> = headers.reduce(
              (acc: Record<string, number>, header: string) => {
                acc[header] = (acc[header] || 0) + 1;
                return acc;
              },
              {}
            );

            const duplicates = Object.entries(headerCounts).filter(
              ([, count]) => count > 1
            );
            if (duplicates.length > 0) {
              duplicates.forEach(([header, count]) => {
                toast.error(
                  `The header '${header}' is duplicated ${count} times.`
                );
              });

              setFileName(null);
              setFile(null);
            } else {
              setFileHeader([...headers, "Extra-Attribute-Ignore"]);
            }
          } else {
            toast.error("Headers not found.");
            setFileName(null);
            setFile(null);
          }
          setFileUploadLoader(false);
        } catch (e) {
          toast.error(
            "Something went wrong while processing the file. Please try again."
          );
          setFileName(null);
          setFile(null);
          setFileUploadLoader(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    }
  };

  return (
    <div>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>
      <DialogContainer
        open={open}
        onClose={handleFormClose}
        title={title}
        maxWidth="sm"
        actions={
          <>
            {isPending ? (
              <ProgressBar />
            ) : (
              <>
                <PrimaryButton
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!!file && !fileUploadLoader ? false : true}
                >
                  Save Data Source
                </PrimaryButton>
              </>
            )}
          </>
        }
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: STYLE_GUIDE.SPACING.s3,
          }}
        >
          <CommonDropdownSearch
            control={control}
            name={`dataSourceId`}
            label="Select Data Source* "
            apiUrl={`${GET.Data_Source_List}`}
            labelName="name"
            labelValue="_id"
            defaultValue={""}
            rules={{ required: "Data Source is required" }}
            error={!!errors.dataSourceId}
            errorMessage={errors.dataSourceId?.message as string}
            apiName="entityList"
            defaultDataUrl={""}
          />
          <CommonDatePicker
            name={"versionValue"}
            control={control}
            views={["year", "month"]}
            label="Period*"
            rules={{ required: "Period is required" }}
          />

          {/* <TextField
            label="Version Name(Distinct Name for Identical Version of Same Data Source)*"
            fullWidth
            {...register("versionName", {
              required: "Version name is required",
            })}
            onChange={(event) => {
              setVersionName(event.target.value);
            }}
            error={!!errors.versionName}
            defaultValue={""}
            disabled={
              watch("versionValue") && watch("dataSourceId") ? false : true
            }
            helperText={
              errors.versionName?.message ||
              (versionNameAvailability.isFetched && versionName.length > 0 ? (
                versionNameAvailability.data?.available ? (
                  <Typography
                    variant="subtitle2"
                    color="success"
                    component={"span"}
                  >
                    Version name is available
                  </Typography>
                ) : (
                  <Typography
                    variant="subtitle2"
                    color="error"
                    component={"span"}
                  >
                    version name is not available
                  </Typography>
                )
              ) : (
                ""
              ))
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: STYLE_GUIDE.SPACING.s2,
                alignItems: "center",
                fontSize: "14px",
                backgroundColor:
                  theme.dashboardTheme?.colors?.background?.paper || "#ffffff",
                "& fieldset": {
                  borderColor:
                    theme.dashboardTheme?.colors?.inputBorder ||
                    STYLE_GUIDE.COLORS.darkBackground,
                },
                "&:hover fieldset": {
                  borderColor:
                    theme.dashboardTheme?.colors?.borderHover ||
                    STYLE_GUIDE.COLORS.darkBorderHover,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.dashboardTheme?.components?.input?.focusBorderColor ||
                    theme.dashboardTheme?.components?.input
                      ?.focusBorderColorFallback ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
              },
              "& .MuiInputLabel-root": {
                color:
                  theme.dashboardTheme?.colors?.text?.secondary ||
                  STYLE_GUIDE.COLORS.darkBorderFocus,
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color:
                  theme.dashboardTheme?.components?.input?.focusBorderColor ||
                  theme.dashboardTheme?.components?.input
                    ?.focusBorderColorFallback ||
                  STYLE_GUIDE.COLORS.inputFocusFallback,
              },
              "& .MuiInputBase-input": {
                color: `${
                  theme.dashboardTheme?.colors?.inputText ||
                  theme.dashboardTheme?.colors?.text?.primary ||
                  "#000000"
                } !important`,
              },
              "& .MuiInputBase-input::placeholder": {
                color: `${
                  theme.dashboardTheme?.colors?.text?.secondary || "#666"
                } !important`,
              },
              "& .MuiInputBase-input:-webkit-autofill": {
                WebkitTextFillColor: `${
                  theme.dashboardTheme?.colors?.inputText ||
                  theme.dashboardTheme?.colors?.text?.primary ||
                  "#000000"
                } !important`,
                WebkitBoxShadow: `0 0 0 1000px ${
                  theme.dashboardTheme?.colors?.background?.paper || "#ffffff"
                } inset !important`,
              },
            }}
          /> */}

          {fileUploadLoader ? (
            <ProgressBar />
          ) : (
            <FileUploadButton
              fileName={fileName}
              onFileChange={handleFileChange}
              buttonName={"Upload File"}
            />
          )}
          {console.log("fileHeader", fileHeader)}

          {fileHeader.length > 0 &&
            settingAttribute.length > 0 &&
            settingAttributeOption.length > 0 &&
            !dataSourceDetails.isFetching && (
              <Table>
                <TableHead>
                  <TableRow>
                    {/* <TableCell>{fileName?.split('.')[0]} Attribute</TableCell>
                      <TableCell>Entity Setting Attribute</TableCell> */}
                    <TableCell
                      sx={{
                        backgroundColor: theme.palette.table?.headerBackground,
                        color: theme.palette.table?.headerText,
                        fontWeight: "medium",
                      }}
                    >
                      Entity Setting Attribute
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: theme.palette.table?.headerBackground,
                        color: theme.palette.table?.headerText,
                        fontWeight: "medium",
                      }}
                    >
                      {fileName?.split(".")[0]} Attribute
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settingAttributeOption.map((option, index) => {
                    const normalize = (str) =>
                      str.replace(/\s+/g, "").toLowerCase();

                    const matchedHeader = fileHeader.find(
                      (header) => normalize(header) === normalize(option)
                    );

                    console.log("option34", option);
                    console.log("matchedHeader", matchedHeader);
                    return (
                      <TableRow key={index}>
                        <TableCell>{option}</TableCell>
                        <TableCell>
                          <CommonSelect
                            control={control}
                            name={`mappings.${option}`}
                            label={"Map To"}
                            options={fileHeader}
                            defaultValue={matchedHeader || ""}
                            rules={{
                              required:
                                "Choose how to handle extra fields:skip saving for this column.",
                            }}
                            error={!!errors.mappings?.[option]}
                            errorMessage={errors.mappings?.[option]?.message}
                            setValue={setValue}
                          />
                          {!!watch(`mappings.${option}`) &&
                            settingAttribute.some(
                              (attr) =>
                                attr.name === watch(`mappings.${option}`) &&
                                attr.type === "multioption"
                            ) && (
                              <TextField
                                label="Seprate Multioption*"
                                fullWidth
                                {...register(`separator.${option}`, {
                                  required: "Separator is required",
                                })}
                                error={!!errors.separator?.[option]}
                                helperText={errors.separator?.[option]?.message}
                              />
                            )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* {fileHeader.map((header, index) => (
                      <TableRow key={index}>
                        <TableCell>{header}</TableCell>
                        <TableCell>
                          <CommonSelect
                            control={control}
                            name={`mappings.${header}`}
                            label={'Map To'}
                            options={settingAttributeOption}
                            defaultValue={settingAttributeOption.includes(header) ? header : ''}
                            rules={{
                              required:
                                'Choose how to handle extra fields: either save the data or skip saving for this column.',
                            }}
                            error={!!errors.mappings?.[header]}
                            errorMessage={errors.mappings?.[header]?.message}
                            setValue={setValue}
                          />
                          {!!watch(`mappings.${header}`) &&
                            settingAttribute.some(
                              (attr) => attr.name === watch(`mappings.${header}`) && attr.type === 'multioption'
                            ) && (
                              <TextField
                                label="Seprate Multioption*"
                                fullWidth
                                {...register(`separator.${header}`, {
                                  required: 'Separator is required',
                                })}
                                error={!!errors.separator?.[header]}
                                helperText={errors.separator?.[header]?.message}
                              />
                            )}
                        </TableCell>
                      </TableRow>
                    ))} */}
                </TableBody>
              </Table>
            )}
        </Box>
      </DialogContainer>
    </div>
  );

  return (
    <div>
      <Box onClick={() => setOpen(true)}>{CustomButton}</Box>
      <DialogContainer
        open={open}
        onClose={handleFormClose}
        title={title}
        actions={
          <>
            {isPending ? (
              <ProgressBar />
            ) : (
              <Box>
                <PrimaryButton onClick={handleCancel} variant="outlined">
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={!!file && !fileUploadLoader ? false : true}
                >
                  Save Data Source
                </PrimaryButton>
              </Box>
            )}
          </>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <CommonDropdownSearch
              control={control}
              name={`dataSourceId`}
              label="Select Data Source* "
              apiUrl={`${GET.Data_Source_List}`}
              labelName="name"
              labelValue="_id"
              defaultValue={""}
              rules={{ required: "Data Source is required" }}
              error={!!errors.dataSourceId}
              errorMessage={errors.dataSourceId?.message as string}
              apiName="entityList"
              defaultDataUrl={""}
            />
            <CommonDatePicker
              name={"versionValue"}
              control={control}
              views={["year", "month"]}
              label="Period*"
              rules={{ required: "Period is required" }}
            />

            <TextField
              label="Version Name(Distinct Name for Identical Version of Same Data Source)*"
              fullWidth
              {...register("versionName", {
                required: "Version name is required",
              })}
              onChange={(event) => {
                setVersionName(event.target.value);
              }}
              error={!!errors.versionName}
              defaultValue={""}
              disabled={
                watch("versionValue") && watch("dataSourceId") ? false : true
              }
              helperText={
                errors.versionName?.message ||
                (versionNameAvailability.isFetched && versionName.length > 0 ? (
                  versionNameAvailability.data?.available ? (
                    <Typography
                      variant="subtitle2"
                      color="success"
                      component={"span"}
                    >
                      Version name is available
                    </Typography>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      color="error"
                      component={"span"}
                    >
                      version name is not available
                    </Typography>
                  )
                ) : (
                  ""
                ))
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: STYLE_GUIDE.SPACING.s2,
                  alignItems: "center",
                  fontSize: "14px",
                  backgroundColor:
                    theme.dashboardTheme?.colors?.background?.paper ||
                    "#ffffff",
                  "& fieldset": {
                    borderColor:
                      theme.dashboardTheme?.colors?.inputBorder ||
                      STYLE_GUIDE.COLORS.darkBackground,
                  },
                  "&:hover fieldset": {
                    borderColor:
                      theme.dashboardTheme?.colors?.borderHover ||
                      STYLE_GUIDE.COLORS.darkBorderHover,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor:
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                },
                "& .MuiInputLabel-root": {
                  color:
                    theme.dashboardTheme?.colors?.text?.secondary ||
                    STYLE_GUIDE.COLORS.darkBorderFocus,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color:
                    theme.dashboardTheme?.components?.input?.focusBorderColor ||
                    theme.dashboardTheme?.components?.input
                      ?.focusBorderColorFallback ||
                    STYLE_GUIDE.COLORS.inputFocusFallback,
                },
                "& .MuiInputBase-input": {
                  color: `${
                    theme.dashboardTheme?.colors?.inputText ||
                    theme.dashboardTheme?.colors?.text?.primary ||
                    "#000000"
                  } !important`,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: `${
                    theme.dashboardTheme?.colors?.text?.secondary || "#666"
                  } !important`,
                },
                "& .MuiInputBase-input:-webkit-autofill": {
                  WebkitTextFillColor: `${
                    theme.dashboardTheme?.colors?.inputText ||
                    theme.dashboardTheme?.colors?.text?.primary ||
                    "#000000"
                  } !important`,
                  WebkitBoxShadow: `0 0 0 1000px ${
                    theme.dashboardTheme?.colors?.background?.paper || "#ffffff"
                  } inset !important`,
                },
              }}
            />

            {fileUploadLoader ? (
              <ProgressBar />
            ) : (
              <FileUploadButton
                fileName={fileName}
                onFileChange={handleFileChange}
                buttonName={"Upload File"}
              />
            )}
            {console.log("fileHeader", fileHeader)}

            {fileHeader.length > 0 &&
              settingAttribute.length > 0 &&
              settingAttributeOption.length > 0 &&
              !dataSourceDetails.isFetching && (
                <Table>
                  <TableHead>
                    <TableRow>
                      {/* <TableCell>{fileName?.split('.')[0]} Attribute</TableCell>
                        <TableCell>Entity Setting Attribute</TableCell> */}
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
                        {fileName?.split(".")[0]} Attribute
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {settingAttributeOption.map((option, index) => {
                      const normalize = (str) =>
                        str.replace(/\s+/g, "").toLowerCase();

                      const matchedHeader = fileHeader.find(
                        (header) => normalize(header) === normalize(option)
                      );

                      console.log("option34", option);
                      console.log("matchedHeader", matchedHeader);
                      return (
                        <TableRow key={index}>
                          <TableCell>{option}</TableCell>
                          <TableCell>
                            <CommonSelect
                              control={control}
                              name={`mappings.${option}`}
                              label={"Map To"}
                              options={fileHeader}
                              defaultValue={matchedHeader || ""}
                              rules={{
                                required:
                                  "Choose how to handle extra fields:skip saving for this column.",
                              }}
                              error={!!errors.mappings?.[option]}
                              errorMessage={errors.mappings?.[option]?.message}
                              setValue={setValue}
                            />
                            {!!watch(`mappings.${option}`) &&
                              settingAttribute.some(
                                (attr) =>
                                  attr.name === watch(`mappings.${option}`) &&
                                  attr.type === "multioption"
                              ) && (
                                <TextField
                                  label="Seprate Multioption*"
                                  fullWidth
                                  {...register(`separator.${option}`, {
                                    required: "Separator is required",
                                  })}
                                  error={!!errors.separator?.[option]}
                                  helperText={
                                    errors.separator?.[option]?.message
                                  }
                                />
                              )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* {fileHeader.map((header, index) => (
                        <TableRow key={index}>
                          <TableCell>{header}</TableCell>
                          <TableCell>
                            <CommonSelect
                              control={control}
                              name={`mappings.${header}`}
                              label={'Map To'}
                              options={settingAttributeOption}
                              defaultValue={settingAttributeOption.includes(header) ? header : ''}
                              rules={{
                                required:
                                  'Choose how to handle extra fields: either save the data or skip saving for this column.',
                              }}
                              error={!!errors.mappings?.[header]}
                              errorMessage={errors.mappings?.[header]?.message}
                              setValue={setValue}
                            />
                            {!!watch(`mappings.${header}`) &&
                              settingAttribute.some(
                                (attr) => attr.name === watch(`mappings.${header}`) && attr.type === 'multioption'
                              ) && (
                                <TextField
                                  label="Seprate Multioption*"
                                  fullWidth
                                  {...register(`separator.${header}`, {
                                    required: 'Separator is required',
                                  })}
                                  error={!!errors.separator?.[header]}
                                  helperText={errors.separator?.[header]?.message}
                                />
                              )}
                          </TableCell>
                        </TableRow>
                      ))} */}
                  </TableBody>
                </Table>
              )}
          </Stack>
        </Box>
      </DialogContainer>

      <Dialog open={open} onClose={handleFormClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            ...getDialogTitleSx(),
            color:
              theme.palette.dialog?.titleColor ||
              STYLE_GUIDE.COLORS.textDarkGray,
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <CommonDropdownSearch
                control={control}
                name={`dataSourceId`}
                label="Select Data Source* "
                apiUrl={`${GET.Data_Source_List}`}
                labelName="name"
                labelValue="_id"
                defaultValue={""}
                rules={{ required: "Data Source is required" }}
                error={!!errors.dataSourceId}
                errorMessage={errors.dataSourceId?.message as string}
                apiName="entityList"
                defaultDataUrl={""}
              />
              <CommonDatePicker
                name={"versionValue"}
                control={control}
                views={["year", "month"]}
                label="Period*"
                rules={{ required: "Period is required" }}
              />

              <TextField
                label="Version Name(Distinct Name for Identical Version of Same Data Source)*"
                fullWidth
                {...register("versionName", {
                  required: "Version name is required",
                })}
                onChange={(event) => {
                  setVersionName(event.target.value);
                }}
                error={!!errors.versionName}
                defaultValue={""}
                disabled={
                  watch("versionValue") && watch("dataSourceId") ? false : true
                }
                helperText={
                  errors.versionName?.message ||
                  (versionNameAvailability.isFetched &&
                  versionName.length > 0 ? (
                    versionNameAvailability.data?.available ? (
                      <Typography
                        variant="subtitle2"
                        color="success"
                        component={"span"}
                      >
                        Version name is available
                      </Typography>
                    ) : (
                      <Typography
                        variant="subtitle2"
                        color="error"
                        component={"span"}
                      >
                        version name is not available
                      </Typography>
                    )
                  ) : (
                    ""
                  ))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: STYLE_GUIDE.SPACING.s2,
                    alignItems: "center",
                    fontSize: "14px",
                    backgroundColor:
                      theme.dashboardTheme?.colors?.background?.paper ||
                      "#ffffff",
                    "& fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.inputBorder ||
                        STYLE_GUIDE.COLORS.darkBackground,
                    },
                    "&:hover fieldset": {
                      borderColor:
                        theme.dashboardTheme?.colors?.borderHover ||
                        STYLE_GUIDE.COLORS.darkBorderHover,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColor ||
                        theme.dashboardTheme?.components?.input
                          ?.focusBorderColorFallback ||
                        STYLE_GUIDE.COLORS.inputFocusFallback,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color:
                      theme.dashboardTheme?.colors?.text?.secondary ||
                      STYLE_GUIDE.COLORS.darkBorderFocus,
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color:
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColor ||
                      theme.dashboardTheme?.components?.input
                        ?.focusBorderColorFallback ||
                      STYLE_GUIDE.COLORS.inputFocusFallback,
                  },
                  "& .MuiInputBase-input": {
                    color: `${
                      theme.dashboardTheme?.colors?.inputText ||
                      theme.dashboardTheme?.colors?.text?.primary ||
                      "#000000"
                    } !important`,
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: `${
                      theme.dashboardTheme?.colors?.text?.secondary || "#666"
                    } !important`,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitTextFillColor: `${
                      theme.dashboardTheme?.colors?.inputText ||
                      theme.dashboardTheme?.colors?.text?.primary ||
                      "#000000"
                    } !important`,
                    WebkitBoxShadow: `0 0 0 1000px ${
                      theme.dashboardTheme?.colors?.background?.paper ||
                      "#ffffff"
                    } inset !important`,
                  },
                }}
              />

              {fileUploadLoader ? (
                <ProgressBar />
              ) : (
                <FileUploadButton
                  fileName={fileName}
                  onFileChange={handleFileChange}
                  buttonName={"Upload File"}
                />
              )}
              {console.log("fileHeader", fileHeader)}

              {fileHeader.length > 0 &&
                settingAttribute.length > 0 &&
                settingAttributeOption.length > 0 &&
                !dataSourceDetails.isFetching && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {/* <TableCell>{fileName?.split('.')[0]} Attribute</TableCell>
                        <TableCell>Entity Setting Attribute</TableCell> */}
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
                          {fileName?.split(".")[0]} Attribute
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {settingAttributeOption.map((option, index) => {
                        const normalize = (str) =>
                          str.replace(/\s+/g, "").toLowerCase();

                        const matchedHeader = fileHeader.find(
                          (header) => normalize(header) === normalize(option)
                        );

                        console.log("option34", option);
                        console.log("matchedHeader", matchedHeader);
                        return (
                          <TableRow key={index}>
                            <TableCell>{option}</TableCell>
                            <TableCell>
                              <CommonSelect
                                control={control}
                                name={`mappings.${option}`}
                                label={"Map To"}
                                options={fileHeader}
                                defaultValue={matchedHeader || ""}
                                rules={{
                                  required:
                                    "Choose how to handle extra fields:skip saving for this column.",
                                }}
                                error={!!errors.mappings?.[option]}
                                errorMessage={
                                  errors.mappings?.[option]?.message
                                }
                                setValue={setValue}
                              />
                              {!!watch(`mappings.${option}`) &&
                                settingAttribute.some(
                                  (attr) =>
                                    attr.name === watch(`mappings.${option}`) &&
                                    attr.type === "multioption"
                                ) && (
                                  <TextField
                                    label="Seprate Multioption*"
                                    fullWidth
                                    {...register(`separator.${option}`, {
                                      required: "Separator is required",
                                    })}
                                    error={!!errors.separator?.[option]}
                                    helperText={
                                      errors.separator?.[option]?.message
                                    }
                                  />
                                )}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {/* {fileHeader.map((header, index) => (
                        <TableRow key={index}>
                          <TableCell>{header}</TableCell>
                          <TableCell>
                            <CommonSelect
                              control={control}
                              name={`mappings.${header}`}
                              label={'Map To'}
                              options={settingAttributeOption}
                              defaultValue={settingAttributeOption.includes(header) ? header : ''}
                              rules={{
                                required:
                                  'Choose how to handle extra fields: either save the data or skip saving for this column.',
                              }}
                              error={!!errors.mappings?.[header]}
                              errorMessage={errors.mappings?.[header]?.message}
                              setValue={setValue}
                            />
                            {!!watch(`mappings.${header}`) &&
                              settingAttribute.some(
                                (attr) => attr.name === watch(`mappings.${header}`) && attr.type === 'multioption'
                              ) && (
                                <TextField
                                  label="Seprate Multioption*"
                                  fullWidth
                                  {...register(`separator.${header}`, {
                                    required: 'Separator is required',
                                  })}
                                  error={!!errors.separator?.[header]}
                                  helperText={errors.separator?.[header]?.message}
                                />
                              )}
                          </TableCell>
                        </TableRow>
                      ))} */}
                    </TableBody>
                  </Table>
                )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          {isPending ? (
            <ProgressBar />
          ) : (
            <Box>
              <Button
                onClick={handleCancel}
                color="error"
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                color="primary"
                disabled={!!file && !fileUploadLoader ? false : true}
                sx={{ fontSize: 18, fontWeight: "bold", p: 1, pl: 2, pr: 2 }}
              >
                Save Data Source
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateDataSourceVersion;
