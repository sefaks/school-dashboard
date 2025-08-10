import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://arfbackend-h3g2bdftbxdffqcy.westeurope-01.azurewebsites.net", // Backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;


