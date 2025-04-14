import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Função para gerar um novo Sudoku
function generateSudoku() {
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // Preenche a diagonal principal
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  // Resolve o resto do Sudoku
  const solution = [...board.map(row => [...row])];
  solveSudoku(solution);
  
  // Remove alguns números para criar o puzzle
  const puzzle = solution.map(row => [...row]);
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
  
  return { puzzle, solution };
}

// Funções auxiliares do Sudoku
function fillBox(board, row, col) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  let index = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[index++];
    }
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

// GET /api/sudoku - Obtém o Sudoku diário e ranking
export async function GET() {
  try {
    // Obtém a data atual (apenas ano, mês, dia)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Procura o Sudoku do dia
    let dailySudoku = await prisma.dailySudoku.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        scores: {
          include: {
            player: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            time: 'asc',
          },
          take: 10,
        },
      },
    });

    // Se não existir, cria um novo
    if (!dailySudoku) {
      const { puzzle, solution } = generateSudoku();
      dailySudoku = await prisma.dailySudoku.create({
        data: {
          date: today,
          board: JSON.stringify(puzzle),
          solution: JSON.stringify(solution),
        },
        include: {
          scores: {
            include: {
              player: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              time: 'asc',
            },
            take: 10,
          },
        },
      });
    }

    return NextResponse.json(dailySudoku);
  } catch (error) {
    console.error('Erro ao obter Sudoku:', error);
    return NextResponse.json({ error: 'Erro ao obter Sudoku' }, { status: 500 });
  }
}

// POST /api/sudoku/score - Salva uma pontuação
export async function POST(request) {
  try {
    const { playerName, sudokuId, time } = await request.json();

    // Encontra ou cria o jogador
    let player = await prisma.sudokuPlayer.findUnique({
      where: { name: playerName },
    });

    if (!player) {
      player = await prisma.sudokuPlayer.create({
        data: { name: playerName },
      });
    }

    // Salva a pontuação
    const score = await prisma.sudokuScore.create({
      data: {
        playerId: player.id,
        sudokuId,
        time,
      },
      include: {
        player: {
          select: {
            name: true,
          },
        },
      },
    });

    // Retorna o ranking atualizado
    const ranking = await prisma.sudokuScore.findMany({
      where: { sudokuId },
      include: {
        player: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        time: 'asc',
      },
      take: 10,
    });

    return NextResponse.json({ score, ranking });
  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
    return NextResponse.json({ error: 'Erro ao salvar pontuação' }, { status: 500 });
  }
} 