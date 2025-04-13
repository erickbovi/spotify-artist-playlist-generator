import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SelectedArtists({ artists, onRemove }) {
  if (artists.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Artistas Selecionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="bg-spotify-light-black p-4 rounded-lg flex items-center space-x-4 group hover:bg-opacity-80 transition-colors"
          >
            {artist.images[0] && (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="font-medium truncate">{artist.name}</p>
              <p className="text-sm text-gray-400">
                {artist.followers.total.toLocaleString()} seguidores
              </p>
            </div>
            <button
              onClick={() => onRemove(artist.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 