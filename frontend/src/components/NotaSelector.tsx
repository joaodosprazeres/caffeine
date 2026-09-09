interface NotaSelectorProps {
  valorAtual: number | null;
  onSelecionar: (valor: number) => void;
  desabilitado: boolean;
}

export default function NotaSelector({
  valorAtual,
  onSelecionar,
  desabilitado,
}: NotaSelectorProps): React.JSX.Element {
  return (
    <div role="group" aria-label="Dar nota de 1 a 5" className="flex gap-2">
      {[1, 2, 3, 4, 5].map((valor) => {
        const selecionado = valorAtual === valor;
        return (
          <button
            key={valor}
            type="button"
            aria-label={`Dar nota ${valor} de 5`}
            aria-pressed={selecionado}
            disabled={desabilitado}
            onClick={() => onSelecionar(valor)}
            className={
              selecionado
                ? 'w-9 h-9 rounded-full bg-amber-600 text-white font-semibold'
                : 'w-9 h-9 rounded-full border border-coffee-300 text-coffee-900 font-semibold disabled:opacity-60'
            }
          >
            {valor}
          </button>
        );
      })}
    </div>
  );
}
