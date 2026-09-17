import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../services/authContext';
import { ApiRequestError } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { siteConfig } from '../config';

export default function RegistroPage(): React.JSX.Element {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useDocumentMeta({
    title: `Criar conta — ${siteConfig.nomeApp}`,
    description: 'Crie sua conta para publicar opiniões sobre cafés e participar da comunidade.',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await registrar({
        email,
        username,
        display_name: displayName,
        password,
      });
      navigate('/');
    } catch (err) {
      setErro(err instanceof ApiRequestError ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-coffee-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-coffee-900 mb-6">Criar conta</h1>
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
            <label htmlFor="username" className="text-sm text-coffee-700">
              Nome de usuário
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="border border-coffee-300 rounded-md px-3 py-2 text-base text-coffee-950"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="display_name" className="text-sm text-coffee-700">
              Nome de exibição
            </label>
            <input
              id="display_name"
              type="text"
              required
              maxLength={80}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
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
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>
        <p className="mt-4 text-sm text-coffee-700">
          Já tem conta?{' '}
          <Link to="/login" aria-label="Ir para a página de login" className="text-amber-600 font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
