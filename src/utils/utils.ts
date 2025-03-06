type Primitive = string | number | boolean | File | Blob | null | undefined;
type FormDataConvertible = { [key: string]: Primitive | FormDataConvertible };

export function objectToFormData<T extends FormDataConvertible>(
  obj: T,
  formData: FormData = new FormData(),
  parentKey: string = ''
): FormData {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof File) &&
        !(value instanceof Blob)
      ) {
        objectToFormData(value as FormDataConvertible, formData, formKey);
      } else {
        formData.append(formKey, value !== undefined ? String(value) : '');
      }
    }
  }
  return formData;
}
