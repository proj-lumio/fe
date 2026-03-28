import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authApi } from "@/lib/api"
import type { User } from "@/types"

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        const res = await authApi.login(email, password)
        localStorage.setItem("lumio-token", res.access_token)
        set({ user: res.user, token: res.access_token })
      },

      register: async (email, password, displayName) => {
        const res = await authApi.register(email, password, displayName)
        localStorage.setItem("lumio-token", res.access_token)
        set({ user: res.user, token: res.access_token })
      },

      logout: () => {
        localStorage.removeItem("lumio-token")
        set({ user: null, token: null })
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "lumio-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) localStorage.setItem("lumio-token", state.token)
        state?.setLoading(false)
      },
    },
  ),
)
