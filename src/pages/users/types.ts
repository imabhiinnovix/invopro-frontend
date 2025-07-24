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
  productId: string;
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
  isVerified: boolean;
  status: string;
  organizationProductSubscriptionIds: OrganizationProductSubscription[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
  totalCount: number;
} 