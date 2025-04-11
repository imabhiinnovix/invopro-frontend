export interface Theme {
  _id: string;
  name: string;
  createdBy: string;
  organizationId: string;
  title: {
    display: boolean;
    color: string;
    font: {
      size: number;
      family: string;
      weight?: string;
    };
    align: string;
    position: string;
  };
  subtitle: {
    display: boolean;
    color: string;
    font: {
      size: number;
      family: string;
    };
    align: string;
    position: string;
  };
  legend: {
    display: boolean;
    position: string;
    labels: {
      font: {
        size: number;
        family: string;
      };
      color: string;
      usePointStyle: boolean;
      padding: number;
      boxWidth: number;
      boxHeight: number;
    };
    maxHeight: number;
  };
  tooltip: {
    display: boolean;
    backgroundColor: string;
    titleColor: string;
    borderColor: string;
    borderWidth: number;
    padding: number;
    usePointStyle: boolean;
    displayColors: boolean;
  };
  scales: {
    y: {
      grid: {
        color: string;
        drawBorder: boolean;
        display: boolean;
      };
      ticks: {
        padding: number;
        maxRotation: number;
        minRotation: number;
      };
      display: boolean;
      beginAtZero: boolean;
      title: {
        display: boolean;
        color: string;
        font: {
          size: number;
        };
      };
      offset: boolean;
    };
    x: {
      grid: {
        drawBorder: boolean;
        display: boolean;
      };
      ticks: {
        color: string;
        padding: number;
        maxRotation: number;
        minRotation: number;
      };
      display: boolean;
      beginAtZero: boolean;
      offset: boolean;
    };
  };
  interaction: {
    display: boolean;
    mode: string;
    intersect: boolean;
  };
  layout: {
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    display: boolean;
  };
  fill: {
    enabled: boolean;
    type: string;
    color: string;
    opacity: number;
  };
  responsive: boolean;
  maintainAspectRatio: boolean;
  chartType: string;
  colors: string[];
  borderColor: string[];
  backgroundColor: string[];
  isDefault: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ThemeListResponse {
  success: boolean;
  message: string;
  data: Theme[];
  totalCount: number;
} 