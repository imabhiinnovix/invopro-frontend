export type DataSourceListPayload = object;

export interface DataSourceListResponse {
  message: string;
  success: boolean;
  totalCount: number;
  data: DataSourceListData[];
}

export interface DataSourceListFieldSettings {
  attributeId: string;
  isDisplayEnable: boolean;
  isFilterEnable: boolean;
  isSortingEnable: boolean;
  label: string;
  mappedAttributeName: string;
  refAttributeId: string | null;
  totalCount: number;
  data: DataSourceListData[];
}

export interface DataSourceListData {
  _id: string;
  organizationId: string;
  vendorId: string;
  entityId: {
    _id: string;
    name: string;
    attributes: DataSourceListAttributes[];
  };
  name: string;
  description: string;
  code: string;
  versionType: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  lastUploadedDate: string;
  __v: 0;
  fieldSettings: DataSourceListFieldSettings[];
  canEditInline: true;
  uniqueAttributeName: string[];
}

export interface DataSourceListAttributes {
  name: string;
  mappingName: string;
  type: "option" | "text" | "number" | "boolean";
  required: boolean;
  validation: [];
  transformations: [];
  optionAttributeId: string;
  cleaner: [];
}
