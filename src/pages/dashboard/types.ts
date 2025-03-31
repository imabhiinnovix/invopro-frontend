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

export interface WidgetType {
  _id: string;
  name: string;
  description: string;
  chartType: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface WidgetTypeResponse {
  success: boolean;
  message: string;
  data: WidgetType[];
  totalCount: number;
}

export interface DataSourceAttribute {
  name: string;
  mappingName: string;
  type: string;
  required: boolean;
  validation: Record<string, unknown>[];
  transformations: Record<string, unknown>[];
  optionAttributeId: string;
  cleaner: Record<string, unknown>[];
}

export interface DataSourceEntity {
  _id: string;
  name: string;
  attributes: DataSourceAttribute[];
}

export interface DataSource {
  _id: string;
  organizationId: string;
  entityId: DataSourceEntity;
  name: string;
  description: string;
  code: string;
  versionType: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  canEditInline: boolean;
  uniqueAttributeName: string[];
}

export interface DataSourceResponse {
  success: boolean;
  data: DataSource[];
  totalCount: number;
}

export interface DashboardSliceState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  widgetTypes: WidgetType[];
  dataSources: DataSource[];
  widgetTypesLoading: boolean;
  dataSourcesLoading: boolean;
  widgetTypesError: string | null;
  dataSourcesError: string | null;
  dataSourcesHasMore: boolean;
  dataSourcesPage: number;
  dataSourcesTotalCount: number;
  charts: ChartResponse[];
  chartsLoading: boolean;
  chartsError: string | null;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
  data: number;
}

export interface WidgetDetails {
  _id: string;
  name: string;
  description: string;
  chartType: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DataSourceDetails {
  _id: string;
  organizationId: string;
  entityId: string;
  name: string;
  description: string;
  code: string;
  versionType: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  canEditInline: boolean;
  uniqueAttributeName: string[];
}

export interface ChartResponse {
  _id: string;
  createdBy: string;
  dashboardId: string;
  organizationId: string;
  widgetTypeId: string;
  name: string;
  position: {
    x: number;
    y: number;
    index: number;
  };
  dataSourceId: string;
  dimensions: string[];
  groupBy: string[];
  aggregation: {
    type: string;
    attributeName: string;
  };
  conditions: {
    field: string;
    operator: string;
    value: string;
    _id: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  widgetDetails: WidgetDetails;
  dataSourceDetails: DataSourceDetails;
  data: ChartData[];
}

export interface ChartDataResponse {
  success: boolean;
  message: string;
  data: ChartResponse[];
  totalCount: number;
} 