interface SkeletonProps {
  className?: string;
  linhas?: number;
}

export default function Skeleton({ className, linhas = 1 }: SkeletonProps): React.JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {Array.from({ length: linhas }, (_, indice) => (
        <div
          key={indice}
          className={`animate-pulse bg-coffee-100 rounded-md h-4 ${className ?? ''}`}
        />
      ))}
    </div>
  );
}
