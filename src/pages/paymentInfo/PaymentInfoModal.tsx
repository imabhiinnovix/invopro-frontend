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
  InputAdornment,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { StyledButton } from "../../components/common";
import useGet from "../../hooks/useGet";
import usePostMultipart from "../../hooks/usePostMultipart";
import usePut from "../../hooks/usePut";
import { GET, POST, PUT } from "../../services/apiRoutes";
import CommonDatePicker from "../../components/common/datePicker/datePicker";
import { CURRENCIES } from "../../constants/currencies";
import { Autocomplete } from "@mui/material";
import usePutMultipart from "../../hooks/usePutMultipart";

export function PaymentInfoModal({
  open,
  onClose,
  mode,
  editId,
  rowData,
  onCreated,
  onUpdated,
}: any) {
  const [invoiceInput, setInvoiceInput] = useState("");
  const [invoiceList, setInvoiceList] = useState<string[]>([]);

  const [creditInput, setCreditInput] = useState("");
  const [creditList, setCreditList] = useState<string[]>([]);

  const [file, setFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      purchaseOrderId: "",
      vendorId: "",
      transactionId: "",
      referenceNo: "",
      paymentCurrency: "",
      paymentDate:"",
      grossPaymentAmount: "",
      taxDeduction: "",
      actualPaymentAmount: "",
      bankSwiftCode: "",
      remarks: "",
      referenceDate: "",
    },
  });

  const poList = useGet(["poList"], GET.Purchase_Order_List, true);

  const createPayment = usePostMultipart(
    ["createPayment"],
    (res) => {
      if (res?.success) {
        onCreated?.();
        onClose();
      }
    },
    true
  );

  const updatePayment = usePutMultipart(
    ["updatePayment"],
    (res) => {
      if (res?.success) {
        onUpdated?.();
        onClose();
      }
    },
    true
  );

  const gross = watch("grossPaymentAmount");
  const tax = watch("taxDeduction");

  useEffect(() => {
    if (rowData) {
      const poId =
        rowData?.purchaseOrderId?._id || rowData?.purchaseOrderId || "";
      reset({
        ...rowData,
        purchaseOrderId: poId,
        vendorId: rowData?.vendorId?._id || rowData?.vendorId || "",
      });
      setInvoiceList(rowData.invoiceNumber || []);
      setCreditList(rowData.creditNoteNumber || []);
    } else {
      reset({
          purchaseOrderId: "",
      vendorId: "",
      transactionId: "",
      referenceNo: "",
      paymentCurrency: "",
      paymentDate:"",
      grossPaymentAmount: "",
      taxDeduction: "",
      actualPaymentAmount: "",
      bankSwiftCode: "",
      remarks: "",
      referenceDate: "",
      });
      setInvoiceList([]);
      setCreditList([]);
    }
    setFile(null);
  }, [rowData, reset]);

  const addInvoice = () => {
    if (invoiceInput && !invoiceList.includes(invoiceInput)) {
      setInvoiceList([...invoiceList, invoiceInput]);
      setInvoiceInput("");
    }
  };

  const removeInvoice = (inv: string) => {
    setInvoiceList(invoiceList.filter((i) => i !== inv));
  };

  const addCredit = () => {
    if (creditInput && !creditList.includes(creditInput)) {
      setCreditList([...creditList, creditInput]);
      setCreditInput("");
    }
  };

  const removeCredit = (cn: string) => {
    setCreditList(creditList.filter((i) => i !== cn));
  };

  const onSubmit = (data: any) => {
  if (invoiceList.length === 0) return;

  const poId =
    typeof data.purchaseOrderId === "object"
      ? data.purchaseOrderId._id
      : data.purchaseOrderId;
  const vendorId =
    typeof data.vendorId === "object" ? data.vendorId._id : data.vendorId;

  // Clean payload: remove functions and invalid fields
  const payload: any = {
    purchaseOrderId: poId,
    vendorId,
    transactionId: data.transactionId,
    referenceNo: data.referenceNo || "",
    referenceDate: data.referenceDate || "",
    invoiceNumber: invoiceList,
    creditNoteNumber: creditList,
    paymentCurrency: data.paymentCurrency,
    paymentDate:data.paymentDate,
    grossPaymentAmount: Number(data.grossPaymentAmount || 0),
    taxDeduction:
      data.taxDeduction === "" || data.taxDeduction === null
        ? 0
        : Number(data.taxDeduction),
    actualPaymentAmount: Number(data.actualPaymentAmount || 0),
    bankSwiftCode: data.bankSwiftCode || "",
    remarks: data.remarks || "",
    files: file || undefined,
  };

  if (mode === "add") {
    // const formData = new FormData();
    // Object.entries(payload).forEach(([key, value]) => {
    //   if (Array.isArray(value)) {
    //     value.forEach((v: any) => formData.append(key, v));
    //   } else {
    //     formData.append(key, value);
    //   }
    // });
    // if (file) formData.append("files", file);

    createPayment.mutate({ url: POST.Create_Payment, payload });
  } else {
    // Edit
    // if (file) {
    //   const formData = new FormData();
    //   Object.entries(payload).forEach(([key, value]) => {
    //     if (Array.isArray(value)) {
    //       value.forEach((v: any) => formData.append(key, v));
    //     } else {
    //       formData.append(key, value);
    //     }
    //   });
    //   formData.append("files", file);
    //   updatePayment.mutate({
    //     url: `${PUT.UPDATE_PAYMENT}/${editId}`,
    //     payload: formData,
    //   });
    // } else {
      // Send JSON directly
      updatePayment.mutate({
        url: `${PUT.UPDATE_PAYMENT}/${editId}`,
        payload,
      });
    //}
  }
};

  const isView = mode === "view";

  return (
    <Modal open={open} onClose={onClose}>
      <Box p={3} bgcolor="#fff" m="auto" mt={5} width={600}>
        <Typography variant="h6">Payment Info</Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} mt={1}>
            {/* Purchase Order */}
            <Grid item xs={6}>
              <Controller
                name="purchaseOrderId"
                control={control}
                rules={{ required: "Purchase Order is required" }}
                render={({ field }) => (
                  <FormControl fullWidth required>
                    <InputLabel>Purchase Order</InputLabel>
                    <Select {...field} label="Purchase Order" disabled={isView}>
                      <MenuItem value="">Select Purchase Order</MenuItem>
                      {poList.data?.data?.map((po: any) => (
                        <MenuItem key={po._id} value={po._id}>
                          {po.poNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Transaction ID */}
            <Grid item xs={6}>
              <Controller
                name="transactionId"
                control={control}
                rules={{ required: "Transaction Id is required" }}
                render={({ field }) => (
                  <TextField
                    required
                    {...field}
                    label="Transaction ID"
                    fullWidth
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            {/* Invoice */}
            <Grid item xs={12}>
              <Controller
                name="invoiceNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextField
                      value={invoiceInput}
                      onChange={(e) => setInvoiceInput(e.target.value)}
                      label="Invoice Number"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={isView}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (invoiceInput && !invoiceList.includes(invoiceInput)) {
                            const newList = [...invoiceList, invoiceInput];
                            setInvoiceList(newList);
                            setInvoiceInput("");
                            field.onChange(newList);
                          }
                        }
                      }}
                      InputProps={{
                        endAdornment: !isView && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                if (invoiceInput && !invoiceList.includes(invoiceInput)) {
                                  const newList = [...invoiceList, invoiceInput];
                                  setInvoiceList(newList);
                                  setInvoiceInput("");
                                  field.onChange(newList);
                                }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                      {invoiceList.map((inv) => (
                        <Chip
                          key={inv}
                          label={inv}
                          onDelete={isView ? undefined : () => {
                            const newList = invoiceList.filter((i) => i !== inv);
                            setInvoiceList(newList);
                            field.onChange(newList);
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              />
            </Grid>

            {/* Credit Note */}
            <Grid item xs={12}>
              <TextField
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                label="Credit Note Number"
                fullWidth
                disabled={isView}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCredit();
                  }
                }}
                InputProps={{
                  endAdornment: !isView && (
                    <InputAdornment position="end">
                      <IconButton onClick={addCredit}>
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {creditList.map((cn) => (
                  <Chip
                    key={cn}
                    label={cn}
                    onDelete={isView ? undefined : () => removeCredit(cn)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Reference No */}
            <Grid item xs={6}>
              <Controller
                name="referenceNo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Reference No" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            {/* Reference Date */}
            <Grid item xs={6}>
              <CommonDatePicker
                name="referenceDate"
                control={control}
                label="Reference Date"
                disabled={isView}
              />
            </Grid>

            {/* Currency */}
            <Grid item xs={4}>
              <Controller
                name="paymentCurrency"
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

            {/* Payment Date */}
            <Grid item xs={6}>
              <Controller
                name="paymentDate"
                control={control}
                rules={{ required: "Payment date is required" }}
                render={({ field, fieldState }) => (
                  <CommonDatePicker
                    {...field}
                    label="Payment Date"
                    control={control}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            {/* Amounts */}
            <Grid item xs={4}>
              <Controller
                name="grossPaymentAmount"
                control={control}
                rules={{ required: "Gross amount is required" }}
                render={({ field }) => (
                  <TextField
                    required
                    {...field}
                    label="Gross Amount"
                    type="number"
                    fullWidth
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="taxDeduction"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tax Deduction"
                    type="number"
                    fullWidth
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                name="actualPaymentAmount"
                control={control}
                rules={{ required: "Actual amount is required" }}
                render={({ field }) => (
                  <TextField
                    required
                    {...field}
                    label="Actual Amount"
                    type="number"
                    fullWidth
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            {/* Bank Swift Code */}
            <Grid item xs={6}>
              <Controller
                name="bankSwiftCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Bank Swift Code" fullWidth disabled={isView} />
                )}
              />
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Remarks"
                    fullWidth
                    multiline
                    rows={3}
                    disabled={isView}
                  />
                )}
              />
            </Grid>

            {/* Upload */}
            <Grid item xs={12}>
              {!isView && (
                <Button variant="outlined" component="label">
                  Upload Supporting Document
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
              )}

              {file && (
                <Typography variant="body2" mt={1}>
                  {file.name}
                </Typography>
              )}

            {/* View uploaded file in view mode */}
{rowData?.bankDebitAdviceFilePath && (
  <Typography mt={1}>
    <a
      href={
        rowData.bankDebitAdviceFilePath.startsWith("http")
          ? rowData.bankDebitAdviceFilePath
          : `${import.meta.env.VITE_INVOICIVIX_BACKEND_URL}${rowData.bankDebitAdviceFilePath}`
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {rowData.bankDebitAdviceFileName || "View Uploaded Document"}
    </a>
  </Typography>
)}
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>

              {!isView && (
                <StyledButton
                  type="submit"
                  disabled={!formState.isValid || invoiceList.length === 0}
                >
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