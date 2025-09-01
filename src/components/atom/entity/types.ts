export interface Attribute {
  name: string;
  mappingName: string;
  type:
    | "number"
    | "text"
    | "date"
    | "boolean"
    | "richtext"
    | "text-with-option"
    | "url"
    | "option"
    | "multioption"
    | "user"
    | "";
  validation?: string[];
  transformations?: string[];
  optionAttributeId?: string;
  cleaner?: string[];
  required: string | boolean;
  referenceEntitySetting?: {
    refEntityId?: string;
    refEntityField?: string;
    relationType?: string;
  };
}

interface CreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

interface UpdatedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface EntityRequestPayload {
  _id?: string;
  name: string;

  isActive?: boolean;
  description?: string;
  attributes?: Attribute[]; // Optional array of attributes
  createdBy?: CreatedBy;
  updatedBy?: UpdatedBy;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityResponse {
  message: string;
  success: boolean;
}
