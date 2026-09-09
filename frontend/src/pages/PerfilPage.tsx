import { Link, useParams } from 'react-router';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { useOpinioesDeUsuario } from '../hooks/useOpinioesDeUsuario';
import { useRankingPessoal } from '../hooks/useRankingPessoal';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import Skeleton from '../components/Skeleton';

export default function PerfilPage(): React.JSX.Element {
  const { username } = useParams<{ username: string }>();
  const { perfil, carregando, erro } = usePerfilUsuario(username ?? '');
  const { dados: opinioes } = useOpinioesDeUsuario(username ?? '');
  const { dados: ranking } = useRankingPessoal(username ?? '');

  useDocumentMeta({
    title: perfil ? `${perfil.display_name} (@${perfil.username}) — ${siteConfig.nomeApp}` : siteConfig.nomeApp,
    description: perfil?.bio ?? undefined,
    jsonLd: perfil
      ? {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: perfil.display_name,
            alternateName: perfil.username,
            description: perfil.bio ?? undefined,
          },
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

  if (erro || !perfil) {
    return (
      <p role="alert" className="p-8 text-red-600">
        {erro ?? 'Usuário não encontrado.'}
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <header className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-coffee-900">{perfil.display_name}</h1>
          <p className="text-sm text-coffee-700">@{perfil.username}</p>
          {perfil.bio && <p className="text-base text-coffee-950 mt-2">{perfil.bio}</p>}
          <p className="text-sm text-coffee-700 mt-2">
            {perfil.total_opinioes} {perfil.total_opinioes === 1 ? 'opinião publicada' : 'opiniões publicadas'}
          </p>
        </header>

        {ranking && ranking.items.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-coffee-900 mb-3">Ranking pessoal</h2>
            <ol className="flex flex-col gap-2">
              {ranking.items.map((item) => (
                <li key={item.cafe.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3">
                  <span className="text-lg font-bold text-coffee-500 w-6">{item.posicao}</span>
                  <Link
                    to={`/cafes/${item.cafe.id}`}
                    aria-label={`Ver consolidado de ${item.cafe.nome}`}
                    className="text-coffee-950"
                  >
                    {item.cafe.nome}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-coffee-900 mb-3">Opiniões</h2>
          {opinioes && opinioes.items.length === 0 && (
            <p className="text-coffee-700">Nenhuma opinião publicada ainda.</p>
          )}
          <ul className="flex flex-col gap-3">
            {opinioes?.items.map((opiniao) => (
              <li key={opiniao.id} className="bg-white rounded-lg shadow-sm p-4">
                <Link
                  to={`/opinioes/${opiniao.id}`}
                  aria-label={`Ver opinião sobre ${opiniao.cafe.nome}`}
                  className="text-sm font-semibold text-coffee-900"
                >
                  {opiniao.cafe.nome}
                </Link>
                <p className="text-sm text-coffee-700">Produtor: {opiniao.cafe.produtor}</p>
                <p className="text-base text-coffee-950 mt-1">{opiniao.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
