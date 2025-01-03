// Third-Party Library
import axios, { AxiosInstance } from 'axios';
import { clearLocalStorage, getAuthToken } from '../utils/handleLocalStorage';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (config.url !== '/login' && token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401 || error.response.status === 403) {
      clearLocalStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
