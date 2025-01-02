interface Attribute {
  name: string;
  type: 'number' | 'text' | 'date' | 'boolean' | 'richtext' | 'url' | 'option' | 'multioption' | 'user' | '';
  validation?: string[];
  transformations?: string[];
  optionAttributeId?: string;
  cleaner?: string[];
}

export interface EntityRequestPayload {
  name: string;
  description?: string;
  attributes?: Attribute[]; // Optional array of attributes
}

export interface EntityResponse {
  message: string;
  success: boolean;
}
