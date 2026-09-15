import { useEffect } from 'react';
import { Link } from 'react-router';
import { UserPlus } from 'lucide-react';
import { useSeguidores } from '../hooks/useSeguidores';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';
import AvatarUsuario from '../components/AvatarUsuario';
import Skeleton from '../components/Skeleton';

export default function SeguidosPage(): React.JSX.Element {
  const { seguidos, carregandoSeguidos, erro, carregarSeguidos } = useSeguidores();

  useDocumentMeta({
    title: `Quem eu sigo — ${siteConfig.nomeApp}`,
    description: 'Usuários que você segue no Caffeine.',
  });

  useEffect(() => {
    carregarSeguidos();
  }, [carregarSeguidos]);

  return (
    <main className="min-h-screen bg-coffee-50 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-coffee-900">Quem eu sigo</h1>

        {carregandoSeguidos && <Skeleton linhas={3} className="h-6" />}

        {erro && (
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>
        )}

        {!carregandoSeguidos && seguidos && seguidos.items.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center gap-3 text-center">
            <UserPlus size={32} className="text-coffee-500" aria-hidden="true" />
            <p className="text-coffee-700">Você ainda não segue ninguém.</p>
            <Link
              to="/buscar-usuarios"
              aria-label="Buscar usuários para seguir"
              className="text-amber-600 font-semibold"
            >
              Buscar usuários para seguir
            </Link>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {seguidos?.items.map((usuario) => (
            <li key={usuario.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
              <AvatarUsuario avatarUrl={usuario.avatar_url} nomeExibicao={usuario.display_name} tamanho="sm" />
              <Link
                to={`/u/${usuario.username}`}
                aria-label={`Ver perfil de ${usuario.display_name}`}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-coffee-900">{usuario.display_name}</p>
                <p className="text-sm text-coffee-700">@{usuario.username}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
