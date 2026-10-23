import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Produtos',
  description: 'Gerenciamento de produtos: cadastro, busca, filtro e ordenação.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
