import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const parseAuthPayload = (response) => {
  // Support both shapes: { success, data: { user, token } } and { user, token }
  const payload = response?.data?.user && response?.data?.token
    ? response.data
    : response;

  return {
    user: payload?.user || null,
    token: payload?.token || null,
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.login(credentials);
          const { user, token } = parseAuthPayload(res);
          if (!user || !token) {
            throw { message: 'Invalid login response from server' };
          }
          localStorage.setItem('resqfood_token', token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          const { user, token } = parseAuthPayload(res);
          if (!user || !token) {
            throw { message: 'Invalid registration response from server' };
          }
          localStorage.setItem('resqfood_token', token);
          connectSocket(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('resqfood_token');
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem('resqfood_token');
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const res = await authAPI.getMe();
          connectSocket(token);
          set({ user: res.data, token, isAuthenticated: true, isLoading: false });
        } catch {
          get().logout();
          set({ isLoading: false });
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
    }),
    {
      name: 'resqfood_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
