export interface Role {
  _id: string;
  organizationId: string;
  name: string;
  isSuperUser: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OrganizationProductSubscription {
  _id: string;
  organizationId: string;
  productId: {
    _id: string;
    name: string;
  };
  status: string;
  totalLicenses: number;
  licenseExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  _id: string;
  organizationId: string;
  email: string;
  roleIds: Role[];
  firstName: string;
  lastName: string;
  mobile: string;
  isVerified: boolean;
  status: string;
  organizationProductSubscriptionIds: OrganizationProductSubscription[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  departmentId?: string;
  designationId?: string;
  businessUnit?: string[];
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
  totalCount: number;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationId?: string;
  roleIds: string[];
  mobile?: string;
  organizationProductSubscriptionIds: string[];
  departmentId?: string;
  businessUnit: string[];
  designationId?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface RoleListResponse {
  success: boolean;
  message: string;
  data: Role[];
  totalCount: number;
}

export interface ProductSubscriptionListResponse {
  success: boolean;
  message: string;
  data: OrganizationProductSubscription[];
  totalCount: number;
}
