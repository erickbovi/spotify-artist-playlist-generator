import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    console.error('Erro: Sessão não encontrada ou sem accessToken');
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { name, artistIds } = await request.json();
    console.log('Dados recebidos:', { name, artistIds });

    // Busca o ID do usuário
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Erro ao buscar dados do usuário:', await userResponse.text());
      throw new Error('Erro ao buscar dados do usuário');
    }

    const userData = await userResponse.json();
    console.log('Dados do usuário:', userData);

    // Cria a playlist
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: 'Criado com Spotify Playlist Generator',
          public: true,
        }),
      }
    );

    if (!createPlaylistResponse.ok) {
      console.error('Erro ao criar playlist:', await createPlaylistResponse.text());
      throw new Error('Erro ao criar playlist');
    }

    const playlistData = await createPlaylistResponse.json();
    console.log('Playlist criada:', playlistData);

    // Busca as top tracks de cada artista
    const topTracksPromises = artistIds.map(async (artistId) => {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${userData.country}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Erro ao buscar top tracks do artista ${artistId}:`, await response.text());
        return [];
      }

      const data = await response.json();
      return data.tracks.slice(0, 5).map(track => track.uri);
    });

    const allTopTracks = await Promise.all(topTracksPromises);
    const trackUris = allTopTracks.flat();
    console.log('URIs das músicas:', trackUris);

    // Adiciona as músicas à playlist
    const addTracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );

    if (!addTracksResponse.ok) {
      console.error('Erro ao adicionar músicas:', await addTracksResponse.text());
      throw new Error('Erro ao adicionar músicas');
    }

    // Salva no banco de dados
    const savedPlaylist = await prisma.playlist.create({
      data: {
        id: playlistData.id,
        name: name,
        spotifyId: playlistData.id,
        spotifyUrl: playlistData.external_urls.spotify,
        user: {
          connectOrCreate: {
            where: { id: userData.id },
            create: {
              id: userData.id,
              email: userData.email,
              name: userData.display_name,
            },
          },
        },
        artists: {
          connectOrCreate: artistIds.map(artistId => ({
            where: { id: artistId },
            create: {
              id: artistId,
              name: "Artista", // Precisamos buscar o nome do artista
            },
          })),
        },
      },
    });

    console.log('Playlist salva no banco:', savedPlaylist);

    return NextResponse.json({
      success: true,
      playlistUrl: playlistData.external_urls.spotify,
      savedPlaylist,
    });
  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar playlist: ' + error.message },
      { status: 500 }
    );
  }
} 