export function objectToFormData(obj: any, formData = new FormData(), parentKey = '') {
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
      } else if (value && typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
          objectToFormData(value, formData, formKey);
      } else {
          formData.append(formKey, value);
      }
  }
  return formData;
}







  // Helper function to format permission names
export const formatPermissionName = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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


// export const formatPermissions = (
//   backendPermissions: BackendPermission[]
// ): PermissionMap => {
//   const permissionMap: PermissionMap = {};
// console.log("Backend Permissions:", backendPermissions);
//   backendPermissions.forEach((perm, index) => {
//     console.log(`Processing permission at index ${index}:`, JSON.stringify(perm, null, 2));
//     const isOriginalStructure = 'permissionId' in perm && 'allowed' in perm;
//     const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
//     const resourceType = perm.resourceType;
//     const resourceCode = perm.resourceCode;
//     const allowed = isOriginalStructure ? perm.allowed : false;
//     const dataSourceId = isOriginalStructure ? perm.dataSourceId : undefined;
//     // Validate required fields
//     if (!permissionId || !resourceType || !resourceCode) {
//       console.warn(`Invalid permission at index ${index}:`, JSON.stringify(perm, null, 2));
//       return;
//     }

//     // Split resourceCode on '__'
//     const resourceCodeParts = resourceCode.split('__');

//     // Skip if resourceCode does not contain '__'
//     if (resourceCodeParts.length < 2) {
//       console.warn(`Skipping invalid resourceCode format at index ${index}: ${resourceCode}`);
//       return;
//     }

//     // Initialize resourceType in permissionMap
//     if (!permissionMap[resourceType]) {
//       permissionMap[resourceType] = {};
//     }

//     let methodName: string;
//     let formattedKey: string;

//     if (resourceCodeParts.length === 2) {
//       // Case: resourceType__method (e.g., customReport__get_design_details)
//       methodName = resourceCodeParts[1]; // e.g., 'get_design_details'
//       formattedKey = methodName; // Use as-is
//     } else if (resourceCodeParts.length >= 3) {
//       // Case: resourceType__nested__method (e.g., dataSource__caseess__create)
//       const nestedKey = resourceCodeParts[1]; // e.g., 'caseess'
//       const method = resourceCodeParts[2]; // e.g., 'create'
//       methodName = `${nestedKey}_${method}`; // e.g., 'caseess_create'
//       formattedKey = methodName; // Use combined key
//     } else {
//       // Fallback for unexpected cases (shouldn't occur due to earlier validation)
//       console.warn(`Unexpected resourceCode format at index ${index}: ${resourceCode}`);
//       return;
//     }

//     permissionMap[resourceType][formattedKey] = {
//       allowed,
//       _id: permissionId,
//       resourceType,
//       permissionId,
//       // methodName,
//       ...(dataSourceId && { dataSourceId }),
//     };
//   });
// console.log("Formatted Permission Map:", permissionMap);
//   localStorage.setItem('permissions', JSON.stringify(permissionMap));
//   window.dispatchEvent(new Event('storage'));

//   return permissionMap;
// };


export const formatPermissions = (
  backendPermissions: BackendPermission[]
): PermissionMap => {
  const permissionMap: PermissionMap = {};
  // console.log("Backend Permissions:", backendPermissions);

  backendPermissions.forEach((perm, index) => {
    const isOriginalStructure = 'permissionId' in perm && 'allowed' in perm;
    const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
    const resourceType = perm.resourceType;
    const resourceCode = perm.resourceCode;
    const allowed = isOriginalStructure ? perm.allowed : true;
    const dataSourceId = isOriginalStructure ? perm.dataSourceId : undefined;

    if (!permissionId || !resourceType || !resourceCode) {
      console.warn(`Invalid permission at index ${index}:`, JSON.stringify(perm, null, 2));
      return;
    }

    // Split resourceCode on '__' first
    let resourceCodeParts = resourceCode.split('__');

    // If single part, try splitting on '_' and handle special cases
    if (resourceCodeParts.length === 1) {
      resourceCodeParts = resourceCode.split('_');
      if (resourceCodeParts.length < 2) {
        console.warn(`Skipping invalid resourceCode format at index ${index}: ${resourceCode}`);
        return;
      }
      // Special case for notification_type_get → notificationType__get
      if (resourceCodeParts[0] === 'notification' && resourceCodeParts[1] === 'type') {
        resourceCodeParts = ['notificationType', resourceCodeParts[2]];
      } else {
        // Treat as resource_method (e.g., role_permission_list → role__permission_list)
        resourceCodeParts = [resourceCodeParts.slice(0, -1).join('_'), resourceCodeParts[resourceCodeParts.length - 1]];
      }
    }

    if (!permissionMap[resourceType]) {
      permissionMap[resourceType] = {};
    }

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
      console.warn(`Unexpected resourceCode format at index ${index}: ${resourceCode}`);
      return;
    }

    permissionMap[resourceType][formattedKey] = {
      allowed,
      _id: permissionId,
      resourceType,
      permissionId,
      ...(dataSourceId != null && { dataSourceId }),
    };
  });

  // console.log("Formatted Permission Map:", permissionMap);
  localStorage.setItem('permissions', JSON.stringify(permissionMap));
  window.dispatchEvent(new Event('storage'));

  return permissionMap;
};