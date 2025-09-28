import axios from "axios";

const BACKEND_URL = "https://signature-backend-bm3q.onrender.com/api/project-0";
// const BACKEND_URL = "http://localhost:4000";

export const apiService = async ({
  endpoint,
  method = "GET",
  data,
  params,
  token: _token,
  headers = {},
  customUrl,
  removeToken = false,
  signal,
}) => {
  try {
    let token = _token;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }
    const requestHeaders = {
      "ngrok-skip-browser-warning": "true",
      ...headers,
    };
    if (!removeToken && token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}${endpoint}`,
      method,
      params,
      data,
      headers: requestHeaders,
    };
    if (signal) {
      requestObj.signal = signal;
    }
    const { data: res } = await axios.request(requestObj);
    return { response: res };
  } catch (error) {
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    }
    console.error(error, "backend endpoint error");
    return { success: false, error: true, ...(error?.response?.data || {}) };
  }
};
