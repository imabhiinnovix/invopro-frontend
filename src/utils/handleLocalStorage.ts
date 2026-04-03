export const getAuthToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

export const setAuthToken = (token: string, persistent = false) => {
  // if (persistent) {
  //   localStorage.setItem("token", token);
  // } else {
  //   sessionStorage.setItem("token", token);
  // }
   // ✅ Always store in localStorage (fix for new tab issue)
  localStorage.setItem('token', token);

  // ✅ Optional: also keep sessionStorage (for legacy support)
  if (!persistent) {
    sessionStorage.setItem('token', token);
  }
};

export const getRoleId = () => {
  return localStorage?.getItem("role");
};

export const setRoleId = (id: string) => {
  return localStorage.setItem("role", id);
};

export const clearLocalStorage = () => {
  sessionStorage.clear();
  return localStorage.clear();
};

export const clearSessionStorage = () => {
  return sessionStorage.clear();
};
