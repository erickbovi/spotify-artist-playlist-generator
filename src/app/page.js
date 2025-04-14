'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="main-container max-w-5xl w-full">
        <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 text-center mb-12">
          Mini Apps
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card do Gerador de Playlists */}
          <Link href="/playlist" className="group">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400 mb-4">
                  Playlist Generator
                </h2>
                <p className="text-gray-300 mb-6">
                  Crie playlists com as músicas mais populares dos seus artistas favoritos
                </p>
                <div className="flex justify-center">
                  <span className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl group-hover:shadow-lg transition-all duration-300 font-medium">
                    Acessar →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card do Sudoku */}
          <Link href="/sudoku" className="group">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 12h16 M12 4v16 M8 4v16 M16 4v16" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400 mb-4">
                  Sudoku
                </h2>
                <p className="text-gray-300 mb-6">
                  Teste suas habilidades no Sudoku diário e entre no ranking!
                </p>
                <div className="flex justify-center">
                  <span className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl group-hover:shadow-lg transition-all duration-300 font-medium">
                    Acessar →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
} 