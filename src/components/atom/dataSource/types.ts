import { FieldSetting } from "../../../types/template";

export interface Attribute {
  name: string;
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
  referenceEntitySetting?: {
    refEntityId?: string;
    refEntityField?: string;
    relationType?: string;
    matchStrategy?: string;
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

export interface DataSourceRequestPayload {
  _id?: string;
  name: string;
  entityId?: any;
  code?: string;
  description?: string;
  isActive?: boolean;
  versionType?: "monthly" | "number" | ""; // Optional array of attributes
  createdBy?: CreatedBy;
  updatedBy?: UpdatedBy;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataSourceType {
  _id: string;
  name: string;
  entityId?: any;
  code?: string;
  description?: string;
  isActive?: boolean;
  versionType?: "monthly" | "number" | ""; // Optional array of attributes
  createdBy?: CreatedBy;
  updatedBy?: UpdatedBy;
  createdAt?: string;
  updatedAt?: string;
  visibility?: "primary" | "secondary" | "hide";
  fieldSettings?: FieldSetting[];
}

export interface DataSourceResponse {
  message: string;
  success: boolean;
}
