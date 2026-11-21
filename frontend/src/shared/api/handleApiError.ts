import axios from "axios";

interface ValidationErrorItem {
  msg: string;
  loc?: Array<string | number>;
}

interface FastApiErrorBody {
  detail?: string | ValidationErrorItem[];
}

export function extractApiDetail(error: unknown): string | null {
  if (!axios.isAxiosError<FastApiErrorBody>(error)) {
    return null;
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => item.msg).join(". ");
  }

  return null;
}

export function handleApiError(
  error: unknown,
  fallbackMessage = "Ocurrió un error inesperado. Intenta nuevamente."
): string {
  const detail = extractApiDetail(error);
  if (detail) {
    return detail;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor. Verifica que el backend esté activo.";
    }
    return `Error ${error.response.status}: ${fallbackMessage}`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}