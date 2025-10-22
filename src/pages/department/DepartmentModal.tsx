
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller, FormState } from "react-hook-form";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useGet from "../../hooks/useGet";
import usePut from "../../hooks/usePut";
import usePost from "../../hooks/usePost";
import { GET, POST, PUT } from "../../services/apiRoutes";

interface Department {
  _id: string;
  name: string;
  status: string;
}

interface DepartmentPostPayload {
  name: string;
//   departmentId: string;
}

interface DepartmentPostResponse {
  success: boolean;
  data?: any;
  message?: string;
}

interface Department {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
//   departmentId?: {
//     _id: string;
//     name: string;
//     status: string;
//   };
}

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view" | "filter";
  editDepartmentId?: string;
  rowData?: Department | null;
  onDepartmentCreated?: () => void;
  onDepartmentUpdated?: () => void;
  filterValues?: { name: string;
    //  departmentId: string 
    };
  onFilterApply?: (values: { name: string;
    //  departmentId: string
     }) => void;
  onFilterReset?: () => void;
}

export function DepartmentModal({
  open,
  onClose,
  mode,
  editDepartmentId,
  rowData,
  onDepartmentCreated,
  onDepartmentUpdated,
  filterValues,
  onFilterApply,
  onFilterReset,
}: DepartmentModalProps) {
  const theme = useUnifiedTheme();
  const { control, handleSubmit, reset, formState } = useForm({
    defaultValues: {
      name: "",
    //   departmentId: "",
    },
    mode: "onChange",
  });

  const departmentList = useGet<{
    success: boolean;
    data: Department[];
  }>(["departmentList"], GET?.DEPARTMENT_LIST, true);

  const createDepartment = usePost<
    DepartmentPostPayload,
    DepartmentPostResponse
  >(
    ["createDepartment"],
    (data) => {
      if (data?.success) {
        onDepartmentCreated?.();
        onClose();
      } else {
        console.log("Failed to create Department:", data?.message);
      }
    },
    true
  );

  const updateDepartment = usePut<
    DepartmentPostPayload,
    DepartmentPostResponse
  >(
    ["updateDepartment"],
    (data) => {
      if (data?.success) {
        onDepartmentUpdated?.();
        onClose();
      } else {
        console.log("Failed to update Department:", data?.message);
      }
    },
    true
  );

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        reset({
          name: rowData?.name || "",
        //   departmentId: rowData?.departmentId?._id || "",
        });
      } else {
        reset({
          name: "",
        //   departmentId: "",
        });
      }
    }
  }, [open, mode, rowData, reset]);

  const onSubmit = (data: DepartmentPostPayload) => {
    if (mode === "filter" && onFilterApply) {
      onFilterApply(data);
      onClose();
    } else if (mode !== "view") {
      const payload = {
        name: data.name.trim(),
        // departmentId: data.departmentId,
      };

      if (mode === "add") {
        createDepartment.mutate({
          url: POST.CREATE_DEPARTMENT,
          payload,
        });
      } else if (mode === "edit" && editDepartmentId) {
        updateDepartment.mutate({
          url: `${PUT.UPDATE_DEPARTMENT}/${editDepartmentId}`,
          payload,
        });
      }
    }
  };

  const handleResetFilter = () => {
    reset({ name: "", 
        // departmentId: "" 
    });
    onFilterReset?.();
  };

  const isFormValid = formState.isValid;
  const isFormDirty = formState.isDirty;
  const isSaving = createDepartment.isLoading || updateDepartment.isLoading;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          p: 3,
          width: "400px",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {mode === "add"
            ? "Add Department"
            : mode === "edit"
              ? "Edit Department"
              : mode === "view"
                ? "View Department"
                : "Filter Departments"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {mode === "view" ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Name
                  </Typography>
                  <Box
                    sx={{
                      padding: 1.5,
                      borderRadius: 1,
                      backgroundColor: "#f5f5f5",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {rowData?.name || "-"}
                  </Box>
                </>
              ) : (
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Name *"
                      placeholder="Enter department name"
                      variant="outlined"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || " "}
                      disabled={isSaving}
                    />
                  )}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              {/* {mode === "view" ? (
                <></>
                // <>
                //   <Typography variant="subtitle2" sx={{ mb: 1 }}>
                //     Department
                //   </Typography>
                //   <Box
                //     sx={{
                //       padding: 1.5,
                //       borderRadius: 1,
                //       backgroundColor: "#f5f5f5",
                //       color: theme.palette.text.primary,
                //     }}
                //   >
                //     {rowData?.departmentId?.name || "-"}
                //   </Box>
                // </>
              ) : (
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        {...field}
                        label="Department"
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSaving}
                      >
                        {departmentList.data?.data?.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              )} */}
            </Grid>
          </Grid>

          {isSaving && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 3,
            }}
          >
            {mode === "filter" ? (
              <>
                <Button
                  variant="outlined"
                  onClick={handleResetFilter}
                  size="small"
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  sx={{ borderRadius: "8px" }}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={!filterValues?.name
                    //  &&     !filterValues?.departmentId
                }
                >
                  Apply
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={onClose} size="small">
                  Cancel
                </Button>
                {mode !== "view" && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ borderRadius: "8px" }}
                    size="small"
                    disabled={!isFormValid || !isFormDirty || isSaving}
                  >
                    Save
                  </Button>
                )}
              </>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
}