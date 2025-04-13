import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const userData = await userResponse.json();

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: userData.id,
      },
      include: {
        artists: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
} 