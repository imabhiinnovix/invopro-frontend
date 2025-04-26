export interface CustomReportRequestPayload {
  customReportId: string;
  versionValue: string;
}

export interface CustomReportRequestResponse {
  success: string;
  message: string;
}

export interface ReportRequestResponse {
  _id: string;
  customReportId: { _id: string; reportName: string };
  versionValue: string;
  status: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  dataSourceVersion?: {
    sheetName: string;
    sheetCode: string;
    tabName: string;
    mappingFuctionName: string;
    designCode: string;
    dataSourceVersionId: string;
    versionCode: string;
    dataSourceId: string;
  }[];
}
