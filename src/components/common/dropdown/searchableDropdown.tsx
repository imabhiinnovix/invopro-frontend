import React, { useEffect, useState } from 'react';
import { FormControl, TextField, FormHelperText, CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
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
  const [options, setOptions] = useState<{ label: string; value: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const perPageItem = 10;

  const itemList = useGet<{ success: boolean; data: any; totalCount: number }>(
    [apiName, String(currentPage)],
    apiUrl + `?page=${currentPage}&limit=${perPageItem}`,
    !!currentPage
  );

  useEffect(() => {
    if (itemList?.data?.data) {
      if (currentPage === 1) {
        setOptions([...itemList?.data?.data]);
      } else {
        setOptions((prev) => [...prev, ...itemList?.data?.data]);
      }
    }
  }, [itemList?.data?.data]);

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
            getOptionLabel={(option) => option[labelName]! || ''}
            onInputChange={(_, value) => setSearchTerm(value)}
            onChange={(_, value) => field.onChange(value?.value?.[labelValue])}
            renderInput={(params) => {
              itemList.isFetching ? <Skeleton height={40} /> : <TextField {...params} label={label} />;
            }}
          />
        )}
      />
      <FormHelperText>{errorMessage}</FormHelperText>
    </FormControl>
  );
};

export default CommonDropdownSearch;
