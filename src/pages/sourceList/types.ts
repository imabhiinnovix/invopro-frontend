export type SourcePreference = "primary" | "secondary" | "hide";

export interface DataSourceItem {
  _id: string;
  name: string;
  code?: string;
  versionType?: string;
  description?: string;
}

export interface DataSourceListResponse {
  success: boolean;
  data: DataSourceItem[];
  totalCount?: number;
}
