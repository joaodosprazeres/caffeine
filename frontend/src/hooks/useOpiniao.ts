import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { OpiniaoDetalhe } from '../types';

interface UseOpiniaoResult {
  opiniao: OpiniaoDetalhe | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useOpiniao(opiniaoId: string): UseOpiniaoResult {
  const [opiniao, setOpiniao] = useState<OpiniaoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<OpiniaoDetalhe>(`/opinioes/${opiniaoId}`)
      .then((resposta) => {
        if (!cancelado) setOpiniao(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar a opinião.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [opiniaoId, versao]);

  return { opiniao, carregando, erro, recarregar };
}
