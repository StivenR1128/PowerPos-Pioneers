import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  empresa: string;
}

interface AuthStore {
  token: string | null;
  usuario: Usuario | null;
  hydrated: boolean;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      hydrated: false,
      setAuth: (token, usuario) => {
        localStorage.setItem('token', token);
        set({ token, usuario });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, usuario: null });
      },
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);