import { useEffect, useState } from "react";
import {
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Autocomplete,
  Button,
  Grid,
} from "@mui/material";
import { Controller } from "react-hook-form";
import axiosInstance from "../../../services/axiosInstance";

interface EngagementLetter {
  _id: string;
  vendorId?: {
    _id: string;
    name: string;
    code: string;
  };
  referenceNumber: string;
  engagementLetterFileName?: string;
  engagementLetterStatus?: "in-force" | "expired";
}

interface Props {
  control: any;
  watch: any;
  errors: any;
  setValue: any;
  setUploadedFile: (file: File | null) => void;
  vendorId?: string | null; // optional vendor _id
}

const EngagementLetterSection = ({
  control,
  watch,
  errors,
  setValue,
  setUploadedFile,
  vendorId,
}: Props) => {
  const [allLetters, setAllLetters] = useState<EngagementLetter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<EngagementLetter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);

  const selectedVendorCode = watch("code");
  const isEngagementEnabled = watch("isEngagementLetter");

  // Fetch engagement letters
  useEffect(() => {
    const fetchEngagementLetters = async () => {
      try {
        setLoadingLetters(true);
        const res = await axiosInstance.get(
          "/invoicivix-vendor/engagement-letter/list",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAllLetters(res.data?.data || []);
      } catch (error) {
        console.error("Failed to load engagement letters", error);
      } finally {
        setLoadingLetters(false);
      }
    };

    fetchEngagementLetters();
  }, []);

  // Filter letters by vendor
  useEffect(() => {
    if (selectedVendorCode) {
      const filtered = allLetters.filter(
        (letter) =>
          letter.vendorId?.code === selectedVendorCode &&
          letter.engagementLetterStatus === "in-force"
      );
      setFilteredLetters(filtered);
    } else {
      setFilteredLetters([]);
    }
  }, [selectedVendorCode, allLetters]);

  // Clear selection when switch OFF
  useEffect(() => {
    if (!isEngagementEnabled) {
      setValue("engagementLetterId", null);
      setUploadedFile(null);
    }
  }, [isEngagementEnabled]);

  // Upload handler
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // if (!vendorId) {
    //   alert("Please select a vendor first");
    //   return;
    // }

    setUploadedFile(file);

    const newLetter: EngagementLetter = {
      _id: "new-upload",
      referenceNumber: file.name,
      engagementLetterFileName: file.name,
      engagementLetterStatus: "in-force",
      vendorId: { _id: vendorId, name: "", code: selectedVendorCode },
    };

    // Replace existing "new-upload" if any
    setFilteredLetters((prev) => [
      newLetter,
      ...prev.filter((l) => l._id !== "new-upload"),
    ]);

    // Auto select uploaded file
    setValue("engagementLetterId", "new-upload", { shouldValidate: true });
  };
  return (
    <>
      {/* Switch */}
      <Grid xs={6}>
        <Controller
          name="isEngagementLetter"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Attach Engagement Letter"
            />
          )}
        />
      </Grid>

      {isEngagementEnabled && (
        <>
          {/* Upload Button */}
          <Grid xs={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              // disabled={!selectedVendorCode}
            >
              Upload Engagement Letter
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUpload}
              />
            </Button>
          </Grid>

          {/* Dropdown */}
          <Grid xs={6}>
            <Controller
              name="engagementLetterId"
              control={control}
              rules={{
                validate: (value) => {
                  if (isEngagementEnabled && !value) {
                    return "Engagement Letter is required";
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                const normalizedValue =
                  typeof field.value === "object" ? field.value?._id : field.value;

                return (
                  <Autocomplete
                    options={filteredLetters}
                    loading={loadingLetters}
                    fullWidth
                    getOptionLabel={(option) =>
                      option.engagementLetterFileName || option.referenceNumber || ""
                    }
                    value={
                      filteredLetters.find(
                        (letter) => letter._id === normalizedValue
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      field.onChange(newValue?._id || null);
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option._id === (value?._id || value)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Engagement Letter"
                        error={!!errors.engagementLetterId}
                        helperText={errors.engagementLetterId?.message}
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingLetters && <CircularProgress size={18} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                );
              }}
            />
          </Grid>
        </>
      )}
    </>
  );
};

export default EngagementLetterSection;