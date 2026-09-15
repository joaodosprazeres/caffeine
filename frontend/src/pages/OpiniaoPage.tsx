import { useParams } from 'react-router';
import { useAuth } from '../services/authContext';
import { useOpiniao } from '../hooks/useOpiniao';
import { useComentarOpiniao } from '../hooks/useComentarOpiniao';
import { useDarNota } from '../hooks/useDarNota';
import ComentarioForm from '../components/ComentarioForm';
import NotaSelector from '../components/NotaSelector';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import Skeleton from '../components/Skeleton';

export default function OpiniaoPage(): React.JSX.Element {
  const { opiniaoId } = useParams<{ opiniaoId: string }>();
  const { usuario } = useAuth();
  const { opiniao, carregando, erro, recarregar } = useOpiniao(opiniaoId ?? '');
  const { comentar, enviando: enviandoComentario, erro: erroComentario } = useComentarOpiniao();
  const { darNota, enviando: enviandoNota, erro: erroNota } = useDarNota();

  useDocumentMeta({
    title: opiniao
      ? `${opiniao.cafe.nome} por ${opiniao.autor.display_name} — ${siteConfig.nomeApp}`
      : siteConfig.nomeApp,
    description: opiniao?.texto,
    jsonLd: opiniao
      ? {
          '@context': 'https://schema.org',
          '@type': 'Review',
          itemReviewed: { '@type': 'Product', name: opiniao.cafe.nome, brand: opiniao.cafe.produtor },
          author: { '@type': 'Person', name: opiniao.autor.display_name },
          reviewBody: opiniao.texto,
          ...(opiniao.nota_media != null
            ? {
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: opiniao.nota_media,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
        }
      : undefined,
  });

  if (carregando) {
    return (
      <main className="p-8">
        <Skeleton linhas={4} className="h-6" />
      </main>
    );
  }

  if (erro || !opiniao) {
    return (
      <p role="alert" className="p-8 text-red-600">
        {erro ?? 'Opinião não encontrada.'}
      </p>
    );
  }

  const ehAutor = usuario !== null && usuario.username === opiniao.autor.username;
  const podeInteragir = usuario !== null && !ehAutor;

  async function handleComentar(texto: string): Promise<void> {
    await comentar(opiniao!.id, { texto });
    recarregar();
  }

  async function handleNota(valor: number): Promise<void> {
    await darNota(opiniao!.id, valor);
    recarregar();
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8 flex justify-center">
      <article className="w-full max-w-lg bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
        <header>
          <h1 className="text-2xl font-semibold text-coffee-900">{opiniao.cafe.nome}</h1>
          <p className="text-sm text-coffee-700">Produtor: {opiniao.cafe.produtor}</p>
          <p className="text-sm text-coffee-700">
            Grão especial: {opiniao.grao_especial} · Torra: {opiniao.torra}
          </p>
          <p className="text-sm text-coffee-500">por {opiniao.autor.display_name}</p>
        </header>

        {opiniao.imagem_embalagem_url && (
          <img
            src={opiniao.imagem_embalagem_url}
            alt={`Embalagem do café ${opiniao.cafe.nome}`}
            className="w-full rounded-md object-cover"
          />
        )}

        <p className="text-base text-coffee-950">{opiniao.texto}</p>

        {opiniao.nota_autor != null && (
          <p className="text-sm text-amber-700">Nota do autor para este café: {opiniao.nota_autor}/5</p>
        )}

        <p className="text-sm text-coffee-700">
          Nota média: {opiniao.nota_media != null ? opiniao.nota_media.toFixed(1) : '—'} (
          {opiniao.total_notas} {opiniao.total_notas === 1 ? 'nota' : 'notas'})
        </p>

        {podeInteragir && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-coffee-900">Sua nota</h2>
            <NotaSelector
              valorAtual={opiniao.nota_do_usuario_atual}
              onSelecionar={handleNota}
              desabilitado={enviandoNota}
            />
            {erroNota && (
              <p role="alert" className="text-sm text-red-600">
                {erroNota}
              </p>
            )}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-coffee-900">
            Comentários ({opiniao.comentarios.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {opiniao.comentarios.map((comentario) => (
              <li key={comentario.id} className="border border-coffee-100 rounded-md p-3">
                <p className="text-sm font-semibold text-coffee-900">{comentario.autor.display_name}</p>
                <p className="text-base text-coffee-950">{comentario.texto}</p>
              </li>
            ))}
          </ul>
          {podeInteragir && (
            <ComentarioForm onSubmit={handleComentar} enviando={enviandoComentario} erro={erroComentario} />
          )}
        </section>
      </article>
    </main>
  );
}
