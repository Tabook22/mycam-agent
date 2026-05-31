import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const cameraStreamUrl = (cameraId = "cam01") => `${API_BASE_URL}/cameras/${cameraId}/stream`;

export async function createPaymentEvent(payload) {
  const { data } = await api.post("/events", payload);
  return data;
}

export async function fetchEvents(params = {}) {
  const { data } = await api.get("/events", { params });
  return data;
}

export async function fetchSummary(days = 1) {
  const { data } = await api.get("/events/summary", { params: { days } });
  return data;
}

export async function fetchCameras() {
  const { data } = await api.get("/cameras");
  return data;
}

export async function fetchSettings() {
  const { data } = await api.get("/settings");
  return data;
}
