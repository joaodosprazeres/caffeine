import { Link, useNavigate } from 'react-router';
import { Coffee, LogOut, Trophy, UserRound } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { siteConfig } from '../config';

export default function NavegacaoPrincipal(): React.JSX.Element {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleSair(): void {
    logout();
    navigate('/');
  }

  return (
    <header className="bg-coffee-900 text-white">
      <nav className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          aria-label={`Ir para a página inicial do ${siteConfig.nomeApp}`}
          className="flex items-center gap-2 font-semibold"
        >
          <Coffee size={20} aria-hidden="true" />
          {siteConfig.nomeApp}
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Ver ranking geral" className="flex items-center gap-1 text-sm">
            <Trophy size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Ranking geral</span>
          </Link>
          {usuario ? (
            <>
              <Link
                to={`/u/${usuario.username}`}
                aria-label="Ir para o meu perfil"
                className="flex items-center gap-1 text-sm"
              >
                <UserRound size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Meu perfil</span>
              </Link>
              <button
                type="button"
                onClick={handleSair}
                aria-label="Sair da conta"
                className="flex items-center gap-1 text-sm"
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <Link to="/login" aria-label="Entrar na conta" className="flex items-center gap-1 text-sm">
              <UserRound size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
