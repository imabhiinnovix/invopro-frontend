import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FormControl, TextField, FormHelperText, CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import useGet from '../../../hooks/useGet';

interface CommonDropdownSearchProps {
  control: any; // React Hook Form control
  name: string; // Field name
  label: string; // Label for the dropdown
  apiUrl: string; // API URL to fetch data
  labelName: string; // Key for the option label in API response
  labelValue: string; // Key for the option value in API response
  defaultValue?: any; // Default value for the dropdown
  rules?: any; // Validation rules
  error?: boolean; // Error state
  errorMessage?: string; // Error message
  apiName: string;
}

interface Option {
  label: string;
  value: any;
}

const CommonDropdownSearch: React.FC<CommonDropdownSearchProps> = ({
  control,
  name,
  label,
  apiUrl,
  labelName,
  labelValue,
  defaultValue = null,
  rules = {},
  error = false,
  errorMessage = '',
  apiName,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isFetching } = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    [apiName, `${currentPage}`],
    `${apiUrl}?page=${currentPage}&limit=4`,
    !!currentPage
  );

  useEffect(() => {
    if (data?.data) {
      const formattedOptions = data.data.map((item) => ({
        label: item[labelName],
        value: item[labelValue],
      }));
      setOptions((prev) => [...prev, ...formattedOptions]);
    }
  }, [data]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isFetching || options.length >= data?.totalCount!) return;

      // Disconnect the previous observer if it exists
      if (lastRowRef.current) {
        lastRowRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastRowRef.current.observe(node);
      }
    },
    [isFetching, options.length, data?.totalCount]
  );

  return (
    <FormControl fullWidth error={error}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field }) => (
          <Autocomplete
            {...field}
            options={options}
            getOptionLabel={(option) => option.label || ''}
            onChange={(_, selectedOption) => field.onChange(selectedOption?.value || null)}
            slotProps={{
              listbox: {
                style: { maxHeight: '300px', overflow: 'auto' }, // Apply slotProps.listbox here
              },
            }}
            renderInput={(params) => <TextField {...params} label={label} error={error} />}
            renderOption={(props, option, state) => {
              const isLast = options.length - 1 === state.index;
              return (
                <li
                  {...props}
                  ref={isLast ? lastElementRef : null} // Attach observer to the last item
                >
                  {option.label}
                </li>
              );
            }}
          />
        )}
      />
      <FormHelperText>{errorMessage}</FormHelperText>
    </FormControl>
  );
};

export default CommonDropdownSearch;
