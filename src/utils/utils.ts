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
    };
  };
}

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
      console.warn(`Invalid permission at index ${index}:`, perm);
      return;
    }

    // Split resourceCode to get method name
    const resourceCodeParts = resourceCode.split('__');
    if (resourceCodeParts.length < 2) {
      console.warn(`Invalid resourceCode format at index ${index}: ${resourceCode}`);
      return;
    }

    // Handle method name: take all parts after the first one
    const methodName = resourceCodeParts.slice(1).join('_');

    // Capitalize each word and join with a space
    const formattedMethodName = methodName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Initialize resourceType in permissionMap
    if (!permissionMap[resourceType]) {
      permissionMap[resourceType] = {};
    }

    // Assign permission details
    permissionMap[resourceType][formattedMethodName] = {
      allowed,
      _id: permissionId,
      resourceType,
      permissionId,
      ...(dataSourceId && { dataSourceId }), 
    };
  });

  localStorage.setItem('permissions', JSON.stringify(permissionMap));
  window.dispatchEvent(new Event('storage'));

  return permissionMap;
};