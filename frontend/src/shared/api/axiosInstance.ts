import axios, { type AxiosError } from "axios";
import { extractApiDetail } from "./handleApiError";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";

    const isAuthCheckOrLogin =
      requestUrl.includes("/auth/token") || requestUrl.includes("/auth/me");

    const detail = extractApiDetail(error);
    const isDeactivatedAccount =
      status === 400 && detail === "Cuenta de usuario desactivada";

    if ((status === 401 && !isAuthCheckOrLogin) || isDeactivatedAccount) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);