import axios from "axios";
import { setToken, getToken } from "./actionUtil";
import { API_ENDPOINT } from "../state/const";


axios.interceptors.request.use(
  async (config) => {
    console.log('Request interceptor loaded successfully');
    const token = getToken();

    // Redirect to login page if token is invalid
    if(!token) {
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

// TODO: refresh token
// response interceptor intercepting 401 responses, refreshing token and retrying the request
// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     console.log(error);
//     const config = error.config;

//     if (error.status === 401 && !config._retry) {
//       // we use this flag to avoid retrying indefinitely if
//       // getting a refresh token fails for any reason
//       config._retry = true;
//       localStorage.setItem("token", await refreshAccessToken());

//       return axios(config);
//     }

//     return Promise.reject(error);
//   }
// );

export const refreshAccessToken = async () => {
  try {
    const res = await axios.post(`${API_ENDPOINT}/refresh_token`); // Make HTTP request to validate_token endpoint
    console.log(res.data.status);
    const token = res.data.access_token;
    setToken(token);
  } catch (error) {
    if (error.response.status === 401) {
      history.push('/login'); // Redirect to login page if token is invalid
    }
  }
}

export const checkTokenValidity = async () => {
  try {
    const res = await axios.post(`${API_ENDPOINT}/validate_token`); // Make HTTP request to validate_token endpoint
    console.log(res.data.status);
  } catch (error) {
    if (error.response.status === 401) {
      history.push('/login'); // Redirect to login page if token is invalid
    }
  }
}

