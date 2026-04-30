import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores según rúbrica
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] Method: ${config.method?.toUpperCase()} | URL: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);