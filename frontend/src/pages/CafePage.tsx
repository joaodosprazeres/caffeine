import { Link, useParams } from 'react-router';
import { useCafeConsolidado } from '../hooks/useCafeConsolidado';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import Skeleton from '../components/Skeleton';

export default function CafePage(): React.JSX.Element {
  const { cafeId } = useParams<{ cafeId: string }>();
  const { cafe, carregando, erro } = useCafeConsolidado(cafeId ?? '');

  useDocumentMeta({
    title: cafe ? `${cafe.nome} — ${siteConfig.nomeApp}` : siteConfig.nomeApp,
    description: cafe ? `Consolidado de opiniões sobre ${cafe.nome}, de ${cafe.produtor}.` : undefined,
    jsonLd: cafe
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: cafe.nome,
          brand: { '@type': 'Brand', name: cafe.produtor },
          ...(cafe.nota_media != null
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: cafe.nota_media,
                  reviewCount: cafe.total_notas,
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

  if (erro || !cafe) {
    return (
      <p role="alert" className="p-8 text-red-600">
        {erro ?? 'Café não encontrado.'}
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <header className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-coffee-900">{cafe.nome}</h1>
          <p className="text-sm text-coffee-700">Produtor: {cafe.produtor}</p>
          {cafe.grao_especial_atual && (
            <p className="text-sm text-coffee-700">
              Grão especial mais recente: {cafe.grao_especial_atual} · Torra: {cafe.torra_atual}
            </p>
          )}
          <p className="text-sm text-coffee-700 mt-2">
            Nota média: {cafe.nota_media != null ? cafe.nota_media.toFixed(1) : '—'} ({cafe.total_notas}{' '}
            {cafe.total_notas === 1 ? 'nota' : 'notas'}) · {cafe.total_opinioes}{' '}
            {cafe.total_opinioes === 1 ? 'opinião' : 'opiniões'}
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-coffee-900">Opiniões</h2>
          {cafe.opinioes.length === 0 && <p className="text-coffee-700">Nenhuma opinião ainda.</p>}
          <ul className="flex flex-col gap-3">
            {cafe.opinioes.map((opiniao) => (
              <li key={opiniao.id} className="bg-white rounded-lg shadow-sm p-4">
                <Link
                  to={`/opinioes/${opiniao.id}`}
                  aria-label={`Ver opinião de ${opiniao.autor.display_name} sobre ${cafe.nome}`}
                  className="text-sm font-semibold text-coffee-900"
                >
                  {opiniao.autor.display_name}
                </Link>
                <p className="text-sm text-coffee-700">
                  Grão: {opiniao.grao_especial} · Torra: {opiniao.torra}
                </p>
                <p className="text-base text-coffee-950 mt-1">{opiniao.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
