import { useCallback, useState } from 'react';
import { apiFetchMultipart, ApiRequestError } from '../services/api';
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
      const formData = new FormData();
      formData.append('cafe_nome', dados.cafe_nome);
      formData.append('cafe_produtor', dados.cafe_produtor);
      formData.append('grao_especial', dados.grao_especial);
      formData.append('torra', dados.torra);
      formData.append('texto', dados.texto);
      if (dados.nota_autor != null) {
        formData.append('nota_autor', String(dados.nota_autor));
      }
      if (dados.imagem_embalagem) {
        formData.append('imagem_embalagem', dados.imagem_embalagem);
      }
      return await apiFetchMultipart<Opiniao>('/opinioes', formData);
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
