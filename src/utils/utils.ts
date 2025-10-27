import { styled } from "@mui/material";
import { ArcElement, BarElement, Chart as ChartJS, PointElement } from "chart.js";

export function objectToFormData(
  obj: any,
  formData = new FormData(),
  parentKey = ""
) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = obj[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (Array.isArray(value)) {
      // If the value is an array and contains files, append all files with the same key
      value.forEach((item) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(parentKey || key, item);
        } else {
          objectToFormData(item, formData, formKey);
        }
      });
    } else if (
      value &&
      typeof value === "object" &&
      !(value instanceof File) &&
      !(value instanceof Blob)
    ) {
      objectToFormData(value, formData, formKey);
    } else {
      formData.append(formKey, value);
    }
  }
  return formData;
}
export const formatDateUTC = (dateString?: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

    return `${formattedDate} ${formattedTime}`;
  } catch {
    return "-";
  }
};
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Enables AM/PM
      timeZone: "Asia/Kolkata",
    });
    return `${formattedDate} ${formattedTime}`;
  } catch {
    return "-";
  }
};

export const formatDateWithoutTime = (dateString?: string): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return "-";
  }
};

// Helper function to format permission names
export const formatPermissionName = (key: string) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export interface OriginalBackendPermission {
  permissionId: string;
  name: string;
  method: string;
  resourceId: string;
  resourceType: string;
  resourceCode: string;
  allowed: boolean;
  dataSourceId?: string;
  [key: string]: any; // For additional fields
}

export interface NewBackendPermission {
  _id: string;
  name: string;
  method: string;
  resourceId: string;
  resourceType: string;
  resourceCode: string;
  status: string;
  isSuperUser: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type BackendPermission = OriginalBackendPermission | NewBackendPermission;

export interface PermissionMap {
  [resourceType: string]: {
    [methodName: string]: {
      allowed: boolean;
      _id: string;
      resourceType: string;
      permissionId: string;
      dataSourceId?: string;
      methodName?: string;
    };
  };
}

export const formatPermissions = (
  backendPermissions: BackendPermission[]
): PermissionMap => {
  const permissionMap: PermissionMap = {};
  // console.log("Backend Permissions:", backendPermissions);

  backendPermissions.forEach((perm, index) => {
    const isOriginalStructure = "permissionId" in perm && "allowed" in perm;
    const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
    const resourceType = perm.resourceType;
    const resourceCode = perm.resourceCode;
    const allowed = isOriginalStructure ? perm.allowed : true;
    const dataSourceId = isOriginalStructure ? perm.dataSourceId : undefined;
    const backendMethod = isOriginalStructure ? perm.method : undefined;
    // const methodName = isOriginalStructure ? perm.method : undefined;
    if (!permissionId || !resourceType || !resourceCode) {
      console.warn(
        `Invalid permission at index ${index}:`,
        JSON.stringify(perm, null, 2)
      );
      return;
    }

    // Split resourceCode on '__' first
    let resourceCodeParts = resourceCode.split("__");

    // If single part, try splitting on '_' and handle special cases
    if (resourceCodeParts.length === 1) {
      resourceCodeParts = resourceCode.split("_");
      if (resourceCodeParts.length < 2) {
        console.warn(
          `Skipping invalid resourceCode format at index ${index}: ${resourceCode}`
        );
        return;
      }
      // Special case for notification_type_get → notificationType__get
      // if (
      //   resourceCodeParts[0] === "notification" &&
      //   resourceCodeParts[1] === "type"
      // ) {
      //   resourceCodeParts = ["notificationType", resourceCodeParts[2]];
      // } else {
      //   // Treat as resource_method (e.g., role_permission_list → role__permission_list)
      //   resourceCodeParts = [
      //     resourceCodeParts.slice(0, -1).join("_"),
      //     resourceCodeParts[resourceCodeParts.length - 1],
      //   ];
      // }
    }

    if (!permissionMap[resourceType]) {
      permissionMap[resourceType] = {};
    }

    const methodMapping: Record<string, string> = {
      get: "list",
      put: "update",
      post: "create",
      delete: "delete",
    };

    const normalizedMethod = backendMethod?.toLowerCase();

    let methodName: string;
    let formattedKey: string;

    if (resourceCodeParts.length === 2) {
      methodName = resourceCodeParts[1]; // e.g., 'get' for notificationType__get
      formattedKey = methodName;
    } else if (resourceCodeParts.length >= 3) {
      const nestedKey = resourceCodeParts[1];
      const method = resourceCodeParts[2];
      methodName = `${nestedKey}_${method}`; // e.g., 'case_list_list'
      formattedKey = methodName;
    } else {
      console.warn(
        `Unexpected resourceCode format at index ${index}: ${resourceCode}`
      );
      return;
    }

    permissionMap[resourceType][formattedKey] = {
      allowed,
      _id: permissionId,
      resourceType,
      method: backendMethod,
      permissionId,
      ...(dataSourceId != null && { dataSourceId }),
      ...(normalizedMethod && {
        methodValue: methodMapping[normalizedMethod] || normalizedMethod,
      }),
    };
  });

  // console.log("Formatted Permission Map:", permissionMap);
  localStorage.setItem("permissions", JSON.stringify(permissionMap));
  window.dispatchEvent(new Event("storage"));

  return permissionMap;
};

// Helper functions from transformPermissions
// function extractFromResourceCode(code: string): string | null {
//   if (!code) return null;
//   const segments = code.split(/_{1,2}/);
//   return segments[segments.length - 1]?.toLowerCase() || null;
// }

// function mapHttpMethod(method: string | undefined): string {
//   const mapping: Record<string, string> = {
//     'GET': 'list',
//     'POST': 'create',
//     'PUT': 'update',
//     'DELETE': 'delete',
//     'PATCH': 'update'
//   };
//   return mapping[method?.toUpperCase()] || method?.toLowerCase() || 'unknown';
// }

// export const formatPermissions = (
//   backendPermissions: BackendPermission[]
// ): PermissionMap => {
//   const permissionMap: PermissionMap = {};
//   // console.log("Backend Permissions:", backendPermissions);

//   backendPermissions.forEach((perm, index) => {
//     const isOriginalStructure = "permissionId" in perm && "allowed" in perm;
//     const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
//     const resourceType = perm.resourceType;
//     const resourceCode = perm.resourceCode;
//     const allowed = isOriginalStructure ? perm.allowed : true;
//     const dataSourceId = isOriginalStructure ? perm.dataSourceId : undefined;
//     const backendMethod = isOriginalStructure ? perm.method : undefined;
    
//     if (!permissionId || !resourceType || !resourceCode) {
//       console.warn(
//         `Invalid permission at index ${index}:`,
//         JSON.stringify(perm, null, 2)
//       );
//       return;
//     }

//     // Split resourceCode on '__' first
//     let resourceCodeParts = resourceCode.split("__");

//     // If single part, try splitting on '_' and handle special cases
//     if (resourceCodeParts.length === 1) {
//       resourceCodeParts = resourceCode.split("_");
//       if (resourceCodeParts.length < 2) {
//         console.warn(
//           `Skipping invalid resourceCode format at index ${index}: ${resourceCode}`
//         );
//         return;
//       }
//       // Special case for notification_type_get → notificationType__get
//       if (
//         resourceCodeParts[0] === "notification" &&
//         resourceCodeParts[1] === "type"
//       ) {
//         resourceCodeParts = ["notificationType", resourceCodeParts[2]];
//       } else {
//         // Treat as resource_method (e.g., role_permission_list → role__permission_list)
//         resourceCodeParts = [
//           resourceCodeParts.slice(0, -1).join("_"),
//           resourceCodeParts[resourceCodeParts.length - 1],
//         ];
//       }
//     }

//     if (!permissionMap[resourceType]) {
//       permissionMap[resourceType] = {};
//     }

//     // Determine method value using helper functions (priority order)
//     const methodValue = 
//       perm.methodName ||                                    
//       extractFromResourceCode(perm.resourceCode) ||         
//       mapHttpMethod(perm.method) ||                         
//       'unknown';

//     let formattedKey: string;

//     if (resourceCodeParts.length === 2) {
//       formattedKey = resourceCodeParts[1]; // e.g., 'get' for notificationType__get
//     } else if (resourceCodeParts.length >= 3) {
//       const nestedKey = resourceCodeParts[1];
//       const method = resourceCodeParts[2];
//       formattedKey = `${nestedKey}_${method}`; // e.g., 'case_list_list'
//     } else {
//       console.warn(
//         `Unexpected resourceCode format at index ${index}: ${resourceCode}`
//       );
//       return;
//     }

//     permissionMap[resourceType][formattedKey] = {
//       allowed,
//       _id: permissionId,
//       resourceType,
//       method: backendMethod,
//       permissionId,
//       ...(dataSourceId != null && { dataSourceId }),
//       methodValue, // Use the standardized method value
//     };
//   });

//   // console.log("Formatted Permission Map:", permissionMap);
//   localStorage.setItem("permissions", JSON.stringify(permissionMap));
//   window.dispatchEvent(new Event("storage"));

//   return permissionMap;
// };
export const barLabelsPlugin = {
  id: "barLabels",
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const bar = element as BarElement;
      if (!bar || typeof bar.tooltipPosition !== "function") return;
      const { x, y } = bar.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const text = `${value}`;

      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Move label above the bar
      const offset = 18;
      const labelY = y - offset;

      // Measure text
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;

      // Draw rounded rectangle above the bar
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();

      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text above the bar
      ctx.fillStyle = "#000";
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};


export const sliceLabelsPlugin = {
  id: "sliceLabels",
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);

    meta.data.forEach((element, index) => {
      const point = element as PointElement;
      if (!point || typeof point.tooltipPosition !== "function") return;
      const value = dataset.data[index] as number;
      const label = chart.data.labels?.[index] ?? "";
      const percent = value / total;
      // if (percent < 0.05) return; // skip small slices

      const { x, y } = point.tooltipPosition(Boolean(chart.chartArea));
      const text = `${label}: ${value}`;

      ctx.save();
      ctx.font =
        percent < 0.1 ? "bold 10px sans-serif" : "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Measure text
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;

      // Draw rounded rectangle
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = y - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();

      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text
      ctx.fillStyle = "#000";
      ctx.fillText(text, x, y);
      ctx.restore();
    });
  },
};



export const pointLabelsPlugin = {
  id: "pointLabels",
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const point = element as PointElement;
      if (!point || typeof point.tooltipPosition !== "function") return;
      const { x, y } = point.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const text = `${value}`;

      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Move label above the point
      const offset = 18;
      const labelY = y - offset;

      // Measure text
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;

      // Draw rounded rectangle above the point
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();

      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text above the point
      ctx.fillStyle = "#000";
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};

export const polarAreaLabelsPlugin = {
  id: "polarAreaLabels",
  afterDraw(chart: ChartJS) {
    const { ctx } = chart;
    const datasets = chart.data.datasets;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((element, index) => {
      const arc = element as ArcElement;
      if (!arc || typeof arc.tooltipPosition !== "function") return;
      const { x, y } = arc.tooltipPosition(Boolean(chart.chartArea));
      const value = datasets[0].data[index] as number;
      const label = chart.data.labels?.[index] ?? "";
      const text = `${label}: ${value}`;

      ctx.save();
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Move label above the arc
      const offset = 18;
      const labelY = y - offset;

      // Measure text
      const paddingX = 8;
      const paddingY = 4;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = 16;

      // Draw rounded rectangle above the arc
      const rectX = x - textWidth / 2 - paddingX;
      const rectY = labelY - textHeight / 2 - paddingY;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const radius = 6;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();

      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text above the arc
      ctx.fillStyle = "#000";
      ctx.fillText(text, x, labelY);
      ctx.restore();
    });
  },
};


export const arrayToString = (value?: string[] | string): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

export const toArray = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    return value.split(",").map((g) => g.trim()).filter(Boolean);
  }
  return [];
};
