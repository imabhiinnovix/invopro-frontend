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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { ValidationErrorsDataTable } from "./ValidationErrorsDataTable";
import { ConfirmationDialog } from "../../components/common/deleteConfirmationDialog/ConfirmationDialog";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import { ValidationErrorModal } from "./ValidationErrorModel";
import { AttributeOptionRequestPayload } from "../../components/atom/attributeOption/types";
import { STYLE_GUIDE } from "../../styles";
import axios from "axios";
import axiosInstance from "../../services/axiosInstance";
import { StyledButton } from "../../components/common";
import DialogContainer from "../../components/molecule/dialog";
import IosShareIcon from "@mui/icons-material/IosShare";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ValidationErrors() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [resetSelections, setResetSelections] = useState(false);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "discardAll" | "discardRow" | "resolveRow" | "discardSelectedRow";
    rowData?: any;
    selectedRows?: any[];
  }>({ open: false, type: "discardAll" });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.length === 0) {
        setDebouncedSearchValue("");
      } else if (searchValue.length < 3) {
        toast.warning("Please enter at least 3 characters");
        setDebouncedSearchValue("");
      } else {
        setDebouncedSearchValue(searchValue);
      }
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["validationErrorList"] });
    };
  }, [queryClient]);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [rowDetailData, setRowDetailData] = useState<any>(null);
  const [isLoadingRowDetail, setIsLoadingRowDetail] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExportSuccessDialog, setShowExportSuccessDialog] = useState(false);

  const discardAllSubmit = usePost(["discardAllSubmit"]);
  const discardRow = usePost(["discardRow"], () => {}, true);
  const resolveRow = usePost(["resolveRow"]);

  const attributeList = useGet<{
    success: boolean;
    data: AttributeOptionRequestPayload[];
  }>([`attributeList`], GET?.Attribute_Option_List + `?paginate=false`);

  const commonDataSourceList = useSelector(
    (state: RootState) => state.dataSource?.list,
  );

  let dataSourceIdForPayload = commonDataSourceList?.find(
    (item: any) => item?.dataSourceVersion?._id === id,
  );
  let isLatest = false;
  if (dataSourceIdForPayload && dataSourceIdForPayload?._id) {
    isLatest = true;
  } else {
    dataSourceIdForPayload = commonDataSourceList?.find(
      (item: any) =>
        Array.isArray(item?.allDataSourceVersions) &&
        item.allDataSourceVersions.some((v: any) => v._id === id),
    );
  }

  const { state } = useLocation();
  const isReportRequest = state?.isReportRequest;

  if (isReportRequest) {
    isLatest = true;
  }

  const validationErrorList = useGet<any>(
    [
      "validationErrorList",
      String(paginationModel.page + 1),
      String(paginationModel.pageSize),
      debouncedSearchValue,
      dataSourceIdForPayload?._id || id || "",
    ],
    id
      ? dataSourceIdForPayload?._id
        ? `${GET?.VALIDATION_ERROR_LIST}?page=${
            paginationModel.page + 1
          }&limit=${
            paginationModel.pageSize
          }&dataSourceVersionId=${id}&dataSourceId=${
            dataSourceIdForPayload?._id || ""
          }&search=${encodeURIComponent(debouncedSearchValue || "")}`
        : `${GET?.VALIDATION_ERROR_LIST}?page=${
            paginationModel.page + 1
          }&limit=${paginationModel.pageSize}&reportRequestId=${
            id || ""
          }&search=${encodeURIComponent(debouncedSearchValue || "")}`
      : "",
    !!id,
  );

  const handleDiscardRow = (rowData: any) => {
    setDialog({ open: true, type: "discardRow", rowData });
  };

  const handleResolveRow = (rowData: any) => {
    setDialog({ open: true, type: "resolveRow", rowData });
  };

  const handleDiscardSelectedRows = (selectedRows: any[]) => {
    setDialog({ open: true, type: "discardSelectedRow", selectedRows });
  };

  const handleEditRow = async (rowData: any) => {
    setIsLoadingRowDetail(true);
    setSelectedRow(rowData);

    try {
      // const url = isReportRequest
      //   ? `${GET.ERROR_ROW_DATA}?reportRequestId=${id}&rowNumber=${rowData.rowNumber}&errorId=${rowData._id}`
      //   : `${GET.ERROR_ROW_DATA}?dataSourceVersionId=${rowData.dataSourceVersionId}&dataSourceId=${rowData.dataSourceId}&rowNumber=${rowData.rowNumber}&errorId=${rowData._id}`;
      const url = `${GET.ERROR_ROW_DATA}?dataSourceVersionId=${rowData.dataSourceVersionId}&dataSourceId=${rowData.dataSourceId}&rowNumber=${rowData.rowNumber}&errorId=${rowData._id}`;

      const response = await axiosInstance.get(url);

      if (response.data?.success) {
        setRowDetailData(response.data.data);
        setActionModalOpen(true);
      } else {
        toast.error("Failed to fetch row details");
      }
    } catch (error) {
      console.error("Error fetching row detail:", error);
      toast.error("Failed to fetch row details");
    } finally {
      setIsLoadingRowDetail(false);
    }
  };

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
          handleResolve: handleResolveRow,
        }))
      : [];

  const firstItem =
    validationErrorWithIds.length > 0 ? validationErrorWithIds[0] : null;
  const dataSourceId = firstItem?.dataSourceId || null;

  const currentDataSource = commonDataSourceList?.find(
    (ds) => ds?._id === dataSourceId,
  );

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
    setRowDetailData(null);
  };

  const handleConfirmAction = async () => {
    if (!id || (!dataSourceId && !isReportRequest)) {
      handleCloseDialog();
      return;
    }
    setIsSubmitting(true);
    try {
      let response;

      if (dialog.type === "discardAll") {
        const payload = isReportRequest
          ? {
              action: "discardAllSubmit",
              reportRequestId: id,
            }
          : {
              action: "discardAllSubmit",
              dataSourceVersionId: id,
              dataSourceId: dataSourceId,
            };
        response = await discardAllSubmit.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      } else if (dialog?.type === "discardRow") {
        const payload = isReportRequest
          ? {
              action: "discard",
              reportRequestId: id,
              rowNumber: dialog.rowData._id,
            }
          : {
              action: "discard",
              dataSourceVersionId: id,
              dataSourceId: dialog.rowData.dataSourceId,
              rowNumber: dialog.rowData._id,
            };
        response = await discardRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      } else if (dialog?.type === "resolveRow") {
        const payload = {
          action: "unique",
          dataSourceVersionId: id,
          rowNumber: dialog.rowData._id,
        };
        response = await resolveRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      } else if (dialog?.type === "discardSelectedRow") {
        const payload = isReportRequest
          ? {
              action: "discard",
              reportRequestId: id,
              rowNumber: dialog.selectedRows?.map((row: any) => row._id) || [],
            }
          : {
              action: "discard",
              dataSourceVersionId: id,
              dataSourceId: dialog.selectedRows?.[0]?.dataSourceId,
              rowNumber: dialog.selectedRows?.map((row: any) => row._id) || [],
            };

        response = await discardRow.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
        setResetSelections(true);
      }

      if (response?.success) {
        if (dialog.type === "discardAll") {
          if (response?.data?.dataSourceId) {
            navigate(`/data-source-new/${response?.data?.dataSourceId}`);
          } else {
            navigate(-1);
          }
        }

        queryClient.invalidateQueries(["validationErrorList"]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationErrorListExport = useGet<any>(
    [
      "validationErrorListExport",
      String(paginationModel.page + 1),
      debouncedSearchValue,
      dataSourceIdForPayload?._id || id || "",
    ],
    id
      ? dataSourceIdForPayload?._id
        ? `${GET?.VALIDATION_ERROR_LIST}?page=${
            paginationModel.page + 1
          }&limit=${
            paginationModel.pageSize
          }&dataSourceVersionId=${id}&dataSourceId=${
            dataSourceIdForPayload?._id || ""
          }&search=${encodeURIComponent(
            debouncedSearchValue || "",
          )}&type=export`
        : `${GET?.VALIDATION_ERROR_LIST}?page=${
            paginationModel.page + 1
          }&limit=${paginationModel.pageSize}&reportRequestId=${
            id || ""
          }&search=${encodeURIComponent(
            debouncedSearchValue || "",
          )}&type=export`
      : "",
    false,
  );

  useEffect(() => {
    if (validationErrorListExport.isSuccess) {
      setShowExportSuccessDialog(true);
    }
  }, [validationErrorListExport.isSuccess]);

  const handleDashboardWidgetDataExport = () => {
    validationErrorListExport.refetch();
  };

  return (
    <Box
      id="validation-errors-view"
      sx={{
        flexGrow: 1,
        p: 3,
        ml: { xs: 0 },
        // minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: STYLE_GUIDE.SPACING.s3,
          fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
          fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
          color: STYLE_GUIDE.COLORS.primaryDark || "#3f51b5",
          lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.normal,
        }}
      >
        <Button
          variant="text"
          onClick={() => navigate(-1)}
          sx={{ padding: 0, minWidth: "auto", marginRight: "10px" }}
          disabled={isLatest === false}
        >
          <ArrowBackIcon />
        </Button>
        Validation Errors
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
            <Box
              sx={{
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
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
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenDiscardAllDialog}
                sx={{
                  borderRadius: "8px",
                }}
                disabled={isLatest === false}
              >
                Discard All & Submit
              </Button>

              <StyledButton
                variant="primary"
                onClick={handleDashboardWidgetDataExport}
                icon={<IosShareIcon />}
                disabled={validationErrorListExport.isFetching}
              >
                {validationErrorListExport.isFetching
                  ? "Exporting..."
                  : "Export"}
              </StyledButton>
            </Box>
          </Box>
          <Box sx={{ color: STYLE_GUIDE.COLORS.primary }}>
            Total Records:{validationErrorList?.data?.totalUploadedRecords}
          </Box>

          <ValidationErrorsDataTable
            rows={validationErrorWithIds}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            rowCount={validationErrorList?.data?.totalCount || 0}
            validationErrorList={validationErrorList}
            isLoadingRowDetail={isLoadingRowDetail}
            handleDiscardSelectedRows={handleDiscardSelectedRows}
            resetSelections={resetSelections}
            setResetSelections={setResetSelections}
            isLatest={isLatest}
          />
        </CardContent>
      </Card>

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
                navigate("/jobs");
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

      <ConfirmationDialog
        open={dialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={
          dialog.type === "discardAll" ? "Confirm Action" : "Confirm Discard"
        }
        content={
          dialog.type === "discardAll"
            ? "Are you sure want to Discard all data?"
            : dialog.type === "resolveRow"
              ? "Are you sure you want to resolve this?"
              : dialog.type === "discardSelectedRow"
                ? `Are you sure you want to discard ${dialog.selectedRows.length} selected row(s)?`
                : `Are you sure you want to discard "${dialog.rowData?.fileName}" at row ${dialog.rowData?.fileRowNumber}?`
        }
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

      <ValidationErrorModal
        openModal={actionModalOpen}
        rowData={selectedRow}
        rowDetailData={rowDetailData}
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
