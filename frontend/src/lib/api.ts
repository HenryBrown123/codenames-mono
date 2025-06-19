import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // This ensures cookies are sent with requests
});

// Navigate to guest authoirsation page if 401 is returned.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication failed. Cookie may be missing or expired.");
      window.location.href = "/auth/guest";
    }
    return Promise.reject(error);
  },
);

export default api;
