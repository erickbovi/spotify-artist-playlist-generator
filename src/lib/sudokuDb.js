import prisma from './prisma';

export async function getDailySudoku() {
  const response = await fetch('/api/sudoku');
  if (!response.ok) {
    throw new Error('Erro ao obter o Sudoku diário');
  }
  return response.json();
}

export async function saveScore(sudokuId, playerName, time) {
  const response = await fetch('/api/sudoku/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sudokuId, playerName, time }),
  });

  if (!response.ok) {
    throw new Error('Erro ao salvar a pontuação');
  }
  return response.json();
}

export async function getTopScores(sudokuId) {
  const scores = await prisma.sudokuScore.findMany({
    where: { sudokuId },
    include: {
      user: {
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

  return scores.map(score => ({
    id: score.id,
    playerName: score.user.name,
    time: score.time,
    createdAt: score.createdAt,
  }));
}

export async function getUserBestScore(sudokuId, userId) {
  return prisma.sudokuScore.findFirst({
    where: { 
      sudokuId,
      userId 
    },
    orderBy: { time: 'asc' }
  });
} 