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

    if (!name || !artistIds || !Array.isArray(artistIds) || artistIds.length === 0) {
      console.error('Dados inválidos:', { name, artistIds });
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Busca o ID do usuário
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Erro ao buscar dados do usuário:', errorText);
      return NextResponse.json({ error: 'Erro ao buscar dados do usuário' }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    console.log('Dados do usuário:', userData);

    // Busca informações dos artistas
    const artistPromises = artistIds.map(async (artistId) => {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Erro ao buscar dados do artista ${artistId}:`, await response.text());
        return null;
      }

      return response.json();
    });

    const artistsData = await Promise.all(artistPromises);
    const validArtists = artistsData.filter(artist => artist !== null);
    
    if (validArtists.length === 0) {
      return NextResponse.json({ error: 'Nenhum artista válido encontrado' }, { status: 400 });
    }

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
      const errorText = await createPlaylistResponse.text();
      console.error('Erro ao criar playlist:', errorText);
      return NextResponse.json({ error: 'Erro ao criar playlist' }, { status: createPlaylistResponse.status });
    }

    const playlistData = await createPlaylistResponse.json();
    console.log('Playlist criada:', playlistData);

    // Busca as top tracks de cada artista
    const topTracksPromises = validArtists.map(async (artist) => {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=${userData.country}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`Erro ao buscar top tracks do artista ${artist.id}:`, await response.text());
        return [];
      }

      const data = await response.json();
      return data.tracks.slice(0, 5).map(track => track.uri);
    });

    const allTopTracks = await Promise.all(topTracksPromises);
    const trackUris = allTopTracks.flat();
    console.log('URIs das músicas:', trackUris);

    if (trackUris.length === 0) {
      return NextResponse.json({ error: 'Nenhuma música encontrada para os artistas' }, { status: 400 });
    }

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
      const errorText = await addTracksResponse.text();
      console.error('Erro ao adicionar músicas:', errorText);
      return NextResponse.json({ error: 'Erro ao adicionar músicas' }, { status: addTracksResponse.status });
    }

    try {
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
            connectOrCreate: validArtists.map(artist => ({
              where: { id: artist.id },
              create: {
                id: artist.id,
                name: artist.name,
                imageUrl: artist.images[0]?.url,
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
    } catch (dbError) {
      console.error('Erro ao salvar no banco de dados:', dbError);
      // Mesmo que falhe ao salvar no banco, retorna sucesso pois a playlist foi criada no Spotify
      return NextResponse.json({
        success: true,
        playlistUrl: playlistData.external_urls.spotify,
        warning: 'Playlist criada com sucesso, mas houve um erro ao salvar no histórico',
      });
    }
  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar playlist: ' + error.message },
      { status: 500 }
    );
  }
} 