'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

export default function SearchArtists({ onArtistSelect, selectedArtists }) {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchArtists = debounce(async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.artists.items);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
    setIsLoading(false);
  }, 300);

  return (
    <div className="search-container">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Busque por artistas..."
          onChange={(e) => searchArtists(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {isLoading && (
        <div className="text-gray-400">Carregando...</div>
      )}

      {searchResults.length > 0 && (
        <div className="artist-grid">
          {searchResults.map((artist) => (
            <div
              key={artist.id}
              className="artist-card"
              onClick={() => {
                if (!selectedArtists.some(a => a.id === artist.id)) {
                  onArtistSelect(artist);
                  setSearchResults([]);
                }
              }}
            >
              <img
                src={artist.images[0]?.url || '/default-artist.jpg'}
                alt={artist.name}
                className="artist-image"
              />
              <div className="artist-name">{artist.name}</div>
              <div className="artist-followers">
                {artist.followers.total.toLocaleString()} seguidores
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 