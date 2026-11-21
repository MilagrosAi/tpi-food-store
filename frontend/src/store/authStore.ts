import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from "../features/auth/api/auth";
import type { LoginPayload, UserPublic } from "../features/auth/types/auth";
import { registerUnauthorizedHandler } from "../shared/api/axiosInstance";
import { queryClient } from "../shared/api/queryClient";

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (payload: LoginPayload) => Promise<UserPublic>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (payload: LoginPayload) => {
        await loginUser(payload);
        const usuario = await fetchCurrentUser();
        set({ usuario, cargando: false });
        return usuario;
      },

      logout: async () => {
        try {
          await logoutUser();
        } finally {
          queryClient.clear();
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await fetchCurrentUser();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "foodstore-auth",
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);

registerUnauthorizedHandler(() => {
  useAuthStore.getState().limpiarSesion();
});