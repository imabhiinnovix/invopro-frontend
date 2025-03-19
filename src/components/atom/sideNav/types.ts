export interface DataSourceListPayload {}

export interface DataSourceListResponse {
  message: string;
  success: boolean;
  totalCount: number;
  data: DataSourceListData[];
}

export interface DataSourceListData {
  _id: string;
  organizationId: string;
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
  __v: 0;
}

export interface DataSourceListAttributes {
  name: string;
  mappingName: string;
  type: string;
  required: boolean;
  validation: [];
  transformations: [];
  optionAttributeId: string;
  cleaner: [];
}
