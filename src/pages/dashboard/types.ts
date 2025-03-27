export interface Dashboard {
  _id: string;
  createdBy: string;
  organizationId: string;
  name: string;
  description: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DashboardListResponse {
  success: boolean;
  message: string;
  data: Dashboard[];
  totalCount: number;
}

export interface DashboardState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
} 