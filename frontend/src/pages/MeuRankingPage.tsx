import { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { useRankingPessoal } from '../hooks/useRankingPessoal';
import { useOpinioesDeUsuario } from '../hooks/useOpinioesDeUsuario';
import { useAtualizarRankingPessoal } from '../hooks/useAtualizarRankingPessoal';
import RankingPessoalEditor from '../components/RankingPessoalEditor';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import type { Cafe } from '../types';

export default function MeuRankingPage(): React.JSX.Element {
  const { usuario } = useAuth();
  const username = usuario?.username ?? '';
  const { dados, carregando } = useRankingPessoal(username);
  const { dados: opinioesDados } = useOpinioesDeUsuario(username);
  const { atualizar, enviando, erro } = useAtualizarRankingPessoal();

  const [itens, setItens] = useState<Cafe[] | null>(null);
  const [salvo, setSalvo] = useState(false);

  useDocumentMeta({ title: `Meu ranking — ${siteConfig.nomeApp}` });

  useEffect(() => {
    if (dados && itens === null) {
      setItens(dados.items.map((item) => item.cafe));
    }
  }, [dados, itens]);

  const cafesJaOpinados = new Map<string, Cafe>();
  for (const opiniao of opinioesDados?.items ?? []) {
    cafesJaOpinados.set(opiniao.cafe.id, opiniao.cafe);
  }
  const idsNoRanking = new Set((itens ?? []).map((cafe) => cafe.id));
  const disponiveisParaAdicionar = [...cafesJaOpinados.values()].filter(
    (cafe) => !idsNoRanking.has(cafe.id),
  );

  function adicionar(cafe: Cafe): void {
    setItens((atual) => [...(atual ?? []), cafe]);
    setSalvo(false);
  }

  async function handleSalvar(): Promise<void> {
    if (!itens) return;
    await atualizar(itens.map((cafe) => cafe.id));
    setSalvo(true);
  }

  if (!usuario) {
    return <p className="p-8 text-coffee-700">Entre para organizar seu ranking pessoal.</p>;
  }

  if (carregando || itens === null) {
    return <p className="p-8 text-coffee-700">Carregando…</p>;
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-coffee-900">Meu ranking de cafés</h1>

        {itens.length === 0 && (
          <p className="text-coffee-700">
            Você ainda não tem cafés no seu ranking. Adicione um café sobre o qual já opinou abaixo.
          </p>
        )}

        {itens.length > 0 && (
          <RankingPessoalEditor
            itens={itens}
            onReordenar={(reordenados) => {
              setItens(reordenados);
              setSalvo(false);
            }}
            onSalvar={handleSalvar}
            salvando={enviando}
            erro={erro}
          />
        )}

        {salvo && <p className="text-sm text-green-600">Ranking salvo com sucesso.</p>}

        {disponiveisParaAdicionar.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-coffee-900">Adicionar ao ranking</h2>
            <ul className="flex flex-col gap-2">
              {disponiveisParaAdicionar.map((cafe) => (
                <li key={cafe.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
                  <span className="text-coffee-950">
                    {cafe.nome} <span className="text-coffee-700 text-sm">({cafe.produtor})</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Adicionar ${cafe.nome} ao ranking`}
                    onClick={() => adicionar(cafe)}
                    className="text-sm font-semibold text-amber-600"
                  >
                    Adicionar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
