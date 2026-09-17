import { useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { RankingGeralResponse } from '../types';

interface UseRankingGeralResult {
  dados: RankingGeralResponse | null;
  carregando: boolean;
  erro: string | null;
}

export function useRankingGeral(page = 1): UseRankingGeralResult {
  const [dados, setDados] = useState<RankingGeralResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<RankingGeralResponse>('/ranking-geral', { query: { page } })
      .then((resposta) => {
        if (!cancelado) setDados(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar o ranking.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [page]);

  return { dados, carregando, erro };
}
