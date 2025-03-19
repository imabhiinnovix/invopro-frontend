export const POST = {
  LOGIN: '/auth/login',
  USER_UPDATE: '/users/update',
  HELP_DESK_SUPPORT: '/support/create',
  CHANGE_PASSWORD: '/users/change-password',
  SEND_OTP: 'auth/send-otp',
  VERIFY_OTP: 'auth/verify-otp',

  CREATE_USER: 'auth/create-user',
  UPDATE_USER: '/users/update/',
  DELETE_USER: '/users/delete/',

  CREATE_ORGANIZATION: '/organizations/create',
  UPDATE_ORGANIZATION: '/organizations/update/',
  DELETE_ORGANIZATION: '/organizations/delete/',

  ORGANIZATION_ACTIVE: '/organizations/updateStatus/',
  USER_ACTIVE: '/users/updateStatus/',
  FILE_UPLOAD: '/files/upload',
  CREATE_ENTITY: '/entities/create',
  UPDATE_ENTITY: '/entities/update',
  CREATE_ATTRIBUTE_OPTION: '/attributeOptions/create',
  CREATE_DATA_SOURCE: '/dataSource/create',
  Custom_Report: '/customReports',
};
export const PUT = {
  UPDATE_DATA_SOURCE: '/dataSource/update',
  UPDATE_ATTRIBUTE_OPTION: '/attributeOptions/update',
};
export const GET = {
  USER_DETAILS: '/users/getCurrentUser',
  USER_LIST: '/users/list',
  ORGANIZATION_LIST: '/organizations/list',
  GET_USER: '/users/',
  GET_ORGANIZATION: '/organizations/',
  Entity_List: '/entities/list',
  Get_Entity: '/entities',
  Attribute_Option_List: 'attributeOptions/list',
  Attribute_Option_Get: 'attributeOptions/get',
  Data_Source_List: '/dataSource/list',
  Data_Source_Code: '/dataSource/code',
  Data_Source_Version: '/dataSourceVersion',
  Data_Source: '/dataSource/dataSourceId',
  Data_Source_Name: '/dataSource/name',
  Data_Import_Error: 'dataImportError',
  Custom_Report: '/customReports',
  DATA_SOURCE_LIST:"/dataSource/list"
};
