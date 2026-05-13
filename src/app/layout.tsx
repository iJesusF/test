import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vortech 360 · Calidad visual en obra',
  description: 'Track visual de proyectos, calidad y evidencias de obra sobre planos arquitectónicos.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="dark"><body>{children}</body></html>;
}
