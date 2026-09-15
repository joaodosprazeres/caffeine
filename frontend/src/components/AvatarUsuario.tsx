import { Camera, User } from 'lucide-react';
import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { siteConfig } from '../config';

interface AvatarUsuarioProps {
  avatarUrl: string | null;
  nomeExibicao: string;
  tamanho?: 'sm' | 'lg';
  editavel?: boolean;
  enviando?: boolean;
  onSelecionarArquivo?: (arquivo: File) => void;
}

const TAMANHOS: Record<'sm' | 'lg', string> = {
  sm: 'w-8 h-8',
  lg: 'w-16 h-16',
};

const TAMANHO_ICONE: Record<'sm' | 'lg', number> = {
  sm: 16,
  lg: 32,
};

export default function AvatarUsuario({
  avatarUrl,
  nomeExibicao,
  tamanho = 'sm',
  editavel = false,
  enviando = false,
  onSelecionarArquivo,
}: AvatarUsuarioProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const arquivo = event.target.files?.[0];
    if (arquivo && onSelecionarArquivo) {
      onSelecionarArquivo(arquivo);
    }
    event.target.value = '';
  }

  return (
    <div className={`relative ${TAMANHOS[tamanho]} shrink-0`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${nomeExibicao}`}
          className={`${TAMANHOS[tamanho]} rounded-full object-cover border border-coffee-100`}
        />
      ) : (
        <div
          className={`${TAMANHOS[tamanho]} rounded-full bg-coffee-300 border border-coffee-100 flex items-center justify-center`}
          role="img"
          aria-label={siteConfig.avatarPlaceholderAlt}
        >
          <User size={TAMANHO_ICONE[tamanho]} className="text-coffee-900" aria-hidden="true" />
        </div>
      )}
      {editavel && (
        <>
          <button
            type="button"
            aria-label="Alterar foto de perfil"
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center disabled:opacity-60"
          >
            <Camera size={14} aria-hidden="true" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Selecionar nova foto de perfil"
            onChange={handleChange}
          />
        </>
      )}
    </div>
  );
}
