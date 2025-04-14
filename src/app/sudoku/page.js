'use client';

import SudokuGame from '@/components/SudokuGame';
import Link from 'next/link';

export default function SudokuPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 12h16 M12 4v16 M8 4v16 M16 4v16" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Sudoku
            </h1>
            <p className="text-gray-300 mt-4">
              Teste suas habilidades no Sudoku diário e entre no ranking!
            </p>
          </div>

          <SudokuGame />
        </div>
      </div>
    </main>
  );
} 