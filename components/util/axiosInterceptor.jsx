import axios from "axios";
import { getAccessToken } from "./actionUtil";
import { API_ENDPOINT } from "../state/const";

// Request interceptor to add authorization header
axios.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      history.push('/login');
      return config;
    }

    config.headers.authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 4xx errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      console.error('An error occurred:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

// Function to check token validity
export const checkTokenValidity = async () => {
  try {
    const res = await axios.post(`${API_ENDPOINT}/validate_token`, {}, {
      headers: {
        authorization: `Bearer ${getAccessToken()}`,
      }
    });
    console.log(res.data.status);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      history.push('/login');
    }
  }
};
