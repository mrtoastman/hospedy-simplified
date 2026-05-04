import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hospedy PMS',
  description: 'Property Management System for Short-Term Rentals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
