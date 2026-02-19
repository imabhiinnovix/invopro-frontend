import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import GenerateReport from "../../components/atom/report/generateReport";
import { useEffect, useRef, useState } from "react";
import ReportRequestTable from "../../components/atom/report/reportRequestTable";
import ViewReport from "../../components/atom/report/viewReport";
import type { ReportRequestResponse } from "../../components/atom/report/types";
import { DateTime } from "luxon";
import html2pdf from "html2pdf.js";
import ReportSelection from "../../components/atom/report/changeReportFromViewReport";
import {
  PictureAsPdfOutlined,
  SimCardDownloadOutlined,
  FileDownloadOutlined,
} from "@mui/icons-material";
import ScrollableTabNavigation from "../../components/atom/report/scrollableTab";
import { GET } from "../../services/apiRoutes";
import { useUnifiedTheme } from "../../hooks/useUnifiedTheme";
import useFileDownload from "../../hooks/useFiledownload";
import { ActionIconButton, PageCardLayout, PageHeader } from "../../components/common";
import { STYLE_GUIDE } from "../../styles";
import { useSelector } from "react-redux";
import { PermissionsMap } from "../../utils/constants";
import { checkPermission } from "../../utils/utils";

export default function Report() {
  const theme = useUnifiedTheme();
  const [reload, setReload] = useState(false);
  const [viewReportRequestId, setViewReportRequestId] = useState("");

  const [maxHeight, setMaxHeight] = useState<number>(0);

  const headerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const [allDetailData, setAllDetailData] =
    useState<ReportRequestResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [downloadFileName, setDownLoadFileName] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [intermediateDownloadRequestId, setIntermediateDownloadRequestId] =
    useState("");
  const [regularDownloadRequestId, setRegularDownloadRequestId] = useState("");
  const [viewReportNameWithVersionValue, setViewReportNameWithVersionValue] =
    useState("");

  const permissions = useSelector(
    (state: RootState) => state.userPermission.permissions,
  );
  const shouldAllowGenerateReport = checkPermission(
    permissions,
    PermissionsMap.CUSTOM_REPORT,
    "generate",
  );
  const shouldAllowDownload = checkPermission(
    permissions,
    PermissionsMap.CUSTOM_REPORT,
    "download",
  );
  const shouldAllowIntermediateDownload = checkPermission(
    permissions,
    PermissionsMap.CUSTOM_REPORT,
    "download_supplemental_intermediate",
  );

  const exportFile = useFileDownload<Blob>((data) => {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = downloadFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setIntermediateDownloadRequestId("");
    setRegularDownloadRequestId("");
  });

  const downloadFile = (fileName: string, fileId: string) => {
    setRegularDownloadRequestId(fileId);
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/download/${fileId}`,
    });
  };

  const intermediateDownloadFile = (fileName: string, fileId: string) => {
    setIntermediateDownloadRequestId(fileId);
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/download/${fileId}?isIntermediate=true`,
    });
  };
  const intermediateSupplementalDownloadFile = (
    fileName: string,
    // fileId: string,
    row: any,
  ) => {
    // setIntermediateDownloadRequestId(fileId);
    setDownLoadFileName(fileName);
    exportFile.mutate({
      url: `${GET?.Custom_Report}/downloadSupplementalIntermediate/${row.customReportId?._id}?versionValue=${row.versionValue}`,
    });
  };

  useEffect(() => {
    if (headerRef.current && tabRef.current && window.innerHeight) {
      const headerHeight = headerRef.current?.clientHeight || 0;
      const tabHeight = tabRef.current?.clientHeight || 0;
      const total = headerHeight + tabHeight;
      const leftHeight = window.innerHeight
        ? window.innerHeight
        : 0 - total - 30;
      if (leftHeight > 0) {
        setMaxHeight(leftHeight);
      }
    }
  }, [headerRef.current, tabRef.current, window.innerHeight]);

  const handleDownloadPdf = () => {
    if (!targetRef.current || !viewReportNameWithVersionValue) return;
    setIsPdfLoading(true);

    setTimeout(() => {
      setIsPdfLoading(false);
    }, 500);
    const opt = {
      margin: 0.5,
      filename: `${viewReportNameWithVersionValue}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };

    html2pdf().set(opt).from(targetRef.current.innerHTML).save();
  };

  return (
    <Box
      sx={{
        p: 0,
      }}
    >
      <Box ref={headerRef}>
        {viewReportRequestId && viewReportRequestId.length > 0 ? (
          <>
            <PageHeader
              title={allDetailData?.customReportId?.reportName || "Report View"}
              subtext={`Period: ${
                allDetailData?.versionValue
                  ? DateTime.fromFormat(
                      allDetailData.versionValue,
                      "yyyy-MM",
                    ).toFormat("LLLL yyyy")
                  : "-"
              } | Created by ${
                `${allDetailData?.createdBy?.firstName || ""}${
                  allDetailData?.createdBy?.lastName
                    ? " " + allDetailData.createdBy.lastName
                    : ""
                }`.trim() || "-"
              } on ${
                allDetailData?.createdAt
                  ? DateTime.fromISO(allDetailData.createdAt).toFormat(
                      "dd LLL yyyy hh:mm a",
                    )
                  : "-"
              }`}
              onBack={() => setViewReportRequestId("")}
              action={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {isPdfLoading ? (
                    <Box
                      sx={{
                        width: 27,
                        height: 27,
                        borderRadius: "50%",
                        border: "3px solid #f3f3f3",
                        borderTop: "3px solid #3498db",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  ) : (
                    <Tooltip title="Download PDF" arrow>
                      <ActionIconButton
                        disabled={
                          !(
                            viewReportNameWithVersionValue &&
                            viewReportNameWithVersionValue.length > 0
                          )
                        }
                        onClick={handleDownloadPdf}
                      >
                        <PictureAsPdfOutlined />
                      </ActionIconButton>
                    </Tooltip>
                  )}
                  {allDetailData &&
                    allDetailData.status === "completed" &&
                    allDetailData.customReportId?.reportName ===
                      "Supplemental IP" && (
                      <Tooltip title="Intermediate Download" arrow>
                        <ActionIconButton
                          onClick={() => {
                            intermediateSupplementalDownloadFile(
                              `${allDetailData.customReportId?.reportName}-intermediate-${allDetailData.versionValue}.xlsx`,
                              allDetailData,
                            );
                          }}
                        >
                          <FileDownloadOutlined />
                        </ActionIconButton>
                      </Tooltip>
                    )}
                  {allDetailData?.status === "completed" &&
                    allDetailData?.intermediateReportId && (
                      <>
                        {exportFile.isPending &&
                        !!intermediateDownloadRequestId &&
                        intermediateDownloadRequestId === allDetailData._id ? (
                          <Box
                            sx={{
                              width: 27,
                              height: 27,
                              borderRadius: "50%",
                              border: "3px solid #f3f3f3",
                              borderTop: "3px solid #3498db",
                              animation: "spin 1s linear infinite",
                              "@keyframes spin": {
                                "0%": { transform: "rotate(0deg)" },
                                "100%": { transform: "rotate(360deg)" },
                              },
                            }}
                          />
                        ) : (
                          <Tooltip title="Intermediate Download" arrow>
                            <ActionIconButton
                              onClick={() => {
                                intermediateDownloadFile(
                                  `${allDetailData.customReportId?.reportName}-intermediate-${allDetailData.versionValue}.xlsx`,
                                  allDetailData._id,
                                );
                              }}
                            >
                              <FileDownloadOutlined />
                            </ActionIconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  {exportFile.isPending &&
                  !!regularDownloadRequestId &&
                  regularDownloadRequestId === allDetailData?._id ? (
                    <Box
                      sx={{
                        width: 27,
                        height: 27,
                        borderRadius: "50%",
                        border: "3px solid #f3f3f3",
                        borderTop: "3px solid #3498db",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  ) : (
                    <Tooltip title="Download Excel" arrow>
                      <ActionIconButton
                        onClick={() => {
                          downloadFile(
                            `${allDetailData?.customReportId?.reportName}-${allDetailData?.versionValue}.xlsx`,
                            allDetailData?._id || "",
                          );
                        }}
                      >
                        <SimCardDownloadOutlined />
                      </ActionIconButton>
                    </Tooltip>
                  )}
                </Box>
              }
            />
          </>
        ) : (
          <PageHeader
            title="Reports"
            subtext="Create and manage custom reports to analyze your data."
          />
        )}
      </Box>

      {viewReportRequestId && viewReportRequestId.length > 0 ? (
        <PageCardLayout>
          <ReportSelection
            defaultReport={{
              _id: allDetailData?.customReportId?._id || "",
              reportName: allDetailData?.customReportId?.reportName || "",
            }}
            defaultVersion={{
              _id: allDetailData?._id || "",
              versionValue: allDetailData?.versionValue || "",
            }}
            setViewReportRequestId={setViewReportRequestId}
            setAllDetailData={setAllDetailData}
            setViewReportNameWithVersionValue={
              setViewReportNameWithVersionValue
            }
          />
          <Box ref={tabRef}>
            <ScrollableTabNavigation
              tabs={(allDetailData?.dataSourceVersion ?? []).filter(
                (tab) => !tab.isIntermediate,
              )}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            {allDetailData?.dataSourceVersion?.map(
              (item, index) =>
                activeTab === index && (
                  <ViewReport
                    key={index}
                    dataSourceVersionId={item.dataSourceVersionId}
                    versionCode={item.versionCode}
                    mappingFuctionName={item.mappingFuctionName}
                    versionValue={allDetailData.versionValue.split("-")[0]}
                    sheetCode={item.sheetCode}
                    designCode={item.designCode}
                    customReportId={allDetailData.customReportId._id}
                    maxHeight={maxHeight}
                    isView={true}
                  />
                ),
            )}

            {/* Hidden element for PDF generation */}
            <Box
              sx={{
                display: "none",
                marginBottom: 5,
              }}
              ref={targetRef}
            >
              {allDetailData?.dataSourceVersion
                ?.filter((item) => !!item.allowPdfDownload)
                .map((item, index, filteredArray) => (
                  <Box key={index}>
                    {index === 0 && (
                      <Table
                        size="small"
                        sx={{
                          width: "auto",
                          mb: 2,
                          ml: 0,
                          pl: 0,
                        }}
                      >
                        <TableBody>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                borderBottom: "none",
                                pr: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Report Name:
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, borderBottom: "none" }}
                            >
                              {allDetailData?.customReportId?.reportName}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                borderBottom: "none",
                                pr: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Period:
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, borderBottom: "none" }}
                            >
                              {allDetailData?.versionValue}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 600,
                                borderBottom: "none",
                                pr: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Created By:
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 500, borderBottom: "none" }}
                            >
                              {`${allDetailData?.createdBy?.firstName || ""}${
                                allDetailData?.createdBy?.lastName
                                  ? " " + allDetailData.createdBy.lastName
                                  : ""
                              }`}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}

                    <Box>
                      <Box sx={{ display: "flex", mt: 1, mb: 1 }}>
                        <Box sx={{ fontWeight: 600 }}>Sheet Name: </Box>
                        <Box>{item.sheetName}</Box>
                      </Box>
                      <ViewReport
                        key={index}
                        dataSourceVersionId={item.dataSourceVersionId}
                        versionCode={item.versionCode}
                        mappingFuctionName={item.mappingFuctionName}
                        versionValue={allDetailData.versionValue.split("-")[0]}
                        sheetCode={item.sheetCode}
                        designCode={item.designCode}
                        customReportId={allDetailData.customReportId._id}
                      />
                    </Box>

                    {index < filteredArray.length - 1 && (
                      <Box className="html2pdf__page-break" />
                    )}
                  </Box>
                ))}
            </Box>
          </Box>
        </PageCardLayout>
      ) : (
        <Box
          id="reports-list-view"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: STYLE_GUIDE.SPACING.s6,
            backgroundColor: "#ffffff",
            borderRadius: STYLE_GUIDE.SPACING.s3,
            border: 1,
            borderColor: "divider"
          }}
        >
          {shouldAllowGenerateReport && (
            <GenerateReport setReload={setReload} />
          )}

          <Box
            id="report-request-table-container"
            sx={{
              backgroundColor: theme.palette.background.paper,
              overflow: "hidden",
            }}
          >
            <ReportRequestTable
              setReload={setReload}
              reload={reload}
              setViewReportRequestId={setViewReportRequestId}
              setAllDetailData={setAllDetailData}
              setViewReportNameWithVersionValue={
                setViewReportNameWithVersionValue
              }
              shouldAllowDownload={shouldAllowDownload}
              shouldAllowIntermediateDownload={shouldAllowIntermediateDownload}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
