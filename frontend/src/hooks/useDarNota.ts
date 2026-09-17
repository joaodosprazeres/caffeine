import { useCallback, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { Nota } from '../types';

interface UseDarNotaResult {
  darNota: (opiniaoId: string, valor: number) => Promise<Nota>;
  enviando: boolean;
  erro: string | null;
}

export function useDarNota(): UseDarNotaResult {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const darNota = useCallback(async (opiniaoId: string, valor: number): Promise<Nota> => {
    setEnviando(true);
    setErro(null);
    try {
      return await apiFetch<Nota>(`/opinioes/${opiniaoId}/nota`, {
        method: 'PUT',
        body: { valor },
      });
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível registrar a nota.');
      throw err;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { darNota, enviando, erro };
}
