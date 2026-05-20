import axios from "axios";

/**
 * Shared axios instance for every backend call.
 *
 * Configured with the API base URL, cookie credentials enabled, and
 * a global 401 interceptor that redirects to `/auth/guest` so any
 * unauthenticated request automatically re-enters the guest auth
 * flow.
 */
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
