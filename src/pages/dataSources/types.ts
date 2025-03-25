export type OptionsAttributesValuePayload = object;
export interface OptionsAttributesValueResponce {
  success: boolean;
  message: "Attribute fetched successfully";
  data: OptionsAttributesValueData;
  totalCount: number;
}

export interface OptionsAttributesValueData {
  _id: string;
  attributeName: string;
  attributeValue: string[];
  organizationId: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export type SourceValuePayload = object;

export interface SourceValueResponce {
  success: boolean;
  message: string;
  data: SourceValueData[];
  totalCount: number;
}

export interface SourceValueData {
  _id: string;
  entityId: string;
  dataSourceId: string;
  dataSourceVersionId: string;
  rowData: Record<string, string>;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
