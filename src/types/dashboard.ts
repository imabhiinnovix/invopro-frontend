import { FieldSetting } from "./../pages/notivixDashboard/types";
export interface ErrorResponse {
  fieldName: string;
  message: string;
}

export interface CreateWidgetResponse {
  success: boolean;
  message?: string;
  errors?: ErrorResponse[];
  data?: {
    _id: string;
    createdBy: string;
    dashboardId: string;
    organizationId: string;
    widgetTypeId: string;
    name: string;
    dimensions: string;
    groupBy: string;
    aggregation: {
      type: string;
      attributeName: string;
    };
    position: {
      x: number;
      y: number;
      index: number;
    };
    conditions: {
      field: string;
      operator: string;
      value: string;
      _id: string;
    }[];
    dataSourceId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface WidgetDataResponse {
  success: boolean;
  message?: string;
  errors?: ErrorResponse[];
  data?: any;
}

export interface DataSource {
  _id: string;
  name: string;
  fieldSettings: FieldSetting[];
  entityId: {
    _id: string;
    attributes: DataSourceAttribute[];
  };
}

export interface DataSourceAttribute {
  name: string;
  type: string;
}

export interface ChartResponse {
  _id: string;
  name: string;
  description?: string;
  dimensions: string[];
  groupBy: string[];
  aggregation: {
    type: string;
    attributeName: string;
  };
  position: {
    x: number;
    y: number;
    index: number;
  };
  conditions: Condition[];
  dataSourceId: {
    _id: string;
    name: string;
  };
  widgetTypeId: {
    _id: string;
    name: string;
    chartType: string;
  };
  isIncremental: boolean;
  plotType: string[];
}

export interface Operator {
  _id: string;
  operatorKey: string;
  operatorName: string;
  valueRequired: boolean;
}

export interface OperatorType {
  fieldType: string;
  operators: Operator[];
}

export interface OperatorListResponse {
  success: boolean;
  data: OperatorType[];
}

export interface Dashboard {
  settings?: {
    dashboardType?: string;
  };
}

export interface FieldConfig {
  fieldName: string;
  label: string;
  type: string;
  required: boolean;
  multiple: boolean;
  display: boolean;
}

export interface Condition {
  field: string;
  operator: string;
  value: string;
  _id?: string;
}
