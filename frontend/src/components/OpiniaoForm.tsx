import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { OpiniaoCreateRequest, Torra } from '../types';
import NotaSelector from './NotaSelector';

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

const TIPOS_IMAGEM_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

export default function OpiniaoForm({ onSubmit, enviando, erro }: OpiniaoFormProps): React.JSX.Element {
  const [cafeNome, setCafeNome] = useState('');
  const [cafeProdutor, setCafeProdutor] = useState('');
  const [graoEspecial, setGraoEspecial] = useState('');
  const [torra, setTorra] = useState<Torra>('media');
  const [texto, setTexto] = useState('');
  const [notaAutor, setNotaAutor] = useState<number | null>(null);
  const [imagemEmbalagem, setImagemEmbalagem] = useState<File | null>(null);
  const [erroImagem, setErroImagem] = useState<string | null>(null);

  function handleSelecionarImagem(event: ChangeEvent<HTMLInputElement>): void {
    const arquivo = event.target.files?.[0] ?? null;
    if (!arquivo) {
      setImagemEmbalagem(null);
      setErroImagem(null);
      return;
    }
    if (!TIPOS_IMAGEM_ACEITOS.includes(arquivo.type)) {
      setErroImagem('Envie uma imagem em JPEG, PNG ou WebP.');
      setImagemEmbalagem(null);
      event.target.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      setErroImagem('A imagem deve ter no máximo 5MB.');
      setImagemEmbalagem(null);
      event.target.value = '';
      return;
    }
    setErroImagem(null);
    setImagemEmbalagem(arquivo);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit({
      cafe_nome: cafeNome,
      cafe_produtor: cafeProdutor,
      grao_especial: graoEspecial,
      torra,
      texto,
      nota_autor: notaAutor,
      imagem_embalagem: imagemEmbalagem,
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
      <div className="flex flex-col gap-1">
        <label htmlFor="imagem_embalagem" className="text-sm text-coffee-700">
          Foto da embalagem (opcional)
        </label>
        <input
          id="imagem_embalagem"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Selecionar foto da embalagem do café"
          onChange={handleSelecionarImagem}
          className="text-sm text-coffee-700"
        />
        {erroImagem && (
          <p role="alert" className="text-sm text-red-600">
            {erroImagem}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm text-coffee-700">Sua nota para este café (opcional)</span>
        <NotaSelector valorAtual={notaAutor} onSelecionar={setNotaAutor} desabilitado={enviando} />
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
