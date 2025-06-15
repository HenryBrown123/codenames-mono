import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // This ensures cookies are sent with requests
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication failed. Cookie may be missing or expired.");
      // Optionally redirect to login page
      // window.location.href = '/auth/guest';
    }
    return Promise.reject(error);
  },
);

export default api;
