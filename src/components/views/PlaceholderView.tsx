'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function PlaceholderView({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children?: ReactNode }) {
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-6 shadow-panel backdrop-blur">
    <p className="text-xs uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
    <div className="mt-5">{children}</div>
    <Link href="/" className="mt-6 inline-flex rounded-xl bg-electric px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-blue-400">Volver al plano</Link>
  </section>;
}
