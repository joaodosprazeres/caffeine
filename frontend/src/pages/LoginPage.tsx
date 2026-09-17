import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../services/authContext';
import { ApiRequestError } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';

export default function LoginPage(): React.JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useDocumentMeta({
    title: `Entrar — ${siteConfig.nomeApp}`,
    description: 'Entre na sua conta para publicar opiniões, comentar e notar cafés.',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const usuarioAutenticado = await login({ email, password });
      navigate(`/u/${usuarioAutenticado.username}`);
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-coffee-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-coffee-900 mb-6">Entrar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-coffee-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-coffee-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-sm text-coffee-700">
          Ainda não tem conta?{' '}
          <Link to="/registro" aria-label="Ir para a página de registro" className="text-amber-600 font-semibold">
            Registre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
