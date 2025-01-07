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
  defaultDataUrl: string;
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
  defaultDataUrl,
  rules = {},
  error = false,
  errorMessage = '',
  apiName,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [allData, setAllData] = useState<Option[]>([]);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchAllData, setSearchAllData] = useState<Option[]>([]);
  const [searchExhausted, setSearchExhausted] = useState(false);

  const defaultDataDetails = useGet<{ success: boolean; data: any; totalCount: number }>(
    [apiName, `${defaultValue}`],
    `${defaultDataUrl}/${defaultValue}`,
    !!defaultValue
  );

  const { data, isFetching } = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    [apiName, `${currentPage}`],
    `${apiUrl}?page=${currentPage}&limit=10`,
    !!currentPage && searchTerm.length === 0 && (defaultDataDetails.isFetched || !defaultValue)
  );

  const searchData = useGet<{ success: boolean; data: any[]; totalCount: number }>(
    [apiName, `${currentSearchPage}`, `${searchTerm}`],
    `${apiUrl}?page=${currentSearchPage}&limit=10&search=${searchTerm}`,
    !!currentSearchPage && !!searchTerm.length && !searchExhausted && (defaultDataDetails.isFetched || !defaultValue)
  );

  useEffect(() => {
    if (data?.data) {
      const formattedOptions = data.data.map((item) => ({
        label: item[labelName],
        value: item[labelValue],
      }));
      if (currentPage === 1) {
        if (defaultDataDetails.data?.data) {
          setAllData((_) => {
            const updatedData = [
              { label: defaultDataDetails.data.data[labelName], value: defaultDataDetails.data.data[labelValue] },
              ...formattedOptions,
            ];
            const uniqueData = Array.from(new Map(updatedData.map((item) => [item.label, item])).values());
            return uniqueData;
          });
        } else {
          setAllData(formattedOptions);
        }
      } else {
        setAllData((prev) => {
          const updatedData = [...prev, ...formattedOptions];
          const uniqueData = Array.from(new Map(updatedData.map((item) => [item.label, item])).values());
          return uniqueData;
        });
      }
    }
  }, [data, defaultDataDetails.data]);

  useEffect(() => {
    if (searchData?.data?.data) {
      const formattedOptions = searchData?.data?.data.map((item) => ({
        label: item[labelName],
        value: item[labelValue],
      }));
      if (currentSearchPage === 1) {
        if (defaultDataDetails.data?.data) {
          setSearchAllData((_) => {
            const updatedData = [
              { label: defaultDataDetails.data.data[labelName], value: defaultDataDetails.data.data[labelValue] },
              ...formattedOptions,
            ];
            const uniqueData = Array.from(new Map(updatedData.map((item) => [item.label, item])).values());
            return uniqueData;
          });
        } else {
          setSearchAllData(formattedOptions);
        }
      } else {
        setSearchAllData((prev) => {
          const updatedData = [...prev, ...formattedOptions];
          const uniqueData = Array.from(new Map(updatedData.map((item) => [item.label, item])).values());
          return uniqueData;
        });
      }
      if (searchData && searchData.data && searchData.data.data && searchData.data.data.length === 0) {
        setSearchExhausted(true);
      } else {
        setSearchExhausted(false);
      }
    }
  }, [searchData.data, defaultDataDetails.data]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setOptions(searchAllData);
    } else {
      setOptions(allData);
    }
  }, [allData, searchAllData, searchTerm]);

  const lastRowRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isFetching || searchData.isFetching || options.length >= data?.totalCount! || searchExhausted) return;

      // Disconnect the previous observer if it exists
      if (lastRowRef.current) {
        lastRowRef.current.disconnect();
      }

      // Create a new IntersectionObserver
      lastRowRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (searchTerm.length > 0) {
            setCurrentSearchPage((prevPage) => prevPage + 1);
          } else {
            setCurrentPage((prevPage) => prevPage + 1);
          }
        }
      });

      // Observe the new node if it exists
      if (node) {
        lastRowRef.current.observe(node);
      }
    },
    [isFetching, options.length, searchTerm, data?.totalCount, searchData.isFetching]
  );

  return (
    <FormControl fullWidth error={error}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field }) => {
          // Match the selected value to the options array
          const selectedOption = options.find((option) => option.value === field.value) || null;

          return (
            <Autocomplete
              {...field}
              value={selectedOption} // Use the matched option as the value
              options={options}
              onInputChange={(_, value, reason) => {
                console.log(reason);
                if (reason === 'input') {
                  field.onChange(null);
                  setSearchTerm(value);
                  setCurrentSearchPage(1);
                  setCurrentPage(1);
                  setSearchExhausted(false);
                } else if (reason != 'selectOption' && reason != 'reset') {
                  setSearchTerm('');
                  setCurrentSearchPage(1);
                  setCurrentPage(1);
                  setSearchExhausted(false);
                }
              }}
              getOptionLabel={(option) => option?.label || ''} // Ensure it handles empty values gracefully
              onChange={(_, selectedOption) => field.onChange(selectedOption?.value || null)} // Update only the value
              renderInput={(params) => <TextField {...params} label={label} error={error} />}
              renderOption={(props, option, state) => {
                const isLast = options.length - 1 === state.index;
                const { key, ...restProps } = props;
                return (
                  <li key={key} {...restProps} ref={isLast ? lastElementRef : null}>
                    {option.label}
                  </li>
                );
              }}
            />
          );
        }}
      />
      <FormHelperText>{errorMessage}</FormHelperText>
    </FormControl>
  );
};

export default CommonDropdownSearch;
