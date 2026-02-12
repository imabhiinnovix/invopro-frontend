export interface Dashboard {
  _id: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  organizationId: string;
  name: string;
  description: string;
  isDeleted: boolean;
  isDefaultNotivix?: boolean;
  isActive: boolean;
  settings: {
    gridColumns: number;
    dashboardType: string;
    columnsGrid: number;
    dynamicVersionValue: string;
    endVersionValue: string;
    startVersionValue: string;
    versionValue: string;
    dataSource: any;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  widgetThemeId?: string;
}

export interface DashboardListResponse {
  success: boolean;
  message: string;
  data: Dashboard;
  totalCount: number;
}

export interface DashboardState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
}

export interface FieldConfig {
  fieldName: string;
  display: boolean;
  required: boolean;
  multiple: boolean;
  type: "text" | "select" | "multiselect" | "number" | "checkbox" | "date";
  label: string;
  defaultValue: any;
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
  fieldConfig?: FieldConfig[];
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

export interface ChartData {
  name: string;
  data: number;
  [key: string]: string | number;
}

export interface TemporaryChart {
  _id: string;
  createdBy: string;
  dashboardId: string;
  organizationId: string;
  name: string;
  position: {
    x: number;
    y: number;
    index: number;
  };
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
  __v?: number;
  widgetTypeId?: WidgetDetails;
  dataSourceId?: DataSourceDetails;
  data?: ChartData[];
  userQuery?: string;
  isIncremental?: boolean;
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
  temporaryCharts: TemporaryChart[];
  chartsLoading: boolean;
  chartsError: string | null;
  widgetData: Record<string, WidgetResponse["data"]>;
}

export interface WidgetDetails {
  _id: string;
  name?: string;
  description?: string;
  chartType: string;
  code?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  dashboardId?: string;
  organizationId: string;
  name: string;
  description?: string;
  position?: {
    x: number;
    y: number;
    index: number;
  };
  dimensions: string[];
  groupBy: string[];
  plotType: string[];
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
  __v?: number;
  widgetTypeId?: WidgetDetails;
  dataSourceId?: DataSourceDetails;
  data?: ChartData[];
  userQuery?: string;
  isIncremental?: boolean;
}

export interface ChartDataResponse {
  success: boolean;
  message: string;
  data: ChartResponse[];
  totalCount: number;
}

export interface WidgetResponse {
  success: boolean;
  message: string;
  data: {
    position: {
      x: number;
      y: number;
      index: number;
    };
    aggregation: {
      type: string;
      attributeName: string;
    };
    _id: string;
    createdBy: string;
    dashboardId: string;
    organizationId: string;
    widgetTypeId: WidgetDetails | string;
    name: string;
    dataSourceId: DataSourceDetails;
    dimensions: string[];
    groupBy: string[];
    plotType: string[];
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
    data: {
      label: string;
      widgetData: ChartData[];
      totalCount: number;
    };
    chartType?: string;
  };
}

export interface DashboardFilters {
  startVersionValue: string;
  endVersionValue: string;
  dynamicVersionValue: string;
  versionValue: string;
}

export interface WidgetDataResponse {
  success: boolean;
  message: string;
  data: {
    label: string;
    totalCount: string;
    widgetData: { name: string; Estimates: number; data: number }[];
  };
}

export interface CombinedWidgetData {
  _id: string;
  createdBy: string;
  dashboardId?: string;
  organizationId: string;
  name: string;
  position?: {
    x: number;
    y: number;
    index: number;
  };
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
  __v?: number;
  widgetTypeId?: WidgetDetails;
  dataSourceId?: DataSourceDetails;
  data: {
    label: string;
    widgetData: Array<{
      name: string;
      data: number;
      [key: string]: string | number;
    }>;
  };
}

export interface Operator {
  _id: string;
  operatorKey: string;
  operatorName: string;
  valueRequired: boolean;
  order: number;
}

export interface OperatorType {
  _id: string;
  fieldType: string;
  operators: Operator[];
}

export interface OperatorListResponse {
  success: boolean;
  message: string;
  data: OperatorType[];
  totalCount: number;
}

export interface FetchChartDataPayload {
  dashboardId: string;
  versionValue?: string;
  dynamicVersionValue?: string;
  startDate?: string;
  endDate?: string;
  startVersionValue?: string;
  endVersionValue?: string;
  dashboardType?: string;
}

export interface ChartGridProps {
  dashboardId: string;
  isEditMode: boolean;
  onEditChart: (chart: ChartResponse | null, options?: { numberChartColor?: string }) => void;
  isAddChartModalOpen: boolean;
  isEditChartModalOpen: boolean;
  gridColumns: number;
  currentDashboard?: Dashboard;
  startVersionValue?: string;
  endVersionValue?: string;
  versionValue?: string;
  isTrend?: boolean;
  isNaturalLangauage?: boolean;
  dashboardFilters: any;
  isDefaultNotivix?: boolean;
  onRegisterChartPreview?: (render: (chart: ChartResponse | null) => React.ReactNode) => void;
}

export interface ChartDataItem {
  name: string;
  data: number;
  [key: string]: string | number;
}

export type DrillDownPayload = {
  dataSourceId?: string;
  entityId?: string;
  conditions?: Record<string, unknown>[];
  dimensions?: Record<string, unknown>[];
  groupBy?: Record<string, unknown>[];
  plotType?: Record<string, unknown>[];
  page?: number;
  limit?: number;
};
