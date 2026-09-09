import { useState } from 'react';
import type { FormEvent } from 'react';
import type { OpiniaoCreateRequest, Torra } from '../types';

interface OpiniaoFormProps {
  onSubmit: (dados: OpiniaoCreateRequest) => Promise<void>;
  enviando: boolean;
  erro: string | null;
}

const TORRAS: { valor: Torra; rotulo: string }[] = [
  { valor: 'clara', rotulo: 'Clara' },
  { valor: 'media', rotulo: 'Média' },
  { valor: 'escura', rotulo: 'Escura' },
];

export default function OpiniaoForm({ onSubmit, enviando, erro }: OpiniaoFormProps): React.JSX.Element {
  const [cafeNome, setCafeNome] = useState('');
  const [cafeProdutor, setCafeProdutor] = useState('');
  const [graoEspecial, setGraoEspecial] = useState('');
  const [torra, setTorra] = useState<Torra>('media');
  const [texto, setTexto] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit({
      cafe_nome: cafeNome,
      cafe_produtor: cafeProdutor,
      grao_especial: graoEspecial,
      torra,
      texto,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="cafe_nome" className="text-sm text-coffee-700">
          Nome do café
        </label>
        <input
          id="cafe_nome"
          type="text"
          required
          maxLength={120}
          value={cafeNome}
          onChange={(event) => setCafeNome(event.target.value)}
          className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="cafe_produtor" className="text-sm text-coffee-700">
          Produtor
        </label>
        <input
          id="cafe_produtor"
          type="text"
          required
          maxLength={120}
          value={cafeProdutor}
          onChange={(event) => setCafeProdutor(event.target.value)}
          className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="grao_especial" className="text-sm text-coffee-700">
          Grão especial
        </label>
        <input
          id="grao_especial"
          type="text"
          required
          maxLength={120}
          value={graoEspecial}
          onChange={(event) => setGraoEspecial(event.target.value)}
          className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="torra" className="text-sm text-coffee-700">
          Torra
        </label>
        <select
          id="torra"
          required
          value={torra}
          onChange={(event) => setTorra(event.target.value as Torra)}
          className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
        >
          {TORRAS.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="texto" className="text-sm text-coffee-700">
          Sua opinião
        </label>
        <textarea
          id="texto"
          required
          maxLength={2000}
          rows={5}
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
        />
      </div>
      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold disabled:opacity-60"
      >
        {enviando ? 'Publicando…' : 'Publicar opinião'}
      </button>
    </form>
  );
}
