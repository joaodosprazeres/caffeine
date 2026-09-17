import { Link } from 'react-router';
import { useRankingGeral } from '../hooks/useRankingGeral';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import Skeleton from '../components/Skeleton';

export default function RankingGeralPage(): React.JSX.Element {
  const page = 1;
  const { dados, carregando, erro } = useRankingGeral(page);

  useDocumentMeta({
    title: siteConfig.nomeApp,
    description: siteConfig.descricaoPadrao,
  });

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-coffee-900">{siteConfig.nomeApp}</h1>
            <p className="text-sm text-coffee-700">{siteConfig.tagline}</p>
          </div>
          <Link
            to="/opinioes/nova"
            aria-label="Publicar uma nova opinião sobre um café"
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold"
          >
            Publicar opinião
          </Link>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-coffee-900 mb-4">Ranking geral</h2>

          {carregando && <Skeleton linhas={5} className="h-16" />}
          {erro && (
            <p role="alert" className="text-red-600">
              {erro}
            </p>
          )}

          {dados && dados.items.length === 0 && (
            <p className="text-coffee-700">
              Nenhum café avaliado ainda. Seja o primeiro a{' '}
              <Link to="/opinioes/nova" aria-label="Publicar a primeira opinião" className="text-amber-600 font-semibold">
                publicar uma opinião
              </Link>
              .
            </p>
          )}

          {dados && dados.items.length > 0 && (
            <ol className="flex flex-col gap-3">
              {dados.items.map((entrada, indice) => (
                <li key={entrada.cafe.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
                  <span className="text-xl font-bold text-coffee-500 w-8">{(page - 1) * dados.page_size + indice + 1}</span>
                  <div className="flex-1">
                    <Link
                      to={`/cafes/${entrada.cafe.id}`}
                      aria-label={`Ver consolidado de ${entrada.cafe.nome}`}
                      className="text-lg font-semibold text-coffee-900"
                    >
                      {entrada.cafe.nome}
                    </Link>
                    <p className="text-sm text-coffee-700">Produtor: {entrada.cafe.produtor}</p>
                  </div>
                  <span className="text-sm text-coffee-700">
                    {entrada.nota_media != null ? entrada.nota_media.toFixed(1) : '—'} ★ ({entrada.total_notas})
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
