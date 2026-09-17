import { useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { RankingPessoalResponse } from '../types';

interface UseRankingPessoalResult {
  dados: RankingPessoalResponse | null;
  carregando: boolean;
  erro: string | null;
}

export function useRankingPessoal(username: string): UseRankingPessoalResult {
  const [dados, setDados] = useState<RankingPessoalResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<RankingPessoalResponse>(`/usuarios/${encodeURIComponent(username)}/ranking`)
      .then((resposta) => {
        if (!cancelado) setDados(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar o ranking pessoal.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [username]);

  return { dados, carregando, erro };
}
