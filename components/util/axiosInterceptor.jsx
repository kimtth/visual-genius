import axios from "axios";
import { setToken, getToken } from "./actionUtil";
import { API_ENDPOINT } from "../state/const";


axios.interceptors.request.use(
  async (config) => {
    const token = getToken();

    // Redirect to login page if token is invalid
    if (!token) {
      history.push('/login');
    }

    if (token) {
      config.headers = {
        authorization: `Bearer ${token}`,
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


//response interceptor intercepting 401 responses, refreshing token and retrying the request
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error && typeof error === 'object' && error.hasOwnProperty('response')) {
      if (error.response.status === 401 && error.response.data.detail === "Invalid token" && !config._retry) {
        config._retry = true;
        await refreshAccessToken();
        return axios(config);
      }

      return Promise.reject(error);
    }
  }
);

export const refreshAccessToken = async () => {
  try {
    const res = await axios.post(`${API_ENDPOINT}/refresh_token`, {
      headers: {
        authorization: `Bearer ${getRefreshToken()}`,
      }
    });
    console.log(res.data.status);
    const token = res.data;
    setToken(token);
    return token;
  } catch (error) {
    history.push('/login');
  }
}

export const checkTokenValidity = async () => {
  try {
    const res = await axios.post(`${API_ENDPOINT}/validate_token`, {
      headers: {
        authorization: `Bearer ${getToken()}`,
      }
    }); // Make HTTP request to validate_token endpoint
    console.log(res.data.status);
  } catch (error) {
    if (error.response.status === 401) {
      history.push('/login'); // Redirect to login page if token is invalid
    }
  }
}

