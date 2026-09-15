import { useNavigate } from 'react-router';
import OpiniaoForm from '../components/OpiniaoForm';
import { useCriarOpiniao } from '../hooks/useCriarOpiniao';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useAuth } from '../services/authContext';
import { siteConfig } from '../config';
import type { OpiniaoCreateRequest } from '../types';

export default function NovaOpiniaoPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { criar, enviando, erro } = useCriarOpiniao();

  useDocumentMeta({
    title: `Publicar opinião — ${siteConfig.nomeApp}`,
    description: 'Publique sua opinião sobre um café: produtor, grão especial, torra e o que você achou.',
  });

  async function handleSubmit(dados: OpiniaoCreateRequest): Promise<void> {
    await criar(dados);
    navigate(`/u/${usuario?.username}`);
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8 flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-coffee-900 mb-6">Publicar opinião</h1>
        <OpiniaoForm onSubmit={handleSubmit} enviando={enviando} erro={erro} />
      </div>
    </main>
  );
}
