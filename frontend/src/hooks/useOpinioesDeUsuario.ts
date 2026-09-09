import { useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { OpiniaoListaResponse } from '../types';

interface UseOpinioesDeUsuarioResult {
  dados: OpiniaoListaResponse | null;
  carregando: boolean;
  erro: string | null;
}

export function useOpinioesDeUsuario(username: string, page = 1): UseOpinioesDeUsuarioResult {
  const [dados, setDados] = useState<OpiniaoListaResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<OpiniaoListaResponse>(`/usuarios/${encodeURIComponent(username)}/opinioes`, {
      query: { page },
    })
      .then((resposta) => {
        if (!cancelado) setDados(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar as opiniões.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [username, page]);

  return { dados, carregando, erro };
}
