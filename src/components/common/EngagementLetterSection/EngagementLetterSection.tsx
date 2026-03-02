import { useEffect, useState } from "react";
import {
  Grid,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Autocomplete,
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
  
  const selectedVendorId = watch("code");
  const isEngagementEnabled = watch("isEngagementLetter");

  // Fetch all engagement letters
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

  // Filter letters for selected vendor and in-force status
  useEffect(() => {
    if (selectedVendorId) {
      const filtered = allLetters.filter(
        (letter) =>
          letter.vendorId?.code === selectedVendorId &&
          letter.engagementLetterStatus === "in-force"
      );
      setFilteredLetters(filtered);
    } else {
      setFilteredLetters([]);
    }

    // Clear engagementLetterId when vendor changes or switch is off
    setValue("engagementLetterId", null);
  }, [selectedVendorId, allLetters, setValue]);

  return (
    <>
      {/* Engagement Letter Switch */}
      <Grid item xs={6}>
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
        <Grid item xs={6}>
          <Controller
            name="engagementLetterId"
            control={control}
            rules={{
              required: "Engagement Letter is required",
            }}
            render={({ field }) => (
              <Autocomplete
                options={filteredLetters}
                loading={loadingLetters}
                getOptionLabel={(option) => option.referenceNumber || ""}
                value={
                  filteredLetters.find((letter) => letter._id === field.value) ||
                  null
                }
                onChange={(_, newValue) =>
                  field.onChange(newValue ? newValue._id : null)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Engagement Letter"
                    error={!!errors.engagementLetterId}
                    helperText={errors.engagementLetterId?.message}
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
            )}
          />
        </Grid>
      )}
    </>
  );
};

export default EngagementLetterSection;