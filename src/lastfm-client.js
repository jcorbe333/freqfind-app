const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";
const _artistTagCache = new Map();
const _albumInfoCache = new Map();

// Last.fm meta-tags that aren't real genres
const TAG_BLOCKLIST = new Set([
  "seen live", "albums i own", "all", "favorites", "favourite", "favorites",
  "my favorites", "love", "loved", "great", "awesome", "best", "good",
  "classic", "under 2000 listeners", "american", "british", "female vocalists",
  "male vocalists", "singer-songwriter", "bands", "band", "beautiful",
]);

function makeTagFilter(artistNameSet) {
  return function isValidTag(tag) {
    const name = tag.name.toLowerCase().trim();
    if (TAG_BLOCKLIST.has(name)) return false;
    if (/^\d+s?$/.test(name)) return false; // years like "2019", decades like "90s"
    if (name.length < 3) return false;
    if (tag.count < 10) return false;
    if (artistNameSet.has(name)) return false; // filter out artist-name tags
    return true;
  };
}

async function lastfmGet(params) {
  const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
  if (!apiKey) return null;

  const url = new URL(LASTFM_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

async function getArtistTags(artist, tagFilter) {
  if (!artist) return [];
  const key = artist.toLowerCase().trim();
  if (_artistTagCache.has(key) && !tagFilter) return _artistTagCache.get(key);

  const data = await lastfmGet({ method: "artist.getTopTags", artist, autocorrect: 1 });
  const tags = (data?.toptags?.tag || [])
    .filter(tagFilter ?? makeTagFilter(new Set()))
    .slice(0, 5)
    .map((t) => t.name.toLowerCase());

  if (!tagFilter) _artistTagCache.set(key, tags);
  return tags;
}

async function getAlbumYear(artist, album) {
  if (!artist || !album) return null;
  const key = `${artist}::${album}`.toLowerCase();
  if (_albumInfoCache.has(key)) return _albumInfoCache.get(key);

  const data = await lastfmGet({ method: "album.getInfo", artist, album, autocorrect: 1 });
  const releasedate = data?.album?.releasedate?.trim();

  let year = null;
  if (releasedate) {
    // Last.fm format: " 01 Jan 2019, 00:00" or "2019" or "2019-01-01"
    const match = releasedate.match(/\b(19|20)\d{2}\b/);
    if (match) {
      const y = parseInt(match[0], 10);
      if (y > 1900 && y <= new Date().getFullYear() + 1) year = y;
    }
  }

  _albumInfoCache.set(key, year);
  return year;
}

export async function enrichTracksWithLastFm(tracks) {
  if (!import.meta.env.VITE_LASTFM_API_KEY || !tracks.length) return tracks;

  const uniqueArtists = [...new Set(tracks.map((t) => t.artist).filter(Boolean))];

  // Build a set of all known artist names so they can't slip through as genre tags
  const artistNameSet = new Set(uniqueArtists.map((a) => a.toLowerCase().trim()));
  const tagFilter = makeTagFilter(artistNameSet);

  // Tracks missing a release year — collect unique artist+album pairs
  const albumsForDate = new Map();
  for (const t of tracks) {
    if (!t.era && t.artist && t.album) {
      const k = `${t.artist}::${t.album}`;
      if (!albumsForDate.has(k)) albumsForDate.set(k, { artist: t.artist, album: t.album });
    }
  }

  // Fetch tags and years in parallel
  const [tagEntries, yearEntries] = await Promise.all([
    Promise.allSettled(uniqueArtists.map((a) => getArtistTags(a, tagFilter).then((tags) => [a, tags]))),
    Promise.allSettled(
      [...albumsForDate.values()].map(({ artist, album }) =>
        getAlbumYear(artist, album).then((year) => [`${artist}::${album}`, year]),
      ),
    ),
  ]);

  const tagMap = new Map(
    tagEntries.filter((r) => r.status === "fulfilled").map((r) => r.value),
  );
  const yearMap = new Map(
    yearEntries.filter((r) => r.status === "fulfilled" && r.value[1] != null).map((r) => r.value),
  );

  return tracks.map((track) => ({
    ...track,
    genres: tagMap.get(track.artist)?.length ? tagMap.get(track.artist) : track.genres,
    era: track.era ?? yearMap.get(`${track.artist}::${track.album}`) ?? null,
  }));
}
