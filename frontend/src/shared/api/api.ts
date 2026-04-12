import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // Ensures cookies are sent with requests
});

/** Navigate to guest authorization page if 401 is returned */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/auth/guest";
    }
    return Promise.reject(error);
  },
);

export default api;
