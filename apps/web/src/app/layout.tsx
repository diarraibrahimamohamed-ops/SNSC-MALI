import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/features/auth/useAuth';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <AuthProvider>
          <div id="toast-container" className="fixed top-4 right-4 z-50"></div>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
