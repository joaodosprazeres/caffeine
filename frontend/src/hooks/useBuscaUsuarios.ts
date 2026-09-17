import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { UsuarioBuscaListaResponse } from '../types';

interface UseBuscaUsuariosResult {
  resultado: UsuarioBuscaListaResponse | null;
  buscar: (query: string, page?: number) => Promise<void>;
  buscando: boolean;
  erro: string | null;
}

export function useBuscaUsuarios(): UseBuscaUsuariosResult {
  const [resultado, setResultado] = useState<UsuarioBuscaListaResponse | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(async (query: string, page = 1): Promise<void> => {
    setBuscando(true);
    setErro(null);
    try {
      const resposta = await apiFetch<UsuarioBuscaListaResponse>('/usuarios', {
        query: { q: query, page },
      });
      setResultado(resposta);
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível buscar usuários.');
    } finally {
      setBuscando(false);
    }
  }, []);

  return { resultado, buscar, buscando, erro };
}
