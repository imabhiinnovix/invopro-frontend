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

//   backendPermissions.forEach((perm, index) => {
//     const isOriginalStructure = 'permissionId' in perm && 'allowed' in perm;
//     const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
//     const resourceType = perm.resourceType;
//     const resourceCode = perm.resourceCode;
//     const allowed = isOriginalStructure ? perm.allowed : true;
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

//     if (resourceType === 'Custom Report') {
//       // For Custom Report: Use the part after 'customReport__' as the key
//       const methodName = resourceCodeParts[1]; // e.g., 'get_design_details'

//       permissionMap[resourceType][methodName] = {
//         allowed,
//         _id: permissionId,
//         resourceType,
//         permissionId,
//         methodName, 
//         ...(dataSourceId && { dataSourceId }),
//       };
//     } else if (resourceType === 'Data Source' && resourceCodeParts.length >= 3) {
//       // For Data Source with nested structure: Use second and third parts
//       const nestedKey = resourceCodeParts[1]; // e.g., 'caseess'
//       const method = resourceCodeParts[2]; // e.g., 'create'
//       const methodName = `${nestedKey}_${method}`; // e.g., 'caseess_create'

//       permissionMap[resourceType][methodName] = {
//         allowed,
//         _id: permissionId,
//         resourceType,
//         permissionId,
//         methodName, 
//         ...(dataSourceId && { dataSourceId }),
//       };
//     } else {
//       // Original logic for other resource types or Data Source with 2 parts
//       const methodNameRaw = resourceCodeParts[resourceCodeParts.length - 1]; // Last part

//       // Capitalize each word and join with a space for formatted key
//       const formattedMethodName = methodNameRaw
//         .split('_')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//         .join(' ');

//       permissionMap[resourceType][formattedMethodName] = {
//         allowed,
//         _id: permissionId,
//         resourceType,
//         permissionId,
//         methodName: formattedMethodName, 
//         ...(dataSourceId && { dataSourceId }),
//       };
//     }
//   });

//   localStorage.setItem('permissions', JSON.stringify(permissionMap));
//   window.dispatchEvent(new Event('storage'));

//   return permissionMap;
// };


export const formatPermissions = (
  backendPermissions: BackendPermission[]
): PermissionMap => {
  const permissionMap: PermissionMap = {};

  backendPermissions.forEach((perm, index) => {
    const isOriginalStructure = 'permissionId' in perm && 'allowed' in perm;
    const permissionId = isOriginalStructure ? perm.permissionId : perm._id;
    const resourceType = perm.resourceType;
    const resourceCode = perm.resourceCode;
    const allowed = isOriginalStructure ? perm.allowed : true;
    const dataSourceId = isOriginalStructure ? perm.dataSourceId : undefined;

    // Validate required fields
    if (!permissionId || !resourceType || !resourceCode) {
      console.warn(`Invalid permission at index ${index}:`, JSON.stringify(perm, null, 2));
      return;
    }

    // Split resourceCode on '__'
    const resourceCodeParts = resourceCode.split('__');

    // Skip if resourceCode does not contain '__'
    if (resourceCodeParts.length < 2) {
      console.warn(`Skipping invalid resourceCode format at index ${index}: ${resourceCode}`);
      return;
    }

    // Initialize resourceType in permissionMap
    if (!permissionMap[resourceType]) {
      permissionMap[resourceType] = {};
    }

    let methodName: string;
    let formattedKey: string;

    if (resourceCodeParts.length === 2) {
      // Case: resourceType__method (e.g., customReport__get_design_details)
      methodName = resourceCodeParts[1]; // e.g., 'get_design_details'
      formattedKey = methodName; // Use as-is
    } else if (resourceCodeParts.length >= 3) {
      // Case: resourceType__nested__method (e.g., dataSource__caseess__create)
      const nestedKey = resourceCodeParts[1]; // e.g., 'caseess'
      const method = resourceCodeParts[2]; // e.g., 'create'
      methodName = `${nestedKey}_${method}`; // e.g., 'caseess_create'
      formattedKey = methodName; // Use combined key
    } else {
      // Fallback for unexpected cases (shouldn't occur due to earlier validation)
      console.warn(`Unexpected resourceCode format at index ${index}: ${resourceCode}`);
      return;
    }

    permissionMap[resourceType][formattedKey] = {
      allowed,
      _id: permissionId,
      resourceType,
      permissionId,
      methodName,
      ...(dataSourceId && { dataSourceId }),
    };
  });

  localStorage.setItem('permissions', JSON.stringify(permissionMap));
  window.dispatchEvent(new Event('storage'));

  return permissionMap;
};