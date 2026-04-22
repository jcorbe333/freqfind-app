const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_CACHE_KEY = "freqfind:youtube-ids:v2";
const YT_CACHE_MAX = 3000;

function loadCache() {
  try {
    return new Map(JSON.parse(localStorage.getItem(YT_CACHE_KEY) || "[]"));
  } catch {
    return new Map();
  }
}

function saveCache(cache) {
  try {
    const entries = [...cache.entries()].slice(-YT_CACHE_MAX);
    localStorage.setItem(YT_CACHE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable or full
  }
}

const _cache = loadCache();

export async function findYouTubeVideoId(artist, title) {
  if (!artist || !title) return null;

  const cacheKey = `${artist}::${title}`.toLowerCase().trim();
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL(YT_SEARCH_URL);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", `${artist} ${title}`);
    url.searchParams.set("type", "video");
    url.searchParams.set("videoCategoryId", "10"); // Music
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId || null;

    _cache.set(cacheKey, videoId);
    saveCache(_cache);
    return videoId;
  } catch {
    return null;
  }
}
