type StatProps = { label: string; value: string | number };

export function StatCard({ label, value }: StatProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
      <p className="text-xs text-[color:var(--text-muted)]">{label}</p>
      <p className="font-serif text-3xl font-black text-[color:var(--teal)]">
        {value}
      </p>
    </div>
  );
}
