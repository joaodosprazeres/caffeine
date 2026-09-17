import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { Comentario, ComentarioCreateRequest } from '../types';

interface UseComentarOpiniaoResult {
  comentar: (opiniaoId: string, dados: ComentarioCreateRequest) => Promise<Comentario>;
  enviando: boolean;
  erro: string | null;
}

export function useComentarOpiniao(): UseComentarOpiniaoResult {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const comentar = useCallback(
    async (opiniaoId: string, dados: ComentarioCreateRequest): Promise<Comentario> => {
      setEnviando(true);
      setErro(null);
      try {
        return await apiFetch<Comentario>(`/opinioes/${opiniaoId}/comentarios`, {
          method: 'POST',
          body: dados,
        });
      } catch (err) {
        setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível comentar.');
        throw err;
      } finally {
        setEnviando(false);
      }
    },
    [],
  );

  return { comentar, enviando, erro };
}
