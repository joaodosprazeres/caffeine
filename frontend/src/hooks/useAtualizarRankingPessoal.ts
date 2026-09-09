import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { RankingPessoalResponse } from '../types';

interface UseAtualizarRankingPessoalResult {
  atualizar: (cafeIdsEmOrdem: string[]) => Promise<RankingPessoalResponse>;
  enviando: boolean;
  erro: string | null;
}

export function useAtualizarRankingPessoal(): UseAtualizarRankingPessoalResult {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atualizar = useCallback(async (cafeIdsEmOrdem: string[]): Promise<RankingPessoalResponse> => {
    setEnviando(true);
    setErro(null);
    try {
      return await apiFetch<RankingPessoalResponse>('/usuarios/me/ranking', {
        method: 'PUT',
        body: { cafe_ids_em_ordem: cafeIdsEmOrdem },
      });
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível atualizar o ranking.');
      throw err;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { atualizar, enviando, erro };
}
