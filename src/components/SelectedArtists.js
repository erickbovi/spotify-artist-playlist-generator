'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SelectedArtists({ artists, onRemove }) {
  if (artists.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Artistas Selecionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="artist-card flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-4">
              <img
                src={artist.images[0]?.url || '/default-artist.jpg'}
                alt={artist.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="artist-name">{artist.name}</div>
                <div className="artist-followers">
                  {artist.followers.total.toLocaleString()} seguidores
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(artist.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 