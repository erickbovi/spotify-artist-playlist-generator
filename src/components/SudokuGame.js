'use client';

import { useState, useEffect } from 'react';
import SudokuAuth from './SudokuAuth';
import { getDailySudoku, saveScore } from '@/lib/sudokuDb';

// Função para gerar um Sudoku válido
function generateSudoku() {
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // Preenche a diagonal principal
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  // Resolve o resto do Sudoku
  solveSudoku(board);
  
  // Remove alguns números para criar o jogo
  const puzzle = board.map(row => [...row]);
  const cellsToRemove = 45; // Dificuldade média
  let removed = 0;
  
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  
  return puzzle;
}

function fillBox(board, row, col) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffle(nums);
  
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[index++];
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  // Verifica linha
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Verifica coluna
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Verifica box 3x3
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  
  return true;
}

export default function SudokuGame() {
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userBoard, setUserBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [sudokuId, setSudokuId] = useState(null);

  useEffect(() => {
    loadDailySudoku();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && !isComplete) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isComplete]);

  const loadDailySudoku = async () => {
    try {
      const data = await getDailySudoku();
      const boardData = JSON.parse(data.board);
      const solutionData = JSON.parse(data.solution);
      
      setBoard(boardData);
      setSolution(solutionData);
      setUserBoard(boardData.map(row => [...row]));
      setSudokuId(data.id);
      setRanking(data.scores.map(score => ({
        name: score.player.name,
        time: score.time,
        date: score.createdAt
      })));
    } catch (error) {
      console.error('Erro ao carregar o Sudoku:', error);
    }
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] === 0 && !isComplete && currentUser) {
      setSelectedCell({ row, col });
      if (!isRunning) setIsRunning(true);
    }
  };

  const handleNumberClick = async (num) => {
    if (!selectedCell || !isRunning || !currentUser) return;

    const { row, col } = selectedCell;
    const newBoard = userBoard.map(r => [...r]);
    newBoard[row][col] = num;
    setUserBoard(newBoard);
    setSelectedCell(null);
    
    // Verifica se o jogo está completo
    if (isBoardComplete(newBoard)) {
      setIsComplete(true);
      setIsRunning(false);
      
      try {
        const result = await saveScore(sudokuId, currentUser, time);
        setRanking(result.ranking.map(score => ({
          name: score.player.name,
          time: score.time,
          date: score.createdAt
        })));
      } catch (error) {
        console.error('Erro ao salvar pontuação:', error);
      }
    }
  };

  const isBoardComplete = (currentBoard) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentBoard[i][j] !== solution[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="bg-[#474466] px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(time)}
        </div>
        <div className="flex items-center gap-4">
          <SudokuAuth onLogin={setCurrentUser} />
          <button
            onClick={() => setShowRanking(!showRanking)}
            className="px-6 py-2 bg-[#B866F9] text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showRanking ? 'Esconder Ranking' : 'Mostrar Ranking'}
          </button>
        </div>
      </div>

      {showRanking && (
        <div className="mb-6 bg-[#474466] p-6 rounded-2xl shadow-lg">
          <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ranking
          </h3>
          <div className="space-y-3">
            {ranking.map((entry, index) => (
              <div key={index} className="text-white/90 flex justify-between items-center bg-[#373357] p-3 rounded-xl">
                <span className="flex items-center gap-2">
                  {index === 0 && <span className="text-yellow-400">🏆</span>}
                  {index === 1 && <span className="text-gray-300">🥈</span>}
                  {index === 2 && <span className="text-amber-600">🥉</span>}
                  {entry.name}
                </span>
                <span>{formatTime(entry.time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        <div className="p-6 rounded-2xl shadow-lg bg-[#373357]" style={{ width: '400px' }}>
          <div className="grid grid-cols-9 gap-[1px] bg-[#B866F9]/30">
            {userBoard.map((row, i) => (
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`
                    aspect-square flex items-center justify-center text-white text-xl font-bold cursor-pointer transition-all duration-200
                    ${board[i][j] === 0 ? 'bg-[#474466] hover:bg-[#4F4C70]' : 'bg-[#474466]'}
                    ${selectedCell?.row === i && selectedCell?.col === j ? 'ring-2 ring-[#B866F9] shadow-lg scale-105 z-10' : ''}
                    ${selectedCell?.row === i || selectedCell?.col === j ? 'bg-[#4F4C70]' : ''}
                    ${Math.floor(i/3) === Math.floor(selectedCell?.row/3) && Math.floor(j/3) === Math.floor(selectedCell?.col/3) ? 'bg-[#4F4C70]' : ''}
                    ${j % 3 === 0 && j !== 0 ? 'border-l-2 border-l-[#B866F9]/30' : ''}
                    ${i % 3 === 0 && i !== 0 ? 'border-t-2 border-t-[#B866F9]/30' : ''}
                  `}
                  onClick={() => handleCellClick(i, j)}
                >
                  {cell !== 0 ? (
                    <span className={board[i][j] === 0 ? 'text-[#B866F9]' : 'text-white/90'}>
                      {cell}
                    </span>
                  ) : ''}
                </div>
              ))
            ))}
          </div>
        </div>

        {selectedCell && (
          <div className="grid grid-cols-3 gap-3 h-fit">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                className="w-14 h-14 bg-[#B866F9] text-white text-xl font-bold rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-105"
                onClick={() => handleNumberClick(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {isComplete && (
        <div className="mt-6 text-center bg-[#474466] p-6 rounded-2xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#B866F9] rounded-2xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white text-xl font-bold">Parabéns! Você completou o Sudoku em {formatTime(time)}!</p>
        </div>
      )}
    </div>
  );
} 