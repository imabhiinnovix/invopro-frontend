import { useMemo } from "react";
import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { SxProps, Theme, TextFieldProps } from "@mui/material";
import StyledAutocomplete from "../../atom/common/StyledAutocomplete";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";

export type LocationType = "country" | "state" | "city";

/**
 * Validates if a country value exists in available countries
 * @param countryValue - Country ISO code or name to validate
 * @returns Valid country value (ISO code) or empty string if not found
 */
export const validateCountry = (
  countryValue: string | null | undefined
): string => {
  if (!countryValue) return "";

  try {
    const countries = Country.getAllCountries();
    const countryExists = countries.find(
      (c) => c.isoCode === countryValue || c.name === countryValue
    );
    return countryExists ? countryExists.isoCode : "";
  } catch {
    return "";
  }
};

/**
 * Validates if a state value exists in available states for a country
 * @param stateValue - State ISO code or name to validate
 * @param countryValue - Country ISO code
 * @returns Valid state value (ISO code) or empty string if not found
 */
export const validateState = (
  stateValue: string | null | undefined,
  countryValue: string | null | undefined
): string => {
  if (!stateValue || !countryValue) return "";

  try {
    const states = State.getStatesOfCountry(countryValue);
    const stateExists = states.find(
      (s) => s.isoCode === stateValue || s.name === stateValue
    );
    return stateExists ? stateExists.isoCode : "";
  } catch {
    return "";
  }
};

/**
 * Validates if a city value exists in available cities for a state
 * @param cityValue - City name to validate
 * @param countryValue - Country ISO code
 * @param stateValue - State ISO code
 * @returns Valid city value (name) or empty string if not found
 */
export const validateCity = (
  cityValue: string | null | undefined,
  countryValue: string | null | undefined,
  stateValue: string | null | undefined
): string => {
  if (!cityValue || !countryValue || !stateValue) return "";

  try {
    const cities = City.getCitiesOfState(countryValue, stateValue);
    const cityExists = cities.find((c) => c.name === cityValue);
    return cityExists ? cityExists.name : "";
  } catch {
    return "";
  }
};

/**
 * Validates all location values (country, state, city) in a cascading manner
 * @param countryValue - Country ISO code or name
 * @param stateValue - State ISO code or name
 * @param cityValue - City name
 * @returns Object with validated country, state, and city values
 */
export const validateLocationValues = (
  countryValue: string | null | undefined,
  stateValue: string | null | undefined,
  cityValue: string | null | undefined
): { country: string; state: string; city: string } => {
  const validCountry = validateCountry(countryValue);
  const validState = validateState(stateValue, validCountry);
  const validCity = validateCity(cityValue, validCountry, validState);

  return {
    country: validCountry,
    state: validState,
    city: validCity,
  };
};

interface LocationAutocompleteProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  locationType: LocationType;
  selectedCountry?: string | null;
  selectedState?: string | null;
  errors?: FieldErrors<T>;
  rules?: RegisterOptions<T>;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  variant?: TextFieldProps["variant"];
  size?: TextFieldProps["size"];
}

interface LocationOption {
  label: string;
  value: string;
}

const LocationAutocomplete = <T extends FieldValues>({
  control,
  name,
  label,
  locationType,
  selectedCountry,
  selectedState,
  errors,
  rules = {},
  required = false,
  fullWidth = true,
  disabled = false,
  sx = {},
  variant,
  size,
}: LocationAutocompleteProps<T>) => {
  const options = useMemo<LocationOption[]>(() => {
    try {
      switch (locationType) {
        case "country": {
          const countries = Country.getAllCountries();

          return countries.map((country: ICountry) => ({
            label: country.name,
            value: country.isoCode,
          }));
        }
        case "state": {
          if (!selectedCountry) return [];
          const states = State.getStatesOfCountry(selectedCountry);
          return states.map((state: IState) => ({
            label: state.name,
            value: state.isoCode,
          }));
        }
        case "city": {
          if (!selectedCountry || !selectedState) return [];
          const cities = City.getCitiesOfState(selectedCountry, selectedState);
          return cities.map((city: ICity) => ({
            label: city.name,
            value: city.name,
          }));
        }
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error loading ${locationType} options:`, error);
      return [];
    }
  }, [locationType, selectedCountry, selectedState]);

  const fieldError = errors?.[name];
  const error = !!fieldError;
  const isDisabled =
    disabled ||
    (locationType === "state" && !selectedCountry) ||
    (locationType === "city" && (!selectedCountry || !selectedState));

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const selectedOption =
          options.find((option) => option.value === field.value) || null;

        return (
          <StyledAutocomplete<LocationOption>
            {...field}
            value={selectedOption}
            options={options}
            label={label}
            error={error}
            helperText={fieldError?.message as string}
            fullWidth={fullWidth}
            getOptionLabel={(option) => option?.label || ""}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onChange={(_, newValue) => {
              field.onChange(newValue?.value || "");
            }}
            disabled={isDisabled}
            sx={{
              "& .MuiOutlinedInput-root.Mui-disabled": {
                cursor: "not-allowed",
                "& fieldset": {
                  borderColor: "action.disabled",
                },
                "& input": {
                  color: "action.disabled",
                  WebkitTextFillColor: "action.disabled",
                },
              },
              "& .MuiInputLabel-root.Mui-disabled": {
                color: "action.disabled",
              },
              "& .MuiAutocomplete-endAdornment": {
                color: isDisabled ? "action.disabled" : undefined,
              },
              ...sx,
            }}
            textFieldProps={{
              required,
              disabled: isDisabled,
              variant,
              size,
            }}
          />
        );
      }}
    />
  );
};

export default LocationAutocomplete;
