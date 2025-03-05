import React, { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";
import CommonSelect from "../../common/dropdown/commonSelect";

interface CreateDataSourceVersionProps {
  fileName: {
    name: string;
    _id: string;
  };
  CustomButton: React.ReactElement;
  title: string;
  settingAttributeOption: {
    name: string;
    mappingName: string;
  }[];
  fileHeaders: string[];
  control: any;
  reset: any;
  errors: any;
  setValue: any;
  index: number;
  getValues: any;
}

const ViewMapping: React.FC<CreateDataSourceVersionProps> = ({
  fileName,
  CustomButton,
  title,
  settingAttributeOption,
  fileHeaders,
  control,
  reset,
  errors,
  setValue,
  index,
  getValues,
}) => {
  console.log("🚀 ~ fileName̥:", fileName);
  console.log("🚀 ~ fileHeaders:", fileHeaders);
  console.log("🚀 ~ settingAttributeOption:", settingAttributeOption);
  console.log("🚀 ~ getValues:", getValues());
  const [open, setOpen] = useState(-1);

  // Initialize mappings when the component mounts
  useEffect(() => {
    settingAttributeOption.forEach((option) => {
      setValue(
        `mappings.${fileName?.name}.${option.name}`,

        fileHeaders.find(
          (name) =>
            name
              .replace(/[^a-zA-Z0-9/]/g, "")
              .replace(/\//g, " or ")
              .replace(/\s+/g, "")
              .trim()
              .toLowerCase() ===
            option.mappingName
              .replace(/[^a-zA-Z0-9/]/g, "")
              .replace(/\//g, " or ")
              .replace(/\s+/g, "")
              .trim()
              .toLowerCase()
        )
          ? fileHeaders.find(
              (name) =>
                name
                  .replace(/[^a-zA-Z0-9/]/g, "")
                  .replace(/\//g, " or ")
                  .replace(/\s+/g, "")
                  .trim()
                  .toLowerCase() ===
                option.mappingName
                  .replace(/[^a-zA-Z0-9/]/g, "")
                  .replace(/\//g, " or ")
                  .replace(/\s+/g, "")
                  .trim()
                  .toLowerCase()
            )
          : ""
      );
      console.log(
        "XXXXX_XXXXXX_XXXXX",
        fileHeaders.find(
          (name) =>
            name
              .replace(/[^a-zA-Z0-9/]/g, "")
              .replace(/\//g, " or ")
              .replace(/\s+/g, "")
              .trim()
              .toLowerCase() ===
            option.mappingName
              .replace(/[^a-zA-Z0-9/]/g, "")
              .replace(/\//g, " or ")
              .replace(/\s+/g, "")
              .trim()
              .toLowerCase()
        )
          ? fileHeaders.find(
              (name) =>
                name
                  .replace(/[^a-zA-Z0-9/]/g, "")
                  .replace(/\//g, " or ")
                  .replace(/\s+/g, "")
                  .trim()
                  .toLowerCase() ===
                option.mappingName
                  .replace(/[^a-zA-Z0-9/]/g, "")
                  .replace(/\//g, " or ")
                  .replace(/\s+/g, "")
                  .trim()
                  .toLowerCase()
            )
          : ""
      );
    });
  }, [fileHeaders, setValue, settingAttributeOption, fileName]);

  const handleCancel = () => {
    reset();
    setOpen(-1);
  };

  // Directly get form values and save
  const handleSave = () => {
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
                    <TableCell>Entity Setting Attribute</TableCell>
                    <TableCell>{fileName.name} Attribute</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settingAttributeOption.map((option, index) => (
                    <TableRow key={index}>
                      <TableCell>{option.name}</TableCell>
                      <TableCell>
                        <CommonSelect
                          control={control}
                          name={`mappings.${fileName}.${option.name}`}
                          label={"Map To"}
                          options={fileHeaders}
                          error={
                            !!errors.mappings?.[fileName.name]?.[option.name]
                          }
                          errorMessage={
                            errors.mappings?.[fileName.name]?.[option.name]
                              ?.message
                          }
                          setValue={setValue}
                          // defaultValue={fileHeaders.find(
                          //   (name) =>
                          //     name
                          //       .replace(/[^a-zA-Z0-9/]/g, "")
                          //       .replace(/\//g, " or ")
                          //       .replace(/\s+/g, "")
                          //       .trim()
                          //       .toLowerCase() ===
                          //     option.mappingName
                          //       .replace(/[^a-zA-Z0-9/]/g, "")
                          //       .replace(/\//g, " or ")
                          //       .replace(/\s+/g, "")
                          //       .trim()
                          //       .toLowerCase()
                          // )}
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
