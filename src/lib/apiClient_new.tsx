
import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: 'https://base-service-ua14.onrender.com'
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
