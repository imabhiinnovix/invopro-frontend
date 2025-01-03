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

export interface AttributeOptionResponse {
  message: string;
  success: boolean;
}

export interface AttributeOptionRequestPayload {
  attributeName: string;
  attributeValue: string[];
  isActive?: boolean;
  _id: string;
  createdBy?: CreatedBy;
  updatedBy?: UpdatedBy;
  createdAt?: string;
  updatedAt?: string;
}
