export function objectToFormData(obj, formData = new FormData(), parentKey = '') {
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const value = obj[key];
      // Construct the form key (e.g., "mappings[AnnuitiesDueList_CPi][Docket Number]")
      const formKey = parentKey ? `${parentKey}[${key}]` : key;
      if (
        value &&
        typeof value === 'object' &&
        !(value instanceof File) && 
        !(value instanceof Blob)
      ) {
        // Recursively process nested objects (or arrays)
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
    return formData;
  }