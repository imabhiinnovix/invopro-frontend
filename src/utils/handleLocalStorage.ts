export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string) => {
  return localStorage.setItem('token', token);
};

export const getRoleId = () => {
  return localStorage?.getItem('role');
};

export const setRoleId = (id: string) => {
  return localStorage.setItem('role', id);
};

export const clearLocalStorage = () => {
  return localStorage.clear();
};
