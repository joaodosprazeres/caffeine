import { useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { CafeConsolidado } from '../types';

interface UseCafeConsolidadoResult {
  cafe: CafeConsolidado | null;
  carregando: boolean;
  erro: string | null;
}

export function useCafeConsolidado(cafeId: string): UseCafeConsolidadoResult {
  const [cafe, setCafe] = useState<CafeConsolidado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<CafeConsolidado>(`/cafes/${cafeId}`)
      .then((resposta) => {
        if (!cancelado) setCafe(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar o café.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cafeId]);

  return { cafe, carregando, erro };
}
