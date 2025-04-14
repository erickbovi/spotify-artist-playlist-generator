'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import SearchArtists from '../../components/SearchArtists';
import SelectedArtists from '../../components/SelectedArtists';
import CreatePlaylist from '@/components/CreatePlaylist';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function PlaylistPage() {
  const { data: session } = useSession();
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState(null);

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="main-container max-w-5xl w-full">
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Mini Apps
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Playlist Generator
              </h1>
              <p className="text-gray-300 mt-4">
                Crie playlists com as músicas mais populares dos seus artistas favoritos
              </p>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => signIn('spotify')}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Entrar com Spotify
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="main-container max-w-5xl w-full">
        <Toaster position="top-center" />
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Mini Apps
          </Link>
          <button
            onClick={() => signOut()}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            Sair
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Playlist Generator
            </h1>
            <p className="text-gray-300 mt-4">
              Selecione os artistas de interesse e será criada uma playlist com as 5 músicas mais ouvidas de cada um
            </p>
          </div>
          
          <SearchArtists 
            onArtistSelect={(artist) => {
              if (selectedArtists.length < 5) {
                setSelectedArtists([...selectedArtists, artist]);
              }
            }}
            selectedArtists={selectedArtists}
          />

          <SelectedArtists
            artists={selectedArtists}
            onRemove={(artistId) => {
              setSelectedArtists(selectedArtists.filter(a => a.id !== artistId));
            }}
          />

          {selectedArtists.length > 0 && (
            <CreatePlaylist
              selectedArtists={selectedArtists}
              onPlaylistCreated={(url) => {
                setPlaylistUrl(url);
                setSelectedArtists([]);
              }}
            />
          )}

          {playlistUrl && (
            <div className="mt-8 text-center">
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
              >
                Abrir Playlist no Spotify
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 