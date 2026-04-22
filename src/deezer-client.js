const DEEZER_BASE = "/api/deezer";
const _artistCache = new Map();

async function deezerGet(path, params = {}) {
  const url = new URL(`${DEEZER_BASE}${path}`, window.location.origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Deezer ${path} failed (${res.status})`);
  const data = await res.json();
  if (data.error) throw new Error(`Deezer error: ${data.error.message}`);
  return data;
}

const SUGGESTION_NOISE = /\b(feat\.?|ft\.?|featuring|karaoke|tribute|cover)\b/i;

export async function searchArtistSuggestions(term, limit = 5) {
  if (!term?.trim() || term.trim().length < 2) return [];
  try {
    const data = await deezerGet("/search/artist", { q: term.trim(), limit: Math.min(limit * 3, 20) });
    const seenNames = new Set();
    return (data.data || [])
      .filter((a) => {
        if (SUGGESTION_NOISE.test(a.name)) return false;
        const key = a.name.toLowerCase().trim();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      })
      .slice(0, limit)
      .map((a) => ({
        id: String(a.id),
        name: a.name,
        genreLabel: "Artist",
      }));
  } catch {
    return [];
  }
}

export async function searchArtist(name) {
  if (!name?.trim()) return null;
  const key = name.trim().toLowerCase();
  if (_artistCache.has(key)) return _artistCache.get(key);

  try {
    const data = await deezerGet("/search/artist", { q: name.trim(), limit: 5 });
    const artists = data.data || [];
    const exact = artists.find((a) => a.name.toLowerCase() === key);
    const raw = exact || artists[0] || null;
    if (!raw) return null;
    const result = { id: String(raw.id), name: raw.name };
    _artistCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export async function getRelatedArtists(artistId) {
  if (!artistId) return [];
  try {
    const data = await deezerGet(`/artist/${artistId}/related`, { limit: 20 });
    return (data.data || []).map((a) => ({ id: String(a.id), name: a.name }));
  } catch {
    return [];
  }
}

export async function getArtistRadio(artistId, limit = 50) {
  if (!artistId) return [];
  try {
    const data = await deezerGet(`/artist/${artistId}/radio`, { limit: Math.min(limit, 100) });
    return data.data || [];
  } catch {
    return [];
  }
}

export async function searchTracksByArtist(artist, album, limit = 4) {
  if (!artist?.trim()) return [];
  try {
    const q = album?.trim()
      ? `artist:"${artist.trim()}" album:"${album.trim()}"`
      : `artist:"${artist.trim()}"`;
    const data = await deezerGet("/search", { q, limit: Math.min(limit * 3, 25) });
    const tracks = data.data || [];

    if (album?.trim()) {
      const albumKey = album.trim().toLowerCase();
      const exactAlbum = tracks.filter(
        (t) =>
          t.artist?.name?.toLowerCase() === artist.trim().toLowerCase() &&
          t.album?.title?.toLowerCase() === albumKey,
      );
      if (exactAlbum.length) return exactAlbum.slice(0, limit);
      const artistMatch = tracks.filter(
        (t) => t.artist?.name?.toLowerCase() === artist.trim().toLowerCase(),
      );
      if (artistMatch.length) return artistMatch.slice(0, limit);
    }
    return tracks.slice(0, limit);
  } catch {
    return [];
  }
}

function rankToDiscoveryWeight(rank) {
  if (!rank) return 0.75;
  if (rank <= 80_000)  return 1.0;
  if (rank <= 200_000) return 0.90;
  if (rank <= 350_000) return 0.72;
  if (rank <= 500_000) return 0.48;
  if (rank <= 650_000) return 0.28;
  return 0.10;
}

function parseDeezerYear(dateStr) {
  if (!dateStr || dateStr.startsWith("0000")) return null;
  const y = new Date(dateStr).getFullYear();
  return Number.isFinite(y) && y > 1900 ? y : null;
}

export function normalizeDeezerTrack(track, context = {}) {
  if (!track?.id) return null;

  const rank = track.rank ?? 500_000;
  const artworkUrl = track.album?.cover_medium || track.album?.cover || "";
  const year = parseDeezerYear(track.album?.release_date) ?? parseDeezerYear(track.release_date);

  return {
    id: String(track.id),
    title: track.title,
    album: track.album?.title || "",
    artist: track.artist?.name || "",
    genres: [],
    era: year,
    artworkUrl,
    previewUrl: track.preview || "",
    deezerId: String(track.id),
    deezerAlbumId: String(track.album?.id || ""),
    deezerArtistId: String(track.artist?.id || ""),
    deezerUrl: track.link || "",
    popularity: Math.round((rank / 1_000_000) * 100),
    sourceArtist: context.sourceArtist || track.artist?.name || "",
    recommendedBecause: context.recommendedBecause || "",
    discoveryMode: context.discoveryMode || "deezer-radio",
    discoveryWeight: rankToDiscoveryWeight(rank),
    editorialWeight: context.editorialWeight || 0,
    editorialMatchMode: context.editorialMatchMode || "",
    editorialSources: context.editorialSources || [],
  };
}

const _albumYearCache = new Map();

async function getAlbumYear(albumId) {
  if (!albumId || albumId === "0") return null;
  if (_albumYearCache.has(albumId)) return _albumYearCache.get(albumId);

  try {
    const data = await deezerGet(`/album/${albumId}`);
    const year = parseDeezerYear(data?.release_date);
    _albumYearCache.set(albumId, year);
    return year;
  } catch {
    _albumYearCache.set(albumId, null);
    return null;
  }
}

export async function enrichTracksWithDeezerDates(tracks) {
  const missing = tracks.filter((t) => !t.era && t.deezerAlbumId);
  if (!missing.length) return tracks;

  const uniqueAlbumIds = [...new Set(missing.map((t) => t.deezerAlbumId))];
  const results = await Promise.allSettled(
    uniqueAlbumIds.map((id) => getAlbumYear(id).then((year) => [id, year])),
  );
  const yearMap = new Map(
    results.filter((r) => r.status === "fulfilled" && r.value[1] != null).map((r) => r.value),
  );

  return tracks.map((t) =>
    t.era ? t : { ...t, era: yearMap.get(t.deezerAlbumId) ?? null },
  );
}
