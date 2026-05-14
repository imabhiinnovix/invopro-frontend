import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import DatePicker from "react-multi-date-picker";
import DialogContainer from "../components/molecule/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  vendors: any[];
  currentFilters?: any;
  yearOptions?: string[];
  monthOptions?: string[];
}

const InvoiceReviewFilterModal: React.FC<Props> = ({
  open,
  onClose,
  onApply,
  vendors = [],
  currentFilters = {},
  yearOptions = [],
  monthOptions = [],
}) => {
  const [vendor, setVendor] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [uploadedDate, setUploadedDate] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setVendor(currentFilters.vendor || "");
      setYear(currentFilters.year || "");
      setMonth(currentFilters.month || "");
      setUploadedDate(
      currentFilters.uploadedDate?.startDate &&
      currentFilters.uploadedDate?.endDate
        ? [
            new Date(currentFilters.uploadedDate.startDate),
            new Date(currentFilters.uploadedDate.endDate),
          ]
        : []
    );
    }
  }, [open, currentFilters]);

  useEffect(() => {
    if (month && !monthOptions.includes(month)) {
      setMonth("");
    }
  }, [year, monthOptions]);

  const handleApply = () => {
    onApply({
      vendor,
      year,
      month,
      uploadedDate: {
        startDate: uploadedDate?.[0]?.format?.("YYYY-MM-DD") || "",
        endDate: uploadedDate?.[1]?.format?.("YYYY-MM-DD") || "",
      },
    });

    onClose();
  };

  const handleReset = () => {
    setVendor("");
    setYear("");
    setMonth("");
    setUploadedDate([]);

    onApply({});
    onClose();
  };

  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title="Invoice Filters"
      actions={
        <>
          <Button onClick={handleReset}>Reset</Button>
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </>
      }
    >
      <Box
  display="grid"
  gridTemplateColumns="repeat(2, 1fr)"
  gap={2}
  pt={2}
>
        {/* Vendor */}
        <FormControl fullWidth size="small">
          <InputLabel>Vendor</InputLabel>
          <Select
            value={vendor}
            label="Vendor"
            onChange={(e) => setVendor(e.target.value)}
          >
            <MenuItem value="">All Vendors</MenuItem>
            {vendors.map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year */}
        <FormControl fullWidth size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Month */}
        <FormControl fullWidth size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value)}
            disabled={!year}
          >
            <MenuItem value="">All</MenuItem>
            {monthOptions.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Uploaded Date */}
       <Box gridColumn="span 1">
  <DatePicker
    value={uploadedDate}
    onChange={(range) => setUploadedDate(range || [])}
    range
    portal
    portalTarget={document.body}
    zIndex={9999}
    numberOfMonths={2}
    format="DD/MM/YYYY"
    placeholder="Uploaded Date"
    style={{
      width: "100%",
      height: "40px",
      padding: "8.5px 14px",
      borderRadius: 4,
      border: "1px solid #c4c4c4",
      boxSizing: "border-box",
      fontSize: "14px"
    }}
    containerStyle={{
      width: "100%",
      display: "block"
    }}
  />
</Box>
      </Box>
    </DialogContainer>
  );
};

export default InvoiceReviewFilterModal;