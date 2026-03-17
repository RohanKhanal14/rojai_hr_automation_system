import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

if (!baseURL) {
  console.warn(
    "NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_BACKEND_URL) is not defined. API requests will likely fail.",
  );
}

export const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
