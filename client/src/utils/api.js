import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Automatically inject JWT token into the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Automatically handle token refresh on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request hasn't been retried yet
    // Also ignore if the original request was for logging in or refreshing
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/register" &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;
      
      try {
        // Call the refresh endpoint to get a new access token
        const refreshResponse = await axios.post("/api/auth/refresh");
        const { token } = refreshResponse.data;
        
        // Save new token to local storage
        localStorage.setItem("token", token);
        
        // Update original request headers and retry it
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired, logging out:", refreshError.message);
        localStorage.removeItem("token");
        // Redirect to login page
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
