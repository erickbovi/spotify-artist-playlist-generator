'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import SearchArtists from '../components/SearchArtists';
import SelectedArtists from '../components/SelectedArtists';
import CreatePlaylist from '../components/CreatePlaylist';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { data: session } = useSession();
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState(null);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="main-container">
          <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            Playlist Generator
          </h1>
          <p className="text-xl text-gray-300 mt-4">
            Crie playlists com as músicas mais populares dos seus artistas favoritos
          </p>
          <button
            onClick={() => signIn('spotify')}
            className="create-playlist-btn mt-8"
          >
            Entrar com Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="main-container">
        <Toaster position="top-center" />
        <div className="relative mb-8">
          <div className="flex justify-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Playlist Generator
            </h1>
          </div>
          <button
            onClick={() => signOut()}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Selecione os artistas de interesse e será criada uma playlist com as 5 músicas mais ouvidas de cada um
        </p>
        
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
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              Abrir Playlist no Spotify
            </a>
          </div>
        )}
      </div>
    </main>
  );
} 