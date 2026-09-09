import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch, setAuthToken } from './api';
import type { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../types';

interface AuthContextValue {
  usuario: Usuario | null;
  registrar: (dados: RegistroRequest) => Promise<void>;
  login: (dados: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const aplicarAuth = useCallback((resposta: AuthResponse) => {
    setAuthToken(resposta.access_token);
    setUsuario(resposta.usuario);
  }, []);

  const registrar = useCallback(
    async (dados: RegistroRequest) => {
      const resposta = await apiFetch<AuthResponse>('/auth/registro', {
        method: 'POST',
        body: dados,
      });
      aplicarAuth(resposta);
    },
    [aplicarAuth],
  );

  const login = useCallback(
    async (dados: LoginRequest) => {
      const resposta = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: dados,
      });
      aplicarAuth(resposta);
    },
    [aplicarAuth],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, registrar, login, logout }),
    [usuario, registrar, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
