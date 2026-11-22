import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  UserPublic,
} from "../types/auth";

export async function registerUser(
  payload: RegisterPayload
): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>(
    "/auth/register",
    payload
  );
  return data;
}

export async function loginUser(
  payload: LoginPayload
): Promise<MessageResponse> {
  const formData = new URLSearchParams();
  formData.append("username", payload.username);
  formData.append("password", payload.password);

  const { data } = await axiosInstance.post<MessageResponse>(
    "/auth/token",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data;
}

export async function logoutUser(): Promise<MessageResponse> {
  const { data } = await axiosInstance.post<MessageResponse>("/auth/logout");
  return data;
}

export async function fetchCurrentUser(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>("/auth/me");
  return data;
}