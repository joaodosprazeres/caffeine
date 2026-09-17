import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { UsuarioListaResponse } from '../types';

interface UseSeguidoresResult {
  seguidos: UsuarioListaResponse | null;
  carregandoSeguidos: boolean;
  erro: string | null;
  seguir: (username: string) => Promise<void>;
  deixarDeSeguir: (username: string) => Promise<void>;
  carregarSeguidos: (page?: number) => Promise<void>;
}

export function useSeguidores(): UseSeguidoresResult {
  const [seguidos, setSeguidos] = useState<UsuarioListaResponse | null>(null);
  const [carregandoSeguidos, setCarregandoSeguidos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const seguir = useCallback(async (username: string): Promise<void> => {
    setErro(null);
    try {
      await apiFetch<void>(`/usuarios/${encodeURIComponent(username)}/seguir`, { method: 'POST' });
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível seguir este usuário.');
      throw err;
    }
  }, []);

  const deixarDeSeguir = useCallback(async (username: string): Promise<void> => {
    setErro(null);
    try {
      await apiFetch<void>(`/usuarios/${encodeURIComponent(username)}/seguir`, { method: 'DELETE' });
    } catch (err) {
      setErro(
        err instanceof ApiRequestError ? err.message : 'Não foi possível deixar de seguir este usuário.',
      );
      throw err;
    }
  }, []);

  const carregarSeguidos = useCallback(async (page = 1): Promise<void> => {
    setCarregandoSeguidos(true);
    setErro(null);
    try {
      const resposta = await apiFetch<UsuarioListaResponse>('/usuarios/me/seguidos', {
        query: { page },
      });
      setSeguidos(resposta);
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar seus seguidos.');
    } finally {
      setCarregandoSeguidos(false);
    }
  }, []);

  return { seguidos, carregandoSeguidos, erro, seguir, deixarDeSeguir, carregarSeguidos };
}
