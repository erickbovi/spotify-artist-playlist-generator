'use client';

import { useState } from 'react';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreatePlaylist({ selectedArtists, onPlaylistCreated }) {
  const [playlistName, setPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Por favor, digite um nome para a playlist');
      return;
    }

    if (!selectedArtists || selectedArtists.length === 0) {
      toast.error('Por favor, selecione pelo menos um artista');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          artistIds: selectedArtists.map(artist => artist.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar playlist');
      }

      if (data.warning) {
        toast.success('Playlist criada com sucesso, mas houve um aviso: ' + data.warning);
      } else {
        toast.success('Playlist criada com sucesso!');
      }

      onPlaylistCreated(data.playlistUrl);
      setPlaylistName('');
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
      toast.error(error.message || 'Erro ao criar playlist. Por favor, tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Nome da playlist"
          className="w-full h-10 px-4 py-2 pl-10 bg-white bg-opacity-95 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
          disabled={isCreating}
        />
        <MusicalNoteIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <button
        onClick={handleCreatePlaylist}
        disabled={isCreating}
        className={`create-playlist-btn ${
          isCreating || !playlistName.trim() || !selectedArtists?.length
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 hover:shadow-lg'
        }`}
      >
        {isCreating ? 'Criando...' : 'Criar Playlist'}
      </button>
    </div>
  );
} 