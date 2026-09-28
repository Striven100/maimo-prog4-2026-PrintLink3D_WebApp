import './globals.css';

export const metadata = {
  title: 'PrintLink 3D',
  description: 'Marketplace demo para cotizar y solicitar impresiones 3D.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
