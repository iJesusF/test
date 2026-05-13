import type { ReactNode } from 'react';

export function MetricCard({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-panel backdrop-blur">
    <div className="flex items-center justify-between text-muted">{label}{icon}</div>
    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
  </div>;
}
