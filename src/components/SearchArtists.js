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
    <div className="relative mb-8">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Busque por artistas..."
          onChange={(e) => searchArtists(e.target.value)}
          className="w-full bg-spotify-light-black text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="absolute w-full mt-2 bg-spotify-light-black rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
          {searchResults.map((artist) => (
            <button
              key={artist.id}
              onClick={() => {
                onArtistSelect(artist);
                setSearchResults([]);
              }}
              disabled={selectedArtists.some(a => a.id === artist.id)}
              className="w-full p-4 flex items-center space-x-4 hover:bg-opacity-40 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {artist.images[0] && (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="font-medium">{artist.name}</p>
                <p className="text-sm text-gray-400">
                  {artist.followers.total.toLocaleString()} seguidores
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 