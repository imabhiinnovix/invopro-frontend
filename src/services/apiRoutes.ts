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
  UPDATE_ENTITY: 'entities/update',
};

export const GET = {
  USER_DETAILS: '/users/getCurrentUser',
  USER_LIST: '/users/list',
  ORGANIZATION_LIST: '/organizations/list',
  GET_USER: '/users/',
  GET_ORGANIZATION: '/organizations/',
  Entity_List: '/entities/list',
};
