export interface Permission {
  _id: string;
  name: string;
  resourceType: string;
  status: "active" | "inactive";
  dataSourceId: { _id: string; name: string } | null;
  method: string;
  organizationId: string;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse {
  success: boolean;
  data: Permission[];
  totalCount: number;
}

export interface PermissionPostResponse {
  success: boolean;
  data: any;
}

export interface PermissionPostPayload {
  name: string;
  method: string;
  dataSourceId: string;
  resourceType?: string;
}

export interface DataSource {
  _id: string;
  name: string;
}
