export interface User {
  _id: string;
  organizationId?: string;
  email: string;
  roleIds: string[];
  firstName: string;
  lastName?: string;
  mobile?: number;
  isVerified: boolean;
  status: 'active' | 'inactive';
  organizationProductSubscriptionIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRole {
  _id: string;
  name: string;
  description?: string;
}

export interface Organization {
  _id: string;
  name: string;
  description?: string;
}

export interface OrganizationProductSubscription {
  _id: string;
  name: string;
  description?: string;
}

export interface UserWithRelations extends User {
  roles?: UserRole[];
  organization?: Organization;
  organizationProductSubscriptions?: OrganizationProductSubscription[];
}

export interface UsersResponse {
  success: boolean;
  data: UserWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  success: boolean;
  data: UserWithRelations;
} 