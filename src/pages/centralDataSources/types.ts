export type FileStatus = "validated" | "ready" | "processing" | "failed";

export interface CentralFile {
  _id: string;
  filename: string;
  addedDate: string;
  fileSize: string;
  uploadedBy: string;
  status: FileStatus;
  year: number;
  month: string;
  week?: string;
}

export interface MonthGroup {
  month: string;
  totalFiles: number;
  files: CentralFile[];
}

export interface YearGroup {
  year: number;
  months: MonthGroup[];
}

export interface FolderSummaryMonthItem {
  month: number;
  totalFiles: number;
}

export interface FolderSummaryYearItem {
  year: number;
  totalMonths: number;
  months: FolderSummaryMonthItem[];
}

export interface FolderSummaryResponse {
  success: boolean;
  data: FolderSummaryYearItem[];
}

export interface CentralFileApiItem {
  _id: string;
  organizationId: string;
  reportId: string;
  year: number;
  month: number;
  week: string | null;
  folderType: string;
  sheetName: string;
  originalFileName: string;
  storedFileName: string;
  version: number;
  isLatest: boolean;
  filePath: string;
  fileType: string;
  fileSize: number;
  validationStatus: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  dataSourceId?: string;
  entityId?: string;
  mapping?: Record<string, string>;
  separator?: string | null;
}

export interface CentralFilesListResponse {
  success: boolean;
  data: CentralFileApiItem[];
  totalCount: number;
}

export interface TabConfig {
  tabName: string;
  key: string;
}

export interface ValidatedRowsResponse {
  success: boolean;
  data: Record<string, any>[];
  totalCount: number;
  page: number;
  limit: number;
}

export const DATA_SOURCE_TABS: TabConfig[] = [
  { tabName: "Monthly IP", key: "monthly_ip" },
  { tabName: "Supplemental IP", key: "supplemental_ip" },
  { tabName: "Notifications", key: "notifications" },
  { tabName: "Misc", key: "misc" },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
