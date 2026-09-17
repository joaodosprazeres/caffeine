import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { PlusCircle, Search, Users } from 'lucide-react';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { useOpinioesDeUsuario } from '../hooks/useOpinioesDeUsuario';
import { useRankingPessoal } from '../hooks/useRankingPessoal';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useAuth } from '../services/authContext';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { siteConfig } from '../config';
import Skeleton from '../components/Skeleton';
import AvatarUsuario from '../components/AvatarUsuario';
import OpiniaoCard from '../components/OpiniaoCard';
import type { Opiniao } from '../types';

export default function PerfilPage() {
  const { username } = useParams<{ username: string }>();
  const { usuario: usuarioAutenticado } = useAuth();
  const ehProprioPerfil = usuarioAutenticado?.username === username;

  const { perfil, carregando, erro } = usePerfilUsuario(username ?? '');
  const { dados: ranking } = useRankingPessoal(username ?? '');
  const { enviarAvatar, enviando: enviandoAvatar, erro: erroAvatar } = useAvatarUpload();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [opinioes, setOpinioes] = useState<Opiniao[]>([]);
  const { dados: paginaAtual } = useOpinioesDeUsuario(username ?? '', page);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarUrl(perfil?.avatar_url ?? null);
  }, [perfil]);

  useEffect(() => {
    setPage(1);
    setOpinioes([]);
  }, [username]);

  useEffect(() => {
    if (!paginaAtual) return;
    setOpinioes((atual) =>
      paginaAtual.page === 1 ? paginaAtual.items : [...atual, ...paginaAtual.items],
    );
  }, [paginaAtual]);

  const temMaisOpinioes = paginaAtual ? opinioes.length < paginaAtual.total : false;

  useEffect(() => {
    const sentinela = sentinelRef.current;
    if (!sentinela || !temMaisOpinioes) return;

    const observer = new IntersectionObserver((entradas) => {
      if (entradas[0]?.isIntersecting) {
        setPage((atual) => atual + 1);
      }
    });
    observer.observe(sentinela);
    return () => observer.disconnect();
  }, [temMaisOpinioes]);

  async function handleSelecionarAvatar(arquivo: File): Promise<void> {
    const usuarioAtualizado = await enviarAvatar(arquivo);
    setAvatarUrl(usuarioAtualizado.avatar_url);
  }

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
            image: perfil.avatar_url ?? undefined,
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
    <main className="min-h-1/3 bg-coffee-50">
      <img
        src={siteConfig.capaPerfilPadrao}
        alt="Capa temática de grãos de café e xícara de café"
        className="w-full h-6 aspect-video object-cover"
      />
      <div className="max-w-2xl mx-auto px-4 -mt-8 flex flex-col gap-6 pb-8">
        <header className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-3">
          <div className="flex items-end gap-4">
            <AvatarUsuario
              avatarUrl={avatarUrl}
              nomeExibicao={perfil.display_name}
              tamanho="lg"
              editavel={ehProprioPerfil}
              enviando={enviandoAvatar}
              onSelecionarArquivo={handleSelecionarAvatar}
            />
            <div>
              <h1 className="text-2xl font-semibold text-coffee-900">{perfil.display_name}</h1>
              <p className="text-sm text-coffee-700">@{perfil.username}</p>
            </div>
          </div>
          {erroAvatar && (
            <p role="alert" className="text-sm text-red-600">
              {erroAvatar}
            </p>
          )}
          {perfil.bio && <p className="text-base text-coffee-950">{perfil.bio}</p>}
          <p className="text-sm text-coffee-700">
            {perfil.total_opinioes} {perfil.total_opinioes === 1 ? 'opinião publicada' : 'opiniões publicadas'}
          </p>
          
            <div className="flex flex-wrap gap-3">
              <Link
                to="/opinioes/nova"
                aria-label="Cadastrar nova opinião sobre um café"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 font-semibold"
              >
                <PlusCircle size={18} aria-hidden="true" />
                Nova opinião
              </Link>
              <Link
                to="/seguidos"
                aria-label="Ver usuários que eu sigo"
                className="inline-flex items-center gap-2 border border-coffee-300 text-coffee-900 rounded-md px-4 py-2 font-semibold"
              >
                <Users size={18} aria-hidden="true" />
                Quem eu sigo
              </Link>
              <Link
                to="/buscar-usuarios"
                aria-label="Buscar outros usuários para seguir"
                className="inline-flex items-center gap-2 border border-coffee-300 text-coffee-900 rounded-md px-4 py-2 font-semibold"
              >
                <Search size={18} aria-hidden="true" />
                Buscar usuários
              </Link>
            </div>
          
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
          {opinioes.length === 0 && <p className="text-coffee-700">Nenhuma opinião publicada ainda.</p>}
          <ul className="flex flex-col gap-3">
            {opinioes.map((opiniao) => (
              <OpiniaoCard key={opiniao.id} opiniao={opiniao} />
            ))}
          </ul>
          {temMaisOpinioes && <div ref={sentinelRef} aria-hidden="true" className="h-1" />}
        </section>
      </div>
    </main>
  );
}
