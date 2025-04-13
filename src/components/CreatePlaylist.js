'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreatePlaylist({ artists, onSuccess }) {
  const [playlistName, setPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      toast.error('Digite um nome para a playlist');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('Criando sua playlist...');

    try {
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          artistIds: artists.map(a => a.id),
        }),
      });

      if (!response.ok) throw new Error('Erro ao criar playlist');

      const data = await response.json();
      toast.success('Playlist criada com sucesso!', {
        id: loadingToast,
      });
      setPlaylistName('');
      onSuccess();
      
      // Abre a playlist no Spotify
      window.open(data.playlistUrl, '_blank');
    } catch (error) {
      toast.error('Erro ao criar playlist. Tente novamente.', {
        id: loadingToast,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Nome da playlist"
          className="w-full bg-spotify-light-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
          disabled={isCreating}
        />
      </div>
      <button
        type="submit"
        disabled={isCreating}
        className="w-full bg-spotify-green hover:bg-spotify-green-light text-black font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? 'Criando...' : 'Criar Playlist'}
      </button>
    </form>
  );
} 