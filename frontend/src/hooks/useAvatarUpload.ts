import { useCallback, useState } from 'react';
import { apiFetchMultipart, ApiRequestError } from '../services/api';
import type { Usuario } from '../types';

interface UseAvatarUploadResult {
  enviarAvatar: (arquivo: File) => Promise<Usuario>;
  enviando: boolean;
  erro: string | null;
}

export function useAvatarUpload(): UseAvatarUploadResult {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviarAvatar = useCallback(async (arquivo: File): Promise<Usuario> => {
    setEnviando(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      return await apiFetchMultipart<Usuario>('/usuarios/me/avatar', formData);
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível enviar o avatar.');
      throw err;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { enviarAvatar, enviando, erro };
}
