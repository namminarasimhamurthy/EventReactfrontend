import axios from "axios";

// =======================================
// API BASE URL (ENV FIRST, FALLBACK LOCAL)
// =======================================
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

// =======================================
// API INSTANCE
// =======================================
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================================
// REQUEST INTERCEPTOR
// Attach JWT Access Token
// =======================================
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================================
// RESPONSE INTERCEPTOR
// Auto Refresh Token on 401
// =======================================
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${BASE_URL}token/refresh/`,
          { refresh: refreshToken }
        );

        // Save new access token
        localStorage.setItem("access", response.data.access);

        // Retry original request
        originalRequest.headers.Authorization =
          "Bearer " + response.data.access;

        return API(originalRequest);
      } catch (refreshError) {
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =======================================
// LOGOUT HELPER
// =======================================
function logoutUser() {
  localStorage.clear();
  window.location.href = "/";
}

export default API;
