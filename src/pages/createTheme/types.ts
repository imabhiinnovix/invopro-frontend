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
      weight: string;
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
 showLegendOverlay?: boolean
}

export interface ThemeListResponse {
  success: boolean;
  message: string;
  data: Theme[];
  totalCount: number;
}

export interface TitleSettings {
  display: boolean;
  color: string;
  font: {
    size: number;
    family: string;
    weight: string;
  };
  align: string;
  position: string;
}

export interface SubtitleSettings {
  display: boolean;
  color: string;
  font: {
    size: number;
    family: string;
    weight: string;
  };
  align: string;
  position: string;
}

export interface ThemeData {
  name: string;
  title: TitleSettings;
  subtitle: SubtitleSettings;
  legend: {
    display: boolean;
    position: string;
    labels: {
      color: string;
      font: {
        size: number;
        family: string;
      };
      padding: number;
      boxWidth: number;
      boxHeight: number;
    };
  };
  tooltip: {
    display: boolean;
    backgroundColor: string;
    titleColor: string;
    borderColor: string;
    borderWidth: number;
    padding: number;
  };
  scales: {
    y: {
      display: boolean;
      beginAtZero: boolean;
      grid: {
        color: string;
        drawBorder: boolean;
      };
      title: {
        display: boolean;
        text: string;
        color: string;
        font: {
          size: number;
        };
      };
    };
    x: {
      display: boolean;
      grid: {
        display: boolean;
      };
      ticks: {
        color: string;
        padding: number;
      };
    };
  };
  interaction: {
    mode: string;
    intersect: boolean;
  };
  layout: {
    padding: {
      top: number;
      bottom: number;
    };
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
  showLegendOverlay: boolean;
}

export interface CreateThemeDialogProps {
  open: boolean;
  onClose: () => void;
  theme?: Theme | null;
}

export interface createThemeResponse {
  success: boolean;
  message: string;
  data: ThemeData;
}
