import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Spotify Playlist Generator',
  description: 'Generate playlists from your favorite artists top tracks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
} 