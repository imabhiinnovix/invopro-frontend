import React from "react";
import {
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form";
import CommonSelect from "../../common/dropdown/commonSelect";
import { CustomReportData } from "../dataSourceVerion/uploadMultipleVersionValue";
import { useUnifiedTheme } from '../../../hooks/useUnifiedTheme';


interface CreateDataSourceVersionProps {
  fileName: {
    name: string;
    _id: string;
    extededName: string;
  };
  CustomButton: React.ReactElement;
  title: string;
  settingAttributeOption: {
    name: string;
    mappingName: string;
  }[];
  fileHeaders: string[];
  control: Control<CustomReportData, unknown>;
  setValue: UseFormSetValue<CustomReportData>;
  index: number;
  open: number;
  setOpen: React.Dispatch<React.SetStateAction<number>>;
  trigger: () => void;
  watch: UseFormWatch<CustomReportData>;
}

const ViewMapping: React.FC<CreateDataSourceVersionProps> = ({
  fileName,
  CustomButton,
  title,
  settingAttributeOption,
  fileHeaders,
  control,
  setValue,
  index,
  open,
  setOpen,
  trigger,
  watch,
}) => {
  const theme = useUnifiedTheme();
  const watchMapping = watch(`mappings.${fileName.extededName}`);
  const handleCancel = () => {
    trigger();
    setOpen(-1);
  };
  // Initialize mappings when the component mounts
  // useEffect(() => {
  //   if (open === -1) return;

  //   settingAttributeOption.forEach((option) => {
  //     const matchedHeader =
  //       fileHeaders.find(
  //         (name) =>
  //           name
  //             ?.replace(/[^a-zA-Z0-9/]/g, "")
  //             .replace(/\//g, " or ")
  //             .replace(/\s+/g, "")
  //             .trim()
  //             .toLowerCase() ===
  //           option.mappingName
  //             ?.replace(/[^a-zA-Z0-9/]/g, "")
  //             .replace(/\//g, " or ")
  //             .replace(/\s+/g, "")
  //             .trim()
  //             .toLowerCase()
  //       ) || null; // ✅ Convert undefined to null

  //     setValue(
  //       `mappings.${fileName?.name ?? ""}.${option.name ?? ""}`,
  //       matchedHeader
  //     );
  //   });
  // }, [fileHeaders, setValue, settingAttributeOption, fileName, open]);

  // Directly get form values and save
  const handleSave = () => {
    trigger();
    setOpen(-1);
  };

  return (
    <div>
      <Box onClick={() => setOpen(index)}>{CustomButton}</Box>
      {index === open && (
        <Dialog
          open={index === open}
          onClose={handleCancel}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      backgroundColor: theme.palette.table?.headerBackground,
                      color: theme.palette.table?.headerText,
                      fontWeight: 'medium'
                    }}>
                      Entity Setting Attribute
                    </TableCell>
                    <TableCell sx={{ 
                      backgroundColor: theme.palette.table?.headerBackground,
                      color: theme.palette.table?.headerText,
                      fontWeight: 'medium'
                    }}>
                      {fileName.extededName} Attribute
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settingAttributeOption.map((option, index) => (
                    <TableRow key={index}>
                      <TableCell>{option.name}</TableCell>
                      <TableCell>
                        <CommonSelect
                          control={control}
                          name={`mappings.${fileName.extededName}.${option.name}`}
                          label={"Map To"}
                          options={fileHeaders}
                          error={
                            watchMapping?.[option?.name] === "" ||
                            watchMapping?.[option?.name] === undefined ||
                            watchMapping?.[option?.name] === null ||
                            Object.values(watchMapping).filter(
                              (val) =>
                                val === watchMapping?.[option.name] &&
                                watchMapping?.[option.name] !==
                                  "Extra-Attribute-Ignore"
                            ).length > 1
                          }
                          errorMessage={
                            watchMapping?.[option?.name] === "" ||
                            watchMapping?.[option?.name] === undefined ||
                            watchMapping?.[option?.name] === null
                              ? "This field is required"
                              : Object.values(watchMapping).filter(
                                  (val) =>
                                    val === watchMapping?.[option.name] &&
                                    watchMapping?.[option.name] !==
                                      "Extra-Attribute-Ignore"
                                ).length > 1
                              ? "Duplicate value"
                              : ""
                          }
                          setValue={setValue}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="error">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              variant="contained"
              color="primary"
            >
              Save Data Mapping
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default ViewMapping;
