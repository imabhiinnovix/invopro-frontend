export interface Permission {
  _id: string;
  name: string;
  resourceType: string;
  status: "active" | "inactive";
  dataSourceId: { _id: string; name: string } | null;
  method: string;
  methodName?: string; // Optional field for method name
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
  code?: string; 
  methodName?: string; 
}

export interface DataSource {
  _id: string;
  name: string;
  code?: string;
}



export interface PermissionDetail {
  _id: string;
  name: string;
  method: string;
  resourceId: string;
  dataSourceId?: string;
  resourceType: string;
  resourceCode?: string;
  status: string;
  isSuperUser: boolean;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface RoleDetail {
  _id: string;
  permissionId: PermissionDetail;
  roleId: string;
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
export interface Role {
  _id: string;
  organizationId: string;
  name: string;
  status: string;
  permissions?: string[];
}
export interface RoleDetailResponse {
  success: boolean;
  data: RoleDetail[];
  totalCount: number;
}
export interface RolePostPayload {
  name: string;
  organizationId?: string;
  status?: string;
  permissionIds: string[];
}
 export interface RolePostResponse {
  success: boolean;
  data: Role;
}
export interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  rowData?: string;

  mode: "add" | "edit" | "view" | "filter" | null;
  editRoleId: string | null;
  filterValues: {
    name: string;
    organizationId: string;
    status: string;
  };
  onFilterApply: (values: {
    name: string;
    organizationId: string;
    status: string;
  }) => void;
  onFilterReset: () => void;
  onRoleCreated: () => void;
  onRoleUpdated: () => void;
}