import { useEffect, useState } from 'react';
import { apiFetch, ApiRequestError } from '../services/api';
import type { PerfilUsuario } from '../types';

interface UsePerfilUsuarioResult {
  perfil: PerfilUsuario | null;
  carregando: boolean;
  erro: string | null;
}

export function usePerfilUsuario(username: string): UsePerfilUsuarioResult {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);

    apiFetch<PerfilUsuario>(`/usuarios/${encodeURIComponent(username)}`)
      .then((resposta) => {
        if (!cancelado) setPerfil(resposta);
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar o perfil.');
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [username]);

  return { perfil, carregando, erro };
}
