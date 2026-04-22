const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_MARKET = "US";

let _token = null;
let _tokenExpiry = 0;
const _artistCache = new Map(); // lowercase name → artist object

async function getToken() {
  if (_token && Date.now() < _tokenExpiry - 30_000) return _token;

  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Spotify credentials not configured. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file.",
    );
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Spotify] Token request failed ${res.status}:`, body);
    throw new Error(`Spotify authentication failed (${res.status}).`);
  }
  const { access_token, expires_in } = await res.json();
  console.log("[Spotify] Token obtained, expires in", expires_in, "s");
  _token = access_token;
  _tokenExpiry = Date.now() + expires_in * 1000;
  return _token;
}

async function spotifyGet(path, params = {}) {
  const token = await getToken();
  const url = new URL(`${SPOTIFY_API_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 429) {
    const wait = Math.min(Number(res.headers.get("Retry-After") || 2) * 1000, 8000);
    await new Promise((r) => setTimeout(r, wait));
    return spotifyGet(path, params);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Spotify] ${path} failed ${res.status}:`, body);
    throw new Error(`Spotify ${path} failed (${res.status}).`);
  }
  return res.json();
}

export async function searchArtist(name) {
  if (!name?.trim()) return null;
  const key = name.trim().toLowerCase();
  if (_artistCache.has(key)) return _artistCache.get(key);

  try {
    const data = await spotifyGet("/search", {
      q: `artist:"${name.trim()}"`,
      type: "artist",
      limit: 5,
      market: SPOTIFY_MARKET,
    });

    const artists = data.artists?.items || [];
    const exact = artists.find((a) => a.name.toLowerCase() === key);
    const result = exact || artists[0] || null;
    if (result) _artistCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export async function searchArtistSuggestions(term, limit = 5) {
  if (!term?.trim() || term.trim().length < 2) return [];
  try {
    const data = await spotifyGet("/search", {
      q: term.trim(),
      type: "artist",
      limit: Math.min(limit, 10),
      market: SPOTIFY_MARKET,
    });
    return (data.artists?.items || []).map((a) => ({
      id: a.id,
      name: a.name,
      genreLabel: a.genres?.[0] || "Artist",
    }));
  } catch {
    return [];
  }
}

export async function getRelatedArtists(artistId) {
  if (!artistId) return [];
  try {
    const data = await spotifyGet(`/artists/${artistId}/related-artists`);
    return data.artists || [];
  } catch {
    return [];
  }
}

export async function batchGetArtists(ids) {
  if (!ids.length) return [];
  const results = [];
  for (let i = 0; i < ids.length; i += 50) {
    try {
      const data = await spotifyGet("/artists", { ids: ids.slice(i, i + 50).join(",") });
      results.push(...(data.artists || []).filter(Boolean));
    } catch {
      // non-critical — genres will be empty for failed batch
    }
  }
  return results;
}

export async function getRecommendations({
  seedArtistIds = [],
  seedTrackIds = [],
  maxPopularity = 40,
  limit = 50,
}) {
  const artistSeeds = seedArtistIds.slice(0, 5 - Math.min(2, seedTrackIds.length));
  const trackSeeds = seedTrackIds.slice(0, Math.min(2, 5 - artistSeeds.length));
  if (!artistSeeds.length && !trackSeeds.length) return [];

  const params = {
    limit: Math.min(limit, 100),
    market: SPOTIFY_MARKET,
    max_popularity: maxPopularity,
  };
  if (artistSeeds.length) params.seed_artists = artistSeeds.join(",");
  if (trackSeeds.length) params.seed_tracks = trackSeeds.join(",");

  try {
    const data = await spotifyGet("/recommendations", params);
    return data.tracks || [];
  } catch {
    return [];
  }
}

export async function searchTracksByArtistAlbum(artist, album, limit = 4) {
  if (!artist?.trim()) return [];
  try {
    const q = album?.trim()
      ? `artist:${artist.trim()} album:${album.trim()}`
      : `artist:${artist.trim()}`;

    const data = await spotifyGet("/search", {
      q,
      type: "track",
      limit: Math.min(limit * 3, 20),
      market: SPOTIFY_MARKET,
    });

    const tracks = data.tracks?.items || [];
    if (album?.trim()) {
      const albumKey = album.trim().toLowerCase();
      const exactAlbum = tracks.filter(
        (t) =>
          t.artists?.[0]?.name?.toLowerCase() === artist.trim().toLowerCase() &&
          t.album?.name?.toLowerCase() === albumKey,
      );
      if (exactAlbum.length) return exactAlbum.slice(0, limit);

      const artistMatch = tracks.filter(
        (t) => t.artists?.[0]?.name?.toLowerCase() === artist.trim().toLowerCase(),
      );
      if (artistMatch.length) return artistMatch.slice(0, limit);
    }
    return tracks.slice(0, limit);
  } catch {
    return [];
  }
}

function popularityToDiscoveryWeight(popularity) {
  if (popularity <= 15) return 1.0;
  if (popularity <= 30) return 0.88;
  if (popularity <= 45) return 0.72;
  if (popularity <= 60) return 0.55;
  if (popularity <= 75) return 0.38;
  return 0.22;
}

export function normalizeSpotifyTrack(track, context = {}) {
  if (!track?.id) return null;

  const popularity = track.popularity ?? 50;
  const artworkUrl =
    track.album?.images?.find((img) => img.width >= 300 && img.width <= 640)?.url ||
    track.album?.images?.[0]?.url ||
    "";
  const year = track.album?.release_date
    ? new Date(track.album.release_date).getFullYear()
    : null;

  return {
    id: track.id,
    title: track.name,
    album: track.album?.name || "",
    artist: track.artists?.[0]?.name || "",
    genres: [],
    era: Number.isFinite(year) ? year : null,
    artworkUrl,
    previewUrl: track.preview_url || "",
    spotifyId: track.id,
    spotifyArtistId: track.artists?.[0]?.id || "",
    spotifyUrl: track.external_urls?.spotify || "",
    popularity,
    sourceArtist: context.sourceArtist || track.artists?.[0]?.name || "",
    recommendedBecause: context.recommendedBecause || "",
    discoveryMode: context.discoveryMode || "spotify-recommendation",
    discoveryWeight: popularityToDiscoveryWeight(popularity),
    editorialWeight: context.editorialWeight || 0,
    editorialMatchMode: context.editorialMatchMode || "",
    editorialSources: context.editorialSources || [],
  };
}

export async function enrichWithGenres(tracks) {
  const artistIds = [...new Set(tracks.map((t) => t.spotifyArtistId).filter(Boolean))];
  if (!artistIds.length) return tracks;

  const artists = await batchGetArtists(artistIds);
  const genreMap = new Map(artists.map((a) => [a.id, a.genres?.slice(0, 4) || []]));

  return tracks.map((t) => ({
    ...t,
    genres: genreMap.get(t.spotifyArtistId) || t.genres || [],
  }));
}
