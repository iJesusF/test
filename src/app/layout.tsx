import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuildVision · Visual Construction Progress',
  description: 'Gestión visual responsive de avance de construcción sobre planos arquitectónicos.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className="dark"><body>{children}</body></html>;
}
