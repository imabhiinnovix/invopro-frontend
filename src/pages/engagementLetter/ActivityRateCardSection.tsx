"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  Autocomplete,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { Controller, useForm } from "react-hook-form";

import { StyledButton } from "../../components/common";

import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import usePut from "../../hooks/usePut";
import useDelete from "../../hooks/useDelete";

import { GET, POST, PUT, DELETE } from "../../services/apiRoutes";
import { CURRENCIES } from "../../constants/currencies";
import { LANGUAGES } from "../../constants/languages";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";

interface Props {
  vendorId: string;
  engagementLetterId: string;
  currency: string;
}

interface FormValues {
  costCode: any; // store object from autocomplete
  costType: any; // store object from autocomplete
  rateType: string;
  rate?: number;
  minRate?: number;
  maxRate?: number;
  currency: string;
  languageFrom?: string;
  languageTo?: string;
  upperCap?: number;
  status: string;
}

const defaultValues: FormValues = {
  costCode: null,
  costType: null,
  rateType: "",
  rate: undefined,
  minRate: undefined,
  maxRate: undefined,
  currency: "",
  languageFrom: "",
  languageTo: "",
  upperCap: undefined,
  status: "active",
};

export default function ActivityRateCardSection({
  vendorId,
  engagementLetterId,
  currency,
}: Props) {
  const [editRow, setEditRow] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [costCodeOptions, setCostCodeOptions] = useState<any[]>([]);
  const [costTypeOptions, setCostTypeOptions] = useState<any[]>([]);

  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues,
  });

  const activityList = useGet<any>(
    ["activityRateCardList", vendorId, engagementLetterId],
    `${GET.Activity_Rate_Card_List}?vendorId=${vendorId}&engagementLetterId=${engagementLetterId}`,
    !!vendorId && !!engagementLetterId
  );

  const createActivity = usePost(
    ["createActivityRateCard"],
    () => {
      reset(defaultValues);
      setShowForm(false);
      activityList.refetch();
    },
    true
  );

  const updateActivity = usePut(
    ["updateActivityRateCard"],
    () => {
      reset(defaultValues);
      setEditRow(null);
      setShowForm(false);
      activityList.refetch();
    },
    true
  );

  const deleteActivity = useDelete(
    ["deleteActivityRateCard"],
    () => {
      activityList.refetch();
    },
    true
  );

  const costCodeMaster = usePost(["costCodeMaster"], undefined, false);
  const costTypeMaster = usePost(["costTypeMaster"], undefined, false);

  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list,
  );

  // Extract IDs based on code
const costCodeDataSourceId = commonDataSourceList.find(ds => ds.code === 'costcode')?._id;
const costTypeDataSourceId = commonDataSourceList.find(ds => ds.code === 'costtype')?._id;

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const costCodeRes: any = await costCodeMaster.mutateAsync({
          url: POST.DATASOURCE_MASTER_LIST,
          payload: { dataSourceId: costCodeDataSourceId },
        });

        const costTypeRes: any = await costTypeMaster.mutateAsync({
          url: POST.DATASOURCE_MASTER_LIST,
          payload: { dataSourceId: costTypeDataSourceId },
        });

        setCostCodeOptions(costCodeRes?.data || []);
        setCostTypeOptions(costTypeRes?.data || []);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    if (currency) {
      reset({
        ...defaultValues,
        currency,
        status: "active",
      });
    }
  }, [currency, reset]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      costCode: data.costCode?.["Cost Code"] || "",
      costType: data.costType?.["Cost Type"] || "",
      vendorId,
      engagementLetterId,
    };

    if (editRow) {
      updateActivity.mutate({
        url: PUT.UPDATE_ACTIVITY_RATE_CARD + editRow._id,
        payload,
      });
    } else {
      createActivity.mutate({
        url: POST.Create_Activity_Rate_Card,
        payload,
      });
    }
  };

  const handleAdd = () => {
    setEditRow(null);
    reset({
      ...defaultValues,
      currency,
      status: "active",
    });
    setShowForm(true);
  };

  const handleEdit = (row: any) => {
    // Map existing strings back to objects for Autocomplete
    const costCodeObj = costCodeOptions.find((o) => o["Cost Code"] === row.costCode) || null;
    const costTypeObj = costTypeOptions.find((o) => o["Cost Type"] === row.costType) || null;

    setEditRow(row);
    reset({ ...row, costCode: costCodeObj, costType: costTypeObj });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditRow(null);
    reset(defaultValues);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteActivity.mutate({
        url: `${DELETE.Delete_Activity_Rate_Card}/${deleteId}`,
      });
    }
    handleCloseDialog();
  };

  return (
    <Card sx={{ mt: 0 }}>
      <CardContent>
       <Grid container alignItems="center" justifyContent="space-between" sx={{mb:2}}>
  <Grid item>
    {/* <Typography variant="h6">Activity Rate Card</Typography> */}
  </Grid>

  <Grid item>
    <Button variant="outlined" onClick={handleAdd}>
      Add Rate
    </Button>
  </Grid>
</Grid>

        <Collapse in={showForm} timeout="auto" unmountOnExit>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} mb={3}>
              {/* COST CODE */}
              <Grid item xs={4}>
                <Controller
                  name="costCode"
                  control={control}
                  // rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      options={costCodeOptions}
                      getOptionLabel={(option) => option["Cost Code"]}
                      value={field.value || null}
                      onChange={(_, newValue) => field.onChange(newValue || null)}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <Typography fontSize={14}>{option["Cost Code"]}</Typography>
                            <Typography fontSize={12} color="text.secondary">
                              {option["Code Description"]}
                            </Typography>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cost Code"
                          size="small"
                          helperText={field.value?.Comments}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* COST TYPE */}
              <Grid item xs={4}>
                <Controller
                  name="costType"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      options={costTypeOptions}
                      getOptionLabel={(option) => option["Cost Type"]}
                      value={field.value || null}
                      onChange={(_, newValue) => field.onChange(newValue || null)}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>
                            <Typography fontSize={14}>{option["Cost Type"]}</Typography>
                            <Typography fontSize={12} color="text.secondary">
                              {option["Cost Type Description"]}
                            </Typography>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cost Type"
                          size="small"
                          helperText={field.value?.["Comments for Mapping"]}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* RATE TYPE */}
              <Grid item xs={4}>
                <TextField
                  select
                  label="Rate Type"
                  fullWidth
                  size="small"
                  {...register("rateType", { required: true })}
                >
                  <MenuItem value="fixed">Fixed</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="per_word">Per Word</MenuItem>
                  <MenuItem value="per_page">Per Page</MenuItem>
                  <MenuItem value="upper_cap">Upper Cap</MenuItem>
                </TextField>
              </Grid>

              {/* RATE */}
              <Grid item xs={4}>
                <TextField
                  label="Rate"
                  type="number"
                  inputProps={{ step: "0.0001" }}
                  size="small"
                  fullWidth
                  {...register("rate")}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="Min Rate"
                  type="number"
                  inputProps={{ step: "0.0001" }}
                  size="small"
                  fullWidth
                  {...register("minRate")}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="Max Rate"
                  type="number"
                  inputProps={{ step: "0.0001" }}
                  size="small"
                  fullWidth
                  {...register("maxRate")}
                />
              </Grid>

              {/* LANGUAGE FROM */}
              <Grid item xs={4}>
                <Controller
                  name="languageFrom"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={LANGUAGES}
                      getOptionLabel={(option) => option.label}
                      value={LANGUAGES.find((l) => l.code === field.value) || null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.code : "")
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Language From" size="small" />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* LANGUAGE TO */}
              <Grid item xs={4}>
                <Controller
                  name="languageTo"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={LANGUAGES}
                      getOptionLabel={(option) => option.label}
                      value={LANGUAGES.find((l) => l.code === field.value) || null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.code : "")
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Language To" size="small" />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* UPPER CAP */}
              <Grid item xs={4}>
                <TextField
                  label="Upper Cap"
                  type="number"
                  inputProps={{ step: "0.0001" }}
                  size="small"
                  fullWidth
                  {...register("upperCap")}
                />
              </Grid>

              {/* CURRENCY */}
              <Grid item xs={4}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={CURRENCIES}
                      getOptionLabel={(option) => option.label}
                      value={CURRENCIES.find((c) => c.code === field.value) || null}
                      onChange={(_, newValue) =>
                        field.onChange(newValue ? newValue.code : "")
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Currency" size="small" />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* STATUS */}
              <Grid item xs={4}>
                <TextField
                  select
                  label="Status"
                  size="small"
                  fullWidth
                  defaultValue="active"
                  {...register("status")}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={4} display="flex" alignItems="center">
                <StyledButton variant="primary" type="submit">
                  {editRow ? "Update" : "Add"}
                </StyledButton>

                <StyledButton variant="secondary" sx={{ ml: 2 }} onClick={cancelEdit}>
                  Cancel
                </StyledButton>
              </Grid>
            </Grid>
          </form>
        </Collapse>

        {/* TABLE */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cost Code</TableCell>
                <TableCell>Cost Type</TableCell>
                <TableCell>Rate Type</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Min</TableCell>
                <TableCell>Max</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Upper Cap</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activityList.data?.data && activityList.data.data.length > 0 ? (
              activityList.data?.data?.map((row: any) => (
                <TableRow key={row._id}>
                  <TableCell>{row.costCode}</TableCell>
                  <TableCell>{row.costType}</TableCell>
                  <TableCell>{row.rateType}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                  <TableCell>{row.minRate}</TableCell>
                  <TableCell>{row.maxRate}</TableCell>
                  <TableCell>
                    {LANGUAGES.find((l) => l.code === row.languageFrom)?.label} →{" "}
                    {LANGUAGES.find((l) => l.code === row.languageTo)?.label}
                  </TableCell>
                  <TableCell>{row.upperCap}</TableCell>
                  <TableCell>{row.currency}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(row._id)}
                      disabled={deleteActivity.isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
             ) : (
    <TableRow>
      <TableCell colSpan={12} align="center">
        No Data Available
      </TableCell>
    </TableRow>
  )} 
            </TableBody>
          </Table>
        </TableContainer>

        {/* DELETE DIALOG */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this activity rate card?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>No</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              disabled={deleteActivity.isLoading}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}