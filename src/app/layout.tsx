import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOFISAM Admin | Enterprise Management Portal',
  description: 'Executive management portal for SOFISAM client mandates, private enquiries, and intelligence subscribers.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-[#F6F7F9] text-[#182536]">
        {children}
      </body>
    </html>
  );
}
