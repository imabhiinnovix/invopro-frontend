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






export interface BackendPermission {
  permissionId: string; 
  name: string;
  method: string; 
  resourceId: string; 
  resourceType: string; 
  allowed: boolean; 
  dataSourceId:string
}

export interface PermissionMap {
  [resourceType: string]: {
    [action: string]: {
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
    const { permissionId, method, resourceId, resourceType,allowed,dataSourceId } = perm;

    // Validate fields
    if (!permissionId || !method || !resourceId || !resourceType) {
      console.warn(`Invalid permission at index ${index}:`, perm);
      return;
    }

    // Construct resource in METHOD:PATH format
    const resource = `${method}:${resourceId}`;
    const [_, path] = resource.split(':'); // _ to ignore method since we have it
    if (!path) {
      console.warn(`Invalid resource format at index ${index}: ${resource}`);
      return;
    }

    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) {
      console.warn(`Empty path parts for resource at index ${index}: ${resource}`);
      return;
    }

    const derivedResourceType = parts[0]; // Use resourceType from backend if valid
    const action =
      parts.length > 1
        ? parts
            .slice(1)
            .join('_')
            .replace(/[-]/g, '_')
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase()
        : method === 'GET'
          ? 'view'
          : 'list';

    if (!permissionMap[resourceType]) {
      permissionMap[resourceType] = {};
    }

    permissionMap[resourceType][action] = {
      allowed,
      _id: permissionId,
      resourceType,
      permissionId,
      dataSourceId,
    };
  });

  localStorage.setItem('permissions', JSON.stringify(permissionMap));
  window.dispatchEvent(new Event('storage'));

  return permissionMap;
};


  // Helper function to format permission names
export const formatPermissionName = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
