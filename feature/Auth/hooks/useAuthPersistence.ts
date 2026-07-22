import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

type PersistedAuthUser = {
  uid: string;
  email: string | null;
  password?: string | null;
  token?: string | null;
};

const AUTH_SESSION_KEY = "@unisuki:auth-session";

export function useAuthPersistence() {
  const saveLogin = useCallback(async (user: PersistedAuthUser) => {
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  }, []);

  const getSavedLogin =
    useCallback(async (): Promise<PersistedAuthUser | null> => {
      const raw = await AsyncStorage.getItem(AUTH_SESSION_KEY);

      if (!raw) return null;

      try {
        return JSON.parse(raw) as PersistedAuthUser;
      } catch {
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
    }, []);

  const clearLogin = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
  }, []);

  return { saveLogin, getSavedLogin, clearLogin };
}

export default useAuthPersistence;
