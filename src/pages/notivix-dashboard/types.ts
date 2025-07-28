export type {
  ChartResponse,
  Dashboard,
  WidgetDetails,
  DataSourceDetails,
  ChartData,
  TemporaryChart,
  WidgetType,
  DataSource,
  DashboardFilters,
  FetchChartDataPayload
} from '../dashboard/types';

export interface NotivixChartDataItem {
  name: string;
  data: number;
}

export interface NotivixWidgetData {
  label: string;
  widgetData: NotivixChartDataItem[];
  totalCount: number;
}

export interface NotivixChartResponse {
  success: boolean;
  message: string;
  data: NotivixWidgetData;
} 