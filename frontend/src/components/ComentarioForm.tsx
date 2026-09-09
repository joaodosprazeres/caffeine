import { useState } from 'react';
import type { FormEvent } from 'react';

interface ComentarioFormProps {
  onSubmit: (texto: string) => Promise<void>;
  enviando: boolean;
  erro: string | null;
}

export default function ComentarioForm({ onSubmit, enviando, erro }: ComentarioFormProps): React.JSX.Element {
  const [texto, setTexto] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit(texto);
    setTexto('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor="comentario_texto" className="text-sm text-coffee-700">
        Adicionar comentário
      </label>
      <textarea
        id="comentario_texto"
        required
        maxLength={1000}
        rows={3}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
      />
      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="self-start bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold disabled:opacity-60"
      >
        {enviando ? 'Enviando…' : 'Comentar'}
      </button>
    </form>
  );
}
