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
