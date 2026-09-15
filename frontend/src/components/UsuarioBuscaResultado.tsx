import { Link } from 'react-router';
import AvatarUsuario from './AvatarUsuario';
import type { UsuarioBusca } from '../types';

interface UsuarioBuscaResultadoProps {
  usuario: UsuarioBusca;
  processando: boolean;
  onSeguir: (username: string) => void;
  onDeixarDeSeguir: (username: string) => void;
}

export default function UsuarioBuscaResultado({
  usuario,
  processando,
  onSeguir,
  onDeixarDeSeguir,
}: UsuarioBuscaResultadoProps): React.JSX.Element {
  return (
    <li className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
      <AvatarUsuario avatarUrl={usuario.avatar_url} nomeExibicao={usuario.display_name} tamanho="sm" />
      <Link
        to={`/u/${usuario.username}`}
        aria-label={`Ver perfil de ${usuario.display_name}`}
        className="flex-1 min-w-0"
      >
        <p className="text-sm font-semibold text-coffee-900">{usuario.display_name}</p>
        <p className="text-sm text-coffee-700">@{usuario.username}</p>
      </Link>
      {usuario.ja_seguido ? (
        <button
          type="button"
          disabled={processando}
          aria-label={`Deixar de seguir ${usuario.display_name}`}
          onClick={() => onDeixarDeSeguir(usuario.username)}
          className="border border-coffee-300 text-coffee-900 rounded-md px-3 py-1 text-sm font-semibold disabled:opacity-60"
        >
          Seguindo
        </button>
      ) : (
        <button
          type="button"
          disabled={processando}
          aria-label={`Seguir ${usuario.display_name}`}
          onClick={() => onSeguir(usuario.username)}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-3 py-1 text-sm font-semibold disabled:opacity-60"
        >
          Seguir
        </button>
      )}
    </li>
  );
}
