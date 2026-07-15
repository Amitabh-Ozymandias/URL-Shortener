import axios from "axios";

// Used only for displaying/constructing short link URLs in the UI.
// API calls use a relative base URL in development (and go through the Vite proxy).
// In production, they call the deployed API directly.
export const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://url-shortener-m01x.onrender.com" : "http://localhost:5000");

export const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://url-shortener-m01x.onrender.com" : "") 
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register") && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const extractError = (err: any, fallback = "Something went wrong"): string => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  // Zod validation errors: { errors: [{ field, message }] }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e: { field?: string; message: string }) =>
      e.field ? `${e.field}: ${e.message}` : e.message
    ).join(" · ");
  }
  return data.message || err?.message || fallback;
};
