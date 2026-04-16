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
import { ErrorsDataTable } from "./ErrorsDataTable";
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
import { Tabs, Tab } from "@mui/material";
import NoErrorLogs from "./NoErrorLogs";
import ErrorLogs from "./ErrorLogs";
import { AuthContext } from "../../context/AuthContext";

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
    type: "discardAll" | "discardRow" | "resolveRow" | "discardSelectedRow" | "submitAll" | "discardUpload";
    rowData?: any;
    selectedRows?: any[];
  }>({ open: false, type: "discardAll" });
  const [activeTab, setActiveTab] = useState<"error" | "noError">("error");

  const [showBreakup, setShowBreakup] = useState(false);

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
  let vendorId = "";
  if (dataSourceIdForPayload && dataSourceIdForPayload?._id) {
    isLatest = true;
    vendorId = dataSourceIdForPayload.dataSourceVersion.vendorId;
  } else {
    dataSourceIdForPayload = commonDataSourceList?.find(
      (item: any) =>
        Array.isArray(item?.allDataSourceVersions) &&
        item.allDataSourceVersions.some((v: any) => v._id === id),
    );
    if (dataSourceIdForPayload) {
    const version = dataSourceIdForPayload.allDataSourceVersions.find(
      (v: any) => v._id === id
    );
    vendorId = version?.vendorId || "";
  }
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

  const ErrorList = useGet<any>(
  ["ErrorList",  dataSourceIdForPayload?._id || id || "", String(paginationModel.page + 1),
      String(paginationModel.pageSize)],
  id
    ? `${GET.NO_ERROR_ROW_DATA}?page=${
            paginationModel.page + 1
          }&limit=${
            paginationModel.pageSize
          }&dataSourceVersionId=${id}&dataSourceId=${
            dataSourceIdForPayload?._id || ""
          }&isSummary=true&segregationField=Charge type (SABIC Cost code Type)`
    : "",
  !!id
);

console.log('ErrorList',ErrorList);

 const { userDetails } = React.useContext(AuthContext);

const defaultCurrency = userDetails?.data.organizationId?.defaultCurrency;

const summaryTotal = ErrorList?.data?.total || {};

const summaryCurrency = summaryTotal?.['currencies']?.[0] || 'USD';

const conversionRate = summaryTotal?.['conversion']?.['rate'] || 1;

const totalAmount =
  (summaryTotal["Service Fees"] || 0) +
  (summaryTotal["Official Fees"] || 0);

const totalAmountConverted =
  (summaryTotal["Converted|Service Fees"] || 0) +
  (summaryTotal["Converted|Official Fees"] || 0);

const groupedRows = ErrorList?.data?.data || [];

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
    // ✅ special condition
    if (rowData.dataSourceId === "699f04727df5e0efe12d5027") {
      const newTabUrl = `/reference-invoice?errorId=${rowData._id}&rowNumber=${rowData.rowNumber}&dataSourceVersionId=${rowData.dataSourceVersionId}&dataSourceId=${rowData.dataSourceId}${
        vendorId ? `&vendorId=${vendorId}&isErrorLog=${rowData.isErrorLog > 0 ? 1 : 0}&page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}` : ""
      }`;

      window.open(newTabUrl, "_blank");
      return;
    }

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

      // if (dialog.type === "discardAll") {
      //   const payload = isReportRequest
      //     ? {
      //         action: "discardAllSubmit",
      //         reportRequestId: id,
      //       }
      //     : {
      //         action: "discardAllSubmit",
      //         dataSourceVersionId: id,
      //         dataSourceId: dataSourceId,
      //       };
      //   response = await discardAllSubmit.mutateAsync({
      //     url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
      //     payload,
      //   });
      // } 
      if (dialog.type === "submitAll") {
        const payload = isReportRequest
          ? {
              action: "submit",
              reportRequestId: id,
            }
          : {
              action: "submit",
              dataSourceVersionId: id,
              dataSourceId: dataSourceId,
            };

        response = await discardAllSubmit.mutateAsync({
          url: `${POST.RESOLVE_DATA_IMPORT_ERROR}`,
          payload,
        });
      }else if (dialog.type === "discardUpload") {
        const payload = isReportRequest
          ? {
              action: "discardedUpload", // ✅ new action
              reportRequestId: id,
            }
          : {
              action: "discardedUpload",
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
        if (dialog.type === "discardAll" || dialog.type === "submitAll" || dialog.type === "discardUpload") {
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

  const isSubmitEnabled =
  validationErrorList?.data?.totalActionCount ===
  validationErrorList?.data?.totalCount;

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
      <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: STYLE_GUIDE.SPACING.s3,
  }}
>
  {/* Left side: Back + Heading */}
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <Button
      variant="text"
      onClick={() => navigate(-1)}
      sx={{ padding: 0, minWidth: "auto", marginRight: "10px" }}
      // disabled={isLatest === false}
    >
      <ArrowBackIcon />
    </Button>

    <Typography
      variant="h4"
      sx={{
        fontWeight: STYLE_GUIDE.TYPOGRAPHY.fontWeight.regular,
        fontSize: STYLE_GUIDE.TYPOGRAPHY.fontSize.xxl,
        color: STYLE_GUIDE.COLORS.primaryDark || "#3f51b5",
        lineHeight: STYLE_GUIDE.TYPOGRAPHY.lineHeight.normal,
      }}
    >
      Validation Errors
    </Typography>
  </Box>

  {/* Right side: Reference Invoice Button */}
  {/* <Button
  variant="outlined"
  component="a"
  href={`/reference-invoice${vendorId ? `?vendorId=${vendorId}` : ""}`}
  target="_blank"
  rel="noopener noreferrer"
  sx={{ borderRadius: "8px" }}
>
  Reference Invoice Files
</Button> */}
</Box>
<Box
  sx={{
    display: "flex", // ✅ FIXED
    alignItems: "center",
    gap: 1.2,
    px: 1.2,
    py: 0.4,
    borderRadius: "10px",
    fontSize: "11.5px",
    backgroundColor: "#fafafa",
    width: "100%", // ✅ IMPORTANT
  }}
>
  {/* LEFT SIDE */}
  <span>
    Uploaded:{" "}
    <Box component="span" sx={{ color: "#1976d2", fontWeight: 500 }}>
      {validationErrorList?.data?.totalUploadedRecords}
    </Box>
  </span>

  <span>•</span>

  <span>
    Errors:{" "}
    <Box component="span" sx={{ color: "#d32f2f", fontWeight: 500 }}>
      {validationErrorList?.data?.totalErrorRecords}
    </Box>
  </span>

  <span>•</span>

  <span>
    Resolved:{" "}
    <Box component="span" sx={{ color: "#2e7d32", fontWeight: 500 }}>
      {validationErrorList?.data?.totalResolvedRecords}
    </Box>
  </span>

  {/* RIGHT SIDE */}
  <Box sx={{ ml: "auto", textAlign: "right" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography sx={{ fontSize: "12px" }}>
        <b>Total Amount:</b>{" "}
        {summaryCurrency === defaultCurrency ? (
          `${totalAmount.toLocaleString()} (${summaryCurrency})`
        ) : (
          `${totalAmount.toLocaleString()} (${summaryCurrency}) | ${totalAmountConverted.toLocaleString()} (${defaultCurrency}) | (Conversion Rate: ${conversionRate})`
        )}
      </Typography>

      <Button
        size="small"
        onClick={() => setShowBreakup((prev) => !prev)}
        sx={{
          minWidth: "28px",
          height: "28px",
          borderRadius: "50%",
          padding: 0,
        }}
      >
        {showBreakup ? "−" : "+"}
      </Button>
    </Box>
  </Box>
</Box>

{/* BREAKUP BELOW (unchanged) */}
{showBreakup && (
  <Box
    sx={{
      mt: 1,
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      backgroundColor: "#fff",
      overflow: "hidden",
      minWidth: "320px",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        px: 1.2,
        py: 0.6,
        backgroundColor: "#f5f5f5",
        fontSize: "11.5px",
        fontWeight: 600,
      }}
    >
      <span>Charge Type</span>
      <span>Amount</span>
    </Box>

    {/* Rows */}
    {groupedRows.map((item: any, idx: number) => {
      const row = item?.rowData || {};

      const chargeType =
        row["Charge type (SABIC Cost code Type)"] || "Unknown";

      const total =
        (row["Service Fees"] || 0) +
        (row["Official Fees"] || 0);

      const totalConverted =
        (row["Converted|Service Fees"] || 0) +
        (row["Converted|Official Fees"] || 0);

      const rowCurrency = row["Currency"] || summaryCurrency;
      const isSameCurrency = rowCurrency === defaultCurrency;

      return (
        <Box
          key={idx}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 1.2,
            py: 0.6,
            fontSize: "11.5px",
            borderTop: idx === 0 ? "none" : "1px solid #eee",
          }}
        >
          {/* Charge Type */}
          <span style={{ fontWeight: 500 }}>
            {chargeType}
          </span>

          {/* Amount */}
          <span style={{ textAlign: "right" }}>
            {isSameCurrency ? (
              `${total.toLocaleString()} (${rowCurrency})`
            ) : (
              <>
                {total.toLocaleString()} ({rowCurrency}) <br />
                <span style={{ color: "#666", fontSize: "10.5px" }}>
                  {totalConverted.toLocaleString()} ({defaultCurrency})
                </span>
              </>
            )}
          </span>
        </Box>
      );
    })}
  </Box>
)}
<Box sx={{ mb: 2 }}>
  <Tabs
    value={activeTab}
    onChange={(_, newValue) => {
      setActiveTab(newValue);
      setPaginationModel({ page: 0, pageSize: 10 });
      setSearchValue("");
    }}
  >
    <Tab label="Errors" value="error" />
    <Tab label="Resolved" value="noError" />
  </Tabs>
</Box>
{activeTab === "error" ? (
  <Card>
    <CardContent>
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
              {/* <Button
                variant="contained"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenDiscardAllDialog}
                sx={{
                  borderRadius: "8px",
                }}
                disabled={isLatest === false}
              >
                Discard All & Submit
              </Button> */}

              <Button
              variant="contained"
              color="error"
              onClick={() => setDialog({ open: true, type: "discardUpload" })}
              sx={{ borderRadius: "8px" }}
              // disabled={isLatest === false}
            >
              Discard Upload
            </Button>

              <Button
                variant="contained"
                onClick={() => setDialog({ open: true, type: "submitAll" })}
                sx={{
                  borderRadius: "8px",
                }}
                // disabled={isLatest === false || !isSubmitEnabled}
                disabled={!isSubmitEnabled}
              >
                Submit
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
          

          {/* <ValidationErrorsDataTable
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
          /> */}
          <ErrorLogs
            id={id}
            dataSourceId = {dataSourceIdForPayload?._id}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            debouncedSearchValue={debouncedSearchValue}
            handleEditRow={handleEditRow} // reuse same logic
          />
        </CardContent>
      </Card>
       </CardContent>
  </Card>
) : (
    <NoErrorLogs
      id={id}
      dataSourceId = {dataSourceIdForPayload?._id}
      paginationModel={paginationModel}
      setPaginationModel={setPaginationModel}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      debouncedSearchValue={debouncedSearchValue}
      handleEditRow={handleEditRow} // reuse same logic
    />
  )}

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
          dialog.type === "submitAll"
            ? "Confirm Submit"
             : dialog.type === "discardUpload"
              ? "Confirm Discard Upload"
            :dialog.type === "discardAll" ? "Confirm Action" : "Confirm Discard"
        }
        content={
          dialog.type === "submitAll"
            ? "Are you sure you want to submit all data?"
            : dialog.type === "discardUpload"
            ? "Are you sure you want to discard the entire upload?"
            : dialog.type === "discardAll"
            ? "Are you sure want to Discard all data?"
            : dialog.type === "resolveRow"
              ? "Are you sure you want to resolve this?"
              : dialog.type === "discardSelectedRow"
                ? `Are you sure you want to discard ${dialog.selectedRows.length} selected row(s)?`
                : `Are you sure you want to discard "${dialog.rowData?.fileName}" at row ${dialog.rowData?.fileRowNumber}?`
        }
        confirmText={
          dialog.type === "submitAll"
          ? "Submit"
          : dialog.type === "discardUpload"
          ? "Discard Upload"
          : dialog.type === "discardAll"
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
