/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Modal,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { StyledButton } from "../../components/common";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { CURRENCIES } from "../../constants/currencies";
import usePostMultipart from "../../hooks/usePostMultipart";
import usePut from "../../hooks/usePut";
import { GET, POST, PUT } from "../../services/apiRoutes";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";

export function PurchaseOrderModal({
  open,
  onClose,
  mode,
  editId,
  rowData,
  onCreated,
  onUpdated,
}: any) {
  const isView = mode === "view";

  const {
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      poNumber: "",
      poDate: "",
      poValue: "",
      poCurrency: "",
      vendorId: "",
      entityCode: "",
      entityName: "",
      entityAddress: "",
      poCreatedBy: "",
      poCreationDate: "",
      poApprovedBy: "",
      poApprovedDate: "",
      billingEntityName: "",
      billingEntityAddress: "",
      billingEntityTaxId: "",
      remarks: "",
    },
  });

  const createPO = usePost(
    ["createPO"],
    (res) => {
      if (res?.success) {
        onCreated?.();
        onClose();
      }
    },
    true
  );

  const updatePO = usePut(
    ["updatePO"],
    (res) => {
      if (res?.success) {
        onUpdated?.();
        onClose();
      }
    },
    true
  );

  const vendorList = useGet(["vendorList"], GET.Vendor_List, true);

  useEffect(() => {
    if (rowData) {
      // If vendorId is object, extract _id
      const data = {
        ...rowData,
        vendorId:
          typeof rowData.vendorId === "object" && rowData.vendorId?._id
            ? rowData.vendorId._id
            : rowData.vendorId || "",
      };
      reset(data);
    } else {
      reset({ poNumber: "",
      poDate: "",
      poValue: "",
      poCurrency: "",
      vendorId: "",
      entityCode: "",
      entityName: "",
      entityAddress: "",
      poCreatedBy: "",
      poCreationDate: "",
      poApprovedBy: "",
      poApprovedDate: "",
      billingEntityName: "",
      billingEntityAddress: "",
      billingEntityTaxId: "",
      remarks: "",});
    }
  }, [rowData, reset]);

  const onSubmit = (data: any) => {
    const payload = { ...data };
    if (mode === "add") {
      createPO.mutate({ url: POST.Create_Purchase_Order, payload });
    } else {
      updatePO.mutate({
        url: `${PUT.UPDATE_PURCHASE_ORDER}/${editId}`,
        payload,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box p={3} bgcolor="#fff" m="auto" mt={5} width={700}>
        <Typography variant="h6">Purchase Order</Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} mt={1}>

            {/* Vendor */}
            <Grid item xs={6}>
              <Controller
                name="vendorId"
                control={control}
                rules={{ required: "Vendor is required" }}
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <InputLabel>Vendor</InputLabel>
                    <Select {...field} label="Vendor" disabled={isView}>
                      <MenuItem value="">Select Vendor</MenuItem>
                      {vendorList.data?.data?.map((v: any) => (
                        <MenuItem key={v._id} value={v._id}>
                          {v.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Purchase Order Number */}
            <Grid item xs={6}>
              <Controller
                name="poNumber"
                control={control}
                rules={{ required: "Purchase Order Number is required" }}
                render={({ field }) => (
                  <TextField {...field} label="Purchase Order Number" fullWidth required disabled={isView} />
                )}
              />
            </Grid>

            {/* Purchase Order Date */}
            <Grid item xs={6}>
              <CommonDatePicker
                name="poDate"
                control={control}
                rules={{ required: "Purchase Order Date is required" }}
                label="Purchase Order Date"
                disabled={isView}
              />
            </Grid>

            {/* Purchase Order Value */}
            <Grid item xs={6}>
              <Controller
                name="poValue"
                control={control}
                rules={{ required: "Purchase Order Value is required" }}
                render={({ field }) => (
                  <TextField {...field} type="number" label="Purchase Order Value" fullWidth required disabled={isView} />
                )}
              />
            </Grid>

            {/* Purchase Order Currency */}
            <Grid item xs={6}>
              <Controller
                name="poCurrency"
                control={control}
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <Autocomplete
                    options={CURRENCIES}
                    getOptionLabel={(option) => option.label}
                    value={CURRENCIES.find((c) => c.code === field.value) || null}
                    onChange={(_, newValue) =>
                      field.onChange(newValue ? newValue.code : "")
                    }
                    disabled={isView}
                    renderInput={(params) => (
                      <TextField {...params} label="Currency" size="small" required />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Entity Info */}
            <Grid item xs={6}>
              <Controller
                name="entityCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Entity Code" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="entityName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Entity Name" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="entityAddress"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Entity Address" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            {/* Purchase Order Created */}
            <Grid item xs={6}>
              <Controller
                name="poCreatedBy"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Purchase Order Created By" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <CommonDatePicker
                name="poCreationDate"
                control={control}
                label="Purchase Order Creation Date"
                disabled={isView}
              />
            </Grid>

            {/* Purchase Order Approved */}
            <Grid item xs={6}>
              <Controller
                name="poApprovedBy"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Purchase Order Approved By" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <CommonDatePicker
                name="poApprovedDate"
                control={control}
                label="Purchase Order Approved Date"
                disabled={isView}
              />
            </Grid>

            {/* Billing Info */}
            <Grid item xs={6}>
              <Controller
                name="billingEntityName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Billing Entity Name" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="billingEntityAddress"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Billing Entity Address" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="billingEntityTaxId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Billing Entity Tax ID" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Remarks" fullWidth multiline rows={3} disabled={isView} />
                )}
              />
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={onClose}>Close</Button>
              {!isView && (
                <StyledButton type="submit" disabled={!formState.isValid}>
                  {mode === "edit" ? "Update" : "Save"}
                </StyledButton>
              )}
            </Grid>

          </Grid>
        </form>
      </Box>
    </Modal>
  );
}