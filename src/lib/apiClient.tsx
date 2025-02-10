import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://base-service-ua14.onrender.com", // Backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;


