import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.scss';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Melius Platform',
  description: 'Next.js frontend paired with the Melius NestJS backend.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
