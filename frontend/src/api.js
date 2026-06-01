import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const cameraStreamUrl = (cameraId = "cam01") => `${API_BASE_URL}/cameras/${cameraId}/stream`;
export const detectionStreamUrl = (cameraId = "cam01") => `${API_BASE_URL}/detection/${cameraId}/stream`;

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

export async function addCamera(payload) {
  const { data } = await api.post("/cameras", payload);
  return data;
}

export async function removeCamera(cameraId) {
  const { data } = await api.delete(`/cameras/${cameraId}`);
  return data;
}

export async function testCameraSource(source) {
  const { data } = await api.post("/cameras/test-source", { source });
  return data;
}

export async function openCamera(cameraId) {
  const { data } = await api.post(`/cameras/${cameraId}/open`);
  return data;
}

export async function closeCamera(cameraId) {
  const { data } = await api.post(`/cameras/${cameraId}/close`);
  return data;
}

export async function fetchSettings() {
  const { data } = await api.get("/settings");
  return data;
}

export async function fetchDetectionStatus() {
  const { data } = await api.get("/detection/status");
  return data;
}

export async function startDetection(cameraId) {
  const { data } = await api.post("/detection/start", { camera_id: cameraId });
  return data;
}

export async function stopDetection() {
  const { data } = await api.post("/detection/stop");
  return data;
}
