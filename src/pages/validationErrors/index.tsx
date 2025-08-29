import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import useGet from "../../hooks/useGet";
import usePost from "../../hooks/usePost";
import { GET, POST } from "../../services/apiRoutes";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { ValidationErrorsDataTable } from "./ValidationErrorsDataTable";
import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import { ValidationErrorModal } from "./ValidationErrorModel";
import { AttributeOptionRequestPayload } from "../../components/atom/attributeOption/types";

export default function ValidationErrors() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  // Single dialog state to handle both actions
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "discardAll" | "discardRow" | "resolveRow";
    rowData?: any;
  }>({ open: false, type: "discardAll" });

  // State for the action modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const discardAllSubmit = usePost(["discardAllSubmit"]);
  const discardRow = usePost(["discardRow"]);
  const resolveRow = usePost(["resolveRow"]);

  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
  }>([`attributeList`], GET?.Attribute_Option_List + `?paginate=true`);

  const validationErrorList = useGet<any>(
    [
      "validationErrorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
    ],
    `${GET?.VALIDATION_ERROR_LIST}?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&dataSourceVersionId=${id}&search=${encodeURIComponent(debouncedSearchValue)}`,
    true
  );

  console.log("Validation Error List:", validationErrorList?.data?.data);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // Function to handle row discard - now logs errorType for the specific row
  const handleDiscardRow = (rowData: any) => {
    console.log("Discard row clicked", rowData);
    console.log("Error Type for this row:", rowData.errorType);
    setDialog({ open: true, type: "discardRow", rowData });
  };

  const handleResolveRow = (rowData: any) => {
    console.log("Discard row clicked", rowData);
    console.log("Error Type for this row:", rowData.errorType);
    setDialog({ open: true, type: "resolveRow", rowData });
  };
  // Function to handle row edit - logs errorType for the specific row and opens the action modal
  const handleEditRow = (rowData: any) => {
    console.log("Edit row clicked", rowData);
    console.log("Error Type for this row:", rowData.errorType);
    setSelectedRow(rowData);
    setActionModalOpen(true);
  };

  // Process API data for DataGrid
  const validationErrorWithIds =
    Array.isArray(validationErrorList?.data?.data) &&
    validationErrorList.data.data.length > 0
      ? validationErrorList.data.data.map((validation) => ({
          ...validation,
          id:
            validation?._id ||
            `temp-${Math?.random()?.toString(36)?.substr(2, 9)}`,
          handleDiscard: handleDiscardRow,
          handleEdit: handleEditRow,
          handleResolve: handleResolveRow, // Assuming resolve uses the same modal as edit
        }))
      : [];

  // Extract dataSourceId from the first item (since all have the same ID)
  const firstItem =
    validationErrorWithIds.length > 0 ? validationErrorWithIds[0] : null;
  const dataSourceId = firstItem?.dataSourceId || null;

  console.log("Extracted dataSourceId:", dataSourceId);

  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list
  );
  console.log("Current Redux State:", commonDataSourceList);

  const currentDataSource = commonDataSourceList.find(
    (ds) => ds?._id === dataSourceId
  );
  console.log("Current Data Source:", currentDataSource);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleOpenDiscardAllDialog = () => {
    setDialog({ open: true, type: "discardAll" });
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, type: "discardAll" });
  };

  const handleCloseActionModal = () => {
    setActionModalOpen(false);
    setSelectedRow(null);
  };

  const handleConfirmAction = async () => {
    if (!id || !dataSourceId) {
      console.error("Missing required data for API call");
      handleCloseDialog();
      return;
    }
    setIsSubmitting(true);
    try {
      let response;

      if (dialog.type === "discardAll") {
        const payload = {
          action: "discardAllSubmit",
          dataSourceVersionId: id,
          dataSourceId: dataSourceId,
        };
        console.log("Payload to be sent:", payload);
        response = await discardAllSubmit.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      } else if (dialog?.type === "discardRow") {
        // Log errorType for the specific row being discarded
        console.log(
          "Error Type for row being discarded:",
          dialog.rowData?.errorType
        );
        const payload = {
          action: "discard",
          dataSourceVersionId: id,
          dataSourceId: dialog.rowData.dataSourceId,
          rowNumber: dialog.rowData.rowNumber,
        };
        console.log("Row discard payload:", payload);
        response = await discardRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      } else if (dialog?.type === "resolveRow") {
        console.log(
          "Error Type for row being resolved:",
          dialog.rowData?.errorType
        );
        const payload = {
          action: "unique",
          dataSourceVersionId: id,
          rowNumber: dialog.rowData.rowNumber,
        };
        console.log("Row unique payload:", payload);
        response = await resolveRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      }

      if (response?.success) {
        let successMessage;
        if (dialog.type === "discardAll") {
          successMessage =
            response?.message || "All rows discarded successfully";
        } else if (dialog.type === "discard") {
          successMessage = response?.message || "Row discarded successfully";
        } else if (dialog.type === "unique") {
          successMessage =
            response?.message || "Unique constraint resolved successfully";
        }

        toast.success(successMessage);
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries(["validationErrorList"]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error in action:", error);
      let errorMessage;
      if (dialog.type === "discardAll") {
        errorMessage = "Failed to discard all rows";
      } else if (dialog.type === "discard") {
        errorMessage = "Failed to discard row";
      } else if (dialog.type === "unique") {
        errorMessage = "Failed to resolve unique constraint";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 400,
        }}
      >
        Validation Errors{" "}
      </Typography>
      <Card
        sx={{
          borderRadius: "8px",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              placeholder="Search ..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Import
              </Button> */}
              <Button
                variant="contained"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenDiscardAllDialog}
                sx={{
                  borderRadius: "8px",
                }}
              >
                Discard All & Submit
              </Button>
            </Box>
          </Box>
          <ValidationErrorsDataTable
            rows={validationErrorWithIds}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            rowCount={validationErrorList?.data?.totalCount || 0}
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Discard Actions */}
      <ConfirmationDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={
          dialog.type === "discardAll" ? "Confirm Action" : "Confirm Discard"
        }
        content={
          dialog.type === "discardAll"
            ? "Are you sure want to finalize action preview data?"
            : dialog.type === "resolveRow"
              ? "Are you sure you want to resolve this?"
              : `Are you sure you want to discard row ${dialog.rowData?.rowNumber}?`
        }
        // confirmText={dialog.type === "discardAll" ? "Confirm" : "Discard"}
        confirmText={
          dialog.type === "discardAll"
            ? "Confirm"
            : dialog.type === "resolveRow"
              ? "Yes"
              : "Discard"
        }
        confirmButtonColor="error"
        isSubmitting={isSubmitting}
      />

      {/* Action Modal for Edit/Take Action */}
      <ValidationErrorModal
        openModal={actionModalOpen}
        rowData={selectedRow}
        currentDataSource={currentDataSource}
        handleCloseModal={handleCloseActionModal}
        attributeListData={attributeList?.data?.data || []}
        refreshData={() => {
          queryClient.invalidateQueries(["validationErrorList"]);
        }}
      />
    </Box>
  );
}
