import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Vaccin-Track Mali | Plateforme de Suivi Vaccinal',
  description: 'Solution intelligente pour la gestion et le suivi de la vaccination au Mali.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head />
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
