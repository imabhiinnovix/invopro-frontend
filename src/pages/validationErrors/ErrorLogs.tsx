import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import IosShareIcon from "@mui/icons-material/IosShare";
import useGet from "../../hooks/useGet";
import { GET } from "../../services/apiRoutes";
import { StyledButton } from "../../components/common";
import { ValidationErrorsDataTable } from "./ValidationErrorsDataTable";
import { NoErrorsDataTable } from "./NoErrorsDataTable";
import DialogContainer from "../../components/molecule/dialog";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ErrorsDataTable } from "./ErrorsDataTable";

export default function ErrorLogs({
  id,
  dataSourceId,
  paginationModel,
  setPaginationModel,
  searchValue,
  setSearchValue,
  debouncedSearchValue,
  handleEditRow,
}: any) {

   const [showExportSuccessDialog, setShowExportSuccessDialog] = useState(false);

  const navigate = useNavigate();
  // ✅ API CALL
  const ErrorList = useGet<any>(
    [
      "ErrorList",
      paginationModel.page,
      paginationModel.pageSize,
      debouncedSearchValue,
      id,
    ],
    id
      ? `${GET.NO_ERROR_ROW_DATA}?page=${paginationModel.page + 1}
        &limit=${paginationModel.pageSize}
        &dataSourceVersionId=${id}
        &dataSourceId=${dataSourceId}
        &search=${encodeURIComponent(debouncedSearchValue || "")}
        &isErrorLog=1
        &sort=${encodeURIComponent(JSON.stringify({ rowNumber: 1 }))}`
      : "",
    !!id
  );

    // ✅ NEW: Extract rowNumbers
  const rowNumbers = React.useMemo(() => {
    return (
      ErrorList?.data?.data
        ?.map((row: any) => row.rowNumber)
        ?.filter(Boolean) || []
    );
  }, [ErrorList?.data]);

  // ✅ NEW: VALIDATION ERROR LIST (same tab-change behavior)
  const validationErrorList = useGet<any>(
  [
    "validationErrorList",
    rowNumbers.join(","),
    id,
    dataSourceId,
  ],
  id && rowNumbers.length > 0
    ? `${GET.VALIDATION_ERROR_LIST}?dataSourceVersionId=${id
    }&dataSourceId=${dataSourceId
    }&filters=${encodeURIComponent(
         JSON.stringify({ rowNumber: rowNumbers, status: 'open' })
       )
      }&paginate=false`
    : "",
  !!id && rowNumbers.length > 0
);

  // ✅ MAP DATA (same as error tab)
  const rows =
    ErrorList?.data?.data?.map((row: any) => ({
      ...row,
      id: row._id,
      handleEdit: handleEditRow, // same Take Action
    })) || [];

  // ✅ EXPORT API
  const noErrorExport = useGet<any>(
    ["noErrorExport", id, debouncedSearchValue],
    `${GET.NO_ERROR_ROW_DATA}?dataSourceVersionId=${id}&dataSourceId=${dataSourceId}&type=export&search=${encodeURIComponent(
      debouncedSearchValue || ""
    )}`,
    false
  );

const [exportTriggered, setExportTriggered] = useState(false);

const handleExport = async () => {
  setExportTriggered(true);
  await noErrorExport.refetch();
};

// Show dialog whenever exportTriggered and noErrorExport.isSuccess
useEffect(() => {
  if (exportTriggered && noErrorExport.isSuccess) {
    setShowExportSuccessDialog(true);
    setExportTriggered(false); // reset for next export
  }
}, [exportTriggered, noErrorExport.isSuccess]);

    useEffect(() => {
    if (noErrorExport.isSuccess) {
      setShowExportSuccessDialog(true);
    }
  }, [noErrorExport.isSuccess]);

  return (
    <Card>
      <CardContent>
        {/* 🔹 Search + Export */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <TextField
            placeholder="Search ..."
            size="small"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setPaginationModel((prev: any) => ({ ...prev, page: 0 }));
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <StyledButton
            variant="primary"
            icon={<IosShareIcon />}
            onClick={handleExport}
            disabled={noErrorExport.isFetching}
          >
            {noErrorExport.isFetching ? "Exporting..." : "Export"}
          </StyledButton>
        </Box> */}

        {/* 🔹 Table */}
        <ErrorsDataTable
          rows={rows}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          rowCount={ErrorList?.data?.totalCount || 0}
          validationErrorList={validationErrorList}
          isLoadingRowDetail={false}
          handleDiscardSelectedRows={() => {}}
          resetSelections={false}
          setResetSelections={() => {}}
          isLatest={true}
          handleEditRow={handleEditRow}
        />
      </CardContent>
       <DialogContainer
        open={showExportSuccessDialog}
        onClose={() => setShowExportSuccessDialog(false)}
        title="Export Data"
        actions={
          <>
            <StyledButton
              variant="primary"
              onClick={() => {
                setShowExportSuccessDialog(false);
                navigate("/jobs"); // <-- use the hook
              }}
            >
              Go to Jobs
            </StyledButton>
          </>
        }
        maxWidth="xs"
      >
        <Typography>
          Your data has started exporting. You can view its status in the Jobs
          page.
        </Typography>
      </DialogContainer>
    </Card>
  );
}