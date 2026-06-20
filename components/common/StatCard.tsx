type StatProps = { label: string; value: string | number };

export function StatCard({ label, value }: StatProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 sm:p-5">
      <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[color:var(--text)]">
        {value}
      </p>
    </div>
  );
}
