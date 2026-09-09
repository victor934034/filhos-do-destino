/** Divisor ondulado (trança/corda) usado abaixo de títulos de seção. */
export function Divisor({ centralizado = false, className = "" }: { centralizado?: boolean; className?: string }) {
  return (
    <div
      className={`divisor-ondulado ${centralizado ? "mx-auto" : ""} ${className}`}
      aria-hidden
    />
  );
}
