import { useEffect, useState } from "react";
import {
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Autocomplete,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
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
}

const EngagementLetterSection = ({
  control,
  watch,
  errors,
  setValue,
}: Props) => {
  const [allLetters, setAllLetters] = useState<EngagementLetter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<EngagementLetter[]>(
    []
  );
  const [loadingLetters, setLoadingLetters] = useState(false);

  const selectedVendorCode = watch("code");
  const isEngagementEnabled = watch("isEngagementLetter");

  // ✅ Fetch all engagement letters
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

  // ✅ Filter letters for selected vendor
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

  // ✅ Clear value if switch is OFF
  useEffect(() => {
    if (!isEngagementEnabled) {
      setValue("engagementLetterId", null, { shouldValidate: true });
    }
  }, [isEngagementEnabled, setValue]);

  return (
    <>
      {/* Engagement Letter Switch */}
      <Grid size={6}>
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

      {/* Engagement Letter Autocomplete */}
      {isEngagementEnabled && (
        <Grid size={6}>
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
    // Normalize value → always string
    const normalizedValue =
      typeof field.value === "object" && field.value !== null
        ? field.value._id
        : field.value;

    return (
      <Autocomplete
        options={filteredLetters}
        loading={loadingLetters}
        fullWidth
        getOptionLabel={(option) =>
          option.engagementLetterFileName ||
          option.referenceNumber ||
          ""
        }
        value={
          filteredLetters.find(
            (letter) => letter._id === normalizedValue
          ) || null
        }
        onChange={(_, newValue) => {
          // ALWAYS store only _id string
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
                  {loadingLetters && (
                    <CircularProgress size={18} />
                  )}
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
      )}
    </>
  );
};

export default EngagementLetterSection;