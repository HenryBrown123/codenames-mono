import axios from "axios";

// todo: add to to .env
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Ensures cookies are sent with requests
});

// Navigate to guest authorization page if 401 is returned
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
