import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { Opiniao, OpiniaoCreateRequest } from '../types';

interface UseCriarOpiniaoResult {
  criar: (dados: OpiniaoCreateRequest) => Promise<Opiniao>;
  enviando: boolean;
  erro: string | null;
}

export function useCriarOpiniao(): UseCriarOpiniaoResult {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const criar = useCallback(async (dados: OpiniaoCreateRequest): Promise<Opiniao> => {
    setEnviando(true);
    setErro(null);
    try {
      return await apiFetch<Opiniao>('/opinioes', { method: 'POST', body: dados });
    } catch (err) {
      const mensagem = err instanceof ApiRequestError ? err.message : 'Não foi possível publicar a opinião.';
      setErro(mensagem);
      throw err;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { criar, enviando, erro };
}
