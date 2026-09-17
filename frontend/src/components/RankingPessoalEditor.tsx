import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Cafe } from '../types';

interface RankingPessoalEditorProps {
  itens: Cafe[];
  onReordenar: (itensReordenados: Cafe[]) => void;
  onSalvar: () => void;
  salvando: boolean;
  erro: string | null;
}

export default function RankingPessoalEditor({
  itens,
  onReordenar,
  onSalvar,
  salvando,
  erro,
}: RankingPessoalEditorProps): React.JSX.Element {
  function mover(indice: number, direcao: -1 | 1): void {
    const destino = indice + direcao;
    if (destino < 0 || destino >= itens.length) return;

    const copia = [...itens];
    const [item] = copia.splice(indice, 1);
    copia.splice(destino, 0, item);
    onReordenar(copia);
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        {itens.map((cafe, indice) => (
          <li
            key={cafe.id}
            className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3"
          >
            <span className="text-lg font-bold text-coffee-500 w-6">{indice + 1}</span>
            <span className="flex-1 text-coffee-950">
              {cafe.nome} <span className="text-coffee-700 text-sm">({cafe.produtor})</span>
            </span>
            <button
              type="button"
              aria-label={`Mover ${cafe.nome} para cima`}
              disabled={indice === 0}
              onClick={() => mover(indice, -1)}
              className="p-2 rounded-md border border-coffee-300 disabled:opacity-40"
            >
              <ArrowUp size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Mover ${cafe.nome} para baixo`}
              disabled={indice === itens.length - 1}
              onClick={() => mover(indice, 1)}
              className="p-2 rounded-md border border-coffee-300 disabled:opacity-40"
            >
              <ArrowDown size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
      <button
        type="button"
        onClick={onSalvar}
        disabled={salvando}
        className="self-start bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : 'Salvar ranking'}
      </button>
    </div>
  );
}
