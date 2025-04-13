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

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-black text-white flex items-center justify-center">
        <div className="text-center space-y-8 p-8">
          <h1 className="text-6xl font-bold tracking-tight">
            Playlist Generator
          </h1>
          <p className="text-xl text-gray-300">
            Crie playlists com as músicas mais populares dos seus artistas favoritos
          </p>
          <button
            onClick={() => signIn('spotify')}
            className="bg-spotify-green hover:bg-spotify-green-light text-black font-bold py-4 px-8 rounded-full transition-all"
          >
            Entrar com Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-spotify-dark to-black text-white">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Playlist Generator</h1>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sair
          </button>
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
            artists={selectedArtists}
            onSuccess={() => setSelectedArtists([])}
          />
        )}
      </div>
    </main>
  );
} 