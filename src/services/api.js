import axios from "axios";

// =======================================
// API BASE URL (Vercel → Render)
// =======================================
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://apievent-1.onrender.com/api/";

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
// RESPONSE INTERCEPTOR (JWT Refresh)
// =======================================
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${BASE_URL}token/refresh/`,
          { refresh }
        );

        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        return API(originalRequest);
      } catch {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

// =======================================
// LOGOUT
// =======================================
function logout() {
  localStorage.clear();
  window.location.href = "/";
}

export default API;
