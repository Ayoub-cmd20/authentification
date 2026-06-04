import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uap_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const downloadFile = async (url: string, fileName: string) => {
  const response = await api.get(url, { responseType: "blob" });
  const href = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
};
