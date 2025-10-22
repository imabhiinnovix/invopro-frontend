export interface FieldSetting {
  attributeId: string;
  refAttributeId: string[];
  label: string;
  isFilterEnable?: boolean;
  isDashboardFilter?: boolean;
  isSortingEnable?: boolean;
  isDisplayEnable?: boolean;
  isDerived?: boolean;
  type?: string;
  mappedAttributeName?: string;
  optionAttributeId?: string | null;
}

export interface Template {
  _id: string;
  name: string;
  code: string;
  subject: string;
  body: string;
  type: string;
  dataSourceId: string;
  attachmentType?: string;
  attachmentFileName?: string;
  attachmentFieldList?: FieldSetting[];
  groupBy?: FieldSetting[];
  status: string;
}

export interface DataSource {
  _id: string;
  name: string;
  fieldSettings?: FieldSetting[];
  isShowMenu?: boolean;
}

export interface TemplateFormData {
  name: string;
  code: string;
  subject: string;
  body: string;
  type: string;
  dataSourceId: string;
  attachmentType: string;
  attachmentFileName: string;
  attachmentFieldList: string[]; // Store labels as strings
  groupBy: string[]; // Store labels as strings
}

export interface AttachmentFieldItem {
  attributeId: string;
  refAttributeId?: string[];
}

export interface AttachmentSettings {
  type: string;
  fileName: string;
  fieldList: AttachmentFieldItem[];
}

export interface GroupByItem {
  attributeId: string;
  refAttributeId: string[];
}

export interface TemplatePostPayload extends TemplateFormData {
  attachmentSettings: AttachmentSettings;
  groupBy: GroupByItem[];
}

export interface TemplatePostResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  editTemplateId?: string;
  rowData?: Template | null;
  onTemplateCreated?: () => void;
  onTemplateUpdated?: () => void;
}