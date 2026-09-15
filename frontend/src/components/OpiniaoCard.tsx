import { Link } from 'react-router';
import { Star } from 'lucide-react';
import type { Opiniao } from '../types';

interface OpiniaoCardProps {
  opiniao: Opiniao;
}

export default function OpiniaoCard({ opiniao }: OpiniaoCardProps): React.JSX.Element {
  return (
    <li className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
      <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-coffee-100 flex items-center justify-center">
        {opiniao.imagem_embalagem_url ? (
          <img
            src={opiniao.imagem_embalagem_url}
            alt={`Embalagem do café ${opiniao.cafe.nome}`}
            className="w-16 h-16 object-cover"
          />
        ) : (
          <span className="text-xs text-coffee-500 text-center px-1">sem foto</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to={`/opinioes/${opiniao.id}`}
          aria-label={`Ver opinião sobre ${opiniao.cafe.nome}`}
          className="text-sm font-semibold text-coffee-900"
        >
          {opiniao.cafe.nome}
        </Link>
        <p className="text-sm text-coffee-700">Produtor: {opiniao.cafe.produtor}</p>
        <p className="text-base text-coffee-950 mt-1">{opiniao.texto}</p>
        {opiniao.nota_autor != null && (
          <p className="text-sm text-amber-700 mt-1 flex items-center gap-1">
            <Star size={14} aria-hidden="true" />
            Nota do autor: {opiniao.nota_autor}/5
          </p>
        )}
      </div>
    </li>
  );
}
