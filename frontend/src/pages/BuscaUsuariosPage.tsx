import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useBuscaUsuarios } from '../hooks/useBuscaUsuarios';
import { useSeguidores } from '../hooks/useSeguidores';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import UsuarioBuscaResultado from '../components/UsuarioBuscaResultado';
import type { UsuarioBusca } from '../types';

export default function BuscaUsuariosPage(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [jaBuscou, setJaBuscou] = useState(false);
  const [itens, setItens] = useState<UsuarioBusca[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);
  const { resultado, buscar, buscando, erro } = useBuscaUsuarios();
  const { seguir, deixarDeSeguir } = useSeguidores();

  useDocumentMeta({
    title: `Buscar usuários — ${siteConfig.nomeApp}`,
    description: 'Encontre outros usuários do Caffeine para seguir e acompanhar suas opiniões sobre cafés.',
  });

  useEffect(() => {
    if (resultado) setItens(resultado.items);
  }, [resultado]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!query.trim()) return;
    setJaBuscou(true);
    await buscar(query.trim());
  }

  function atualizarJaSeguido(username: string, jaSeguido: boolean): void {
    setItens((atual) =>
      atual.map((item) => (item.username === username ? { ...item, ja_seguido: jaSeguido } : item)),
    );
  }

  async function handleSeguir(username: string): Promise<void> {
    setProcessando(username);
    try {
      await seguir(username);
      atualizarJaSeguido(username, true);
    } finally {
      setProcessando(null);
    }
  }

  async function handleDeixarDeSeguir(username: string): Promise<void> {
    setProcessando(username);
    try {
      await deixarDeSeguir(username);
      atualizarJaSeguido(username, false);
    } finally {
      setProcessando(null);
    }
  }

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-coffee-900">Buscar usuários</h1>
        <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
          <label htmlFor="busca-usuarios" className="sr-only">
            Buscar por nome de usuário ou nome de exibição
          </label>
          <input
            id="busca-usuarios"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome de usuário ou nome de exibição"
            className="flex-1 border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
          />
          <button
            type="submit"
            disabled={buscando}
            aria-label="Buscar usuários"
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold disabled:opacity-60 flex items-center gap-2"
          >
            <Search size={18} aria-hidden="true" />
            Buscar
          </button>
        </form>

        {erro && (
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>
        )}

        {jaBuscou && !buscando && itens.length === 0 && !erro && (
          <p className="text-coffee-700">Nenhum usuário encontrado para "{query}".</p>
        )}

        <ul className="flex flex-col gap-3">
          {itens.map((usuario) => (
            <UsuarioBuscaResultado
              key={usuario.id}
              usuario={usuario}
              processando={processando === usuario.username}
              onSeguir={handleSeguir}
              onDeixarDeSeguir={handleDeixarDeSeguir}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
