import { useState, useEffect, useCallback, useRef } from "react";
import {
  LOCAL_ARTIST_CATALOG,
  getArtistCatalogEntry,
  getArtistDiscoveryWeight,
  getClusterNeighbors,
  isBlockedRecommendationArtist,
  normalizeCatalogArtistName,
} from "./localArtistCatalog";
import {
  searchArtist,
  searchArtistSuggestions as searchDeezerArtistSuggestions,
  getRelatedArtists as getDeezerRelatedArtists,
  getArtistRadio,
  searchTracksByArtist,
  normalizeDeezerTrack,
  enrichTracksWithDeezerDates,
} from "./deezer-client";
import { findYouTubeVideoId } from "./youtube-client";
import { enrichTracksWithLastFm } from "./lastfm-client";

const SEARCH_CONFIG = {
  country: "US",
  media: "music",
  debounceMs: 300,
  artistSuggestionLimit: 5,
  songSearchLimit: 25,
  liveSearchConcurrency: 3,
  editorialTrackLimit: 4,
  editorialInitialLimit: 24,
  editorialRefillLimit: 14,
  editorialAlbumBoost: 0.9,
  editorialArtistBoost: 0.55,
  editorialBoostClamp: 7,
  similarArtistLimit: 8,
  relatedArtistPoolLimit: 12,
  openingSeedTrackLimit: 1,
  openingSimilarTrackLimit: 8,
  initialGenreTrackLimit: 6,
  refillDriverArtistLimit: 8,
  refillGenreDriverLimit: 6,
  genreDriverMinScore: 0.8,
  refillSimilarTrackLimit: 9,
  refillSeedDriverLimit: 1,
  refillSeedTrackLimit: 1,
  refillGenreLimit: 8,
  refillDriverHistoryLimit: 8,
  refillAttempts: 3,
  refillTarget: 40,
  refillMaxTracksPerArtist: 1,
  refillMaxTracksPerSourceArtist: 2,
  refillMaxTracksPerGenre: 6,
  clusterNeighborLimit: 14,
  openingWindow: 6,
  openingDiscoveryMin: 4,
  openingSeedMax: 1,
  discoveryBiasCards: 5,
  likedArtistCooldownCards: 8,
  artistHistoryLimit: 14,
  sourceArtistHistoryLimit: 10,
  genreHistoryLimit: 4,
  minQueue: 18,
  startQueueTarget: 40,
  exposureRecentArtistLimit: 30,
  exposurePenaltyRepeatThreshold: 2,
  exposurePenaltyWindowMs: 7 * 24 * 60 * 60 * 1000,
  exposureRetentionMs: 60 * 24 * 60 * 60 * 1000,
  exposureMaxEvents: 400,
  safeBandSize: 16,
  stretchBandSize: 42,
  sessionSeenLimit: 700,
  recoverySeenLimit: 160,
};

const ARTIST_EXPOSURE_STORAGE_KEY = "freqfind:artist-exposure:v1";
const SEEN_TRACKS_STORAGE_KEY = "freqfind:seen-tracks:v1";
const TASTE_PROFILE_KEY = "freqfind:taste-profile:v1";
const SEEN_TRACKS_MAX = 3000;

const ONBOARDING_PLACEHOLDER_COUNT = 5;

const CURATED_ARTIST_PLACEHOLDER_POOL = [
  "Lola Young",
  "Annahstasia",
  "Alvvays",
  "Alabama Shakes",
  "Little Simz",
  "Kendrick Lamar",
  "David Bowie",
  "ROSALIA",
  "Little Dragon",
  "Yussef Dayes",
  "Momoko Gill",
  "anaiis",
  "Leon Bridges",
  "Phoebe Bridgers",
  "Wednesday",
  "Big Thief",
  "Daft Punk",
  "Orion Sun",
  "Floating Points",
  "KAYTRANADA",
  "Faye Webster",
  "Vulfpeck",
  "James Blake",
  "The Japanese House",
  "sombr",
  "Wet Leg",
  "Olivia Dean",
  "Mk.gee",
  "SZA",
  "Solange",
  "Frank Ocean",
  "Blood Orange",
  "Steve Lacy",
  "Ravyn Lenae",
  "Tame Impala",
  "Khruangbin",
  "BadBadNotGood",
  "Hiatus Kaiyote",
  "Jungle",
  "Mitski",
  "Boygenius",
  "Clairo",
  "Weyes Blood",
  "Beabadoobee",
  "Magdalena Bay",
  "Men I Trust",
  "Suki Waterhouse",
  "Snail Mail",
  "Soccer Mommy",
  "Japanese Breakfast",
  "Arlo Parks",
  "Nilufer Yanya",
  "Charlotte Day Wilson",
  "Amaarae",
  "RAYE",
  "Tyla",
  "Doechii",
  "Noname",
  "Tyler, The Creator",
  "Childish Gambino",
  "Anderson .Paak",
  "NxWorries",
  "The Internet",
  "Erykah Badu",
  "D'Angelo",
  "A Tribe Called Quest",
  "Outkast",
  "Missy Elliott",
  "J Dilla",
  "Madlib",
  "MF DOOM",
  "Earl Sweatshirt",
  "Vince Staples",
  "JPEGMAFIA",
  "FKA twigs",
  "Charli xcx",
  "Caroline Polachek",
  "Lorde",
  "Beyonce",
  "Nelly Furtado",
  "Aaliyah",
  "Sade",
  "Janet Jackson",
  "Sabrina Claudio",
  "Cleo Sol",
  "SAULT",
  "The Smile",
  "Radiohead",
  "The Strokes",
  "The Cure",
  "The Smiths",
  "The Sundays",
  "Cocteau Twins",
  "Slowdive",
  "My Bloody Valentine",
  "Portishead",
  "Massive Attack",
  "Aphex Twin",
  "Boards of Canada",
  "Burial",
  "Four Tet",
  "Jamie xx",
  "Mount Kimbie",
  "Bonobo",
  "Caribou",
  "Bicep",
  "Overmono",
  "Nia Archives",
  "Tirzah",
  "The xx",
  "Beach House",
  "Mazzy Star",
  "Jeff Buckley",
  "Fiona Apple",
  "PJ Harvey",
  "Bjork",
  "Sharon Van Etten",
  "Angel Olsen",
  "Bon Iver",
  "Fleet Foxes",
  "Sufjan Stevens",
  "Wilco",
  "The War on Drugs",
  "The National",
  "Paramore",
  "Yves Tumor",
  "King Krule",
  "Unknown Mortal Orchestra",
  "Toro y Moi",
  "Mac DeMarco",
  "Rex Orange County",
  "Still Woozy",
  "The Marias",
  "Menahan Street Band",
  "Tom Misch",
  "Lianne La Havas",
  "Jamila Woods",
  "Moses Sumney",
  "Sampha",
  "Jordan Rakei",
  "Kamasi Washington",
  "Thundercat",
  "John Coltrane",
  "Nina Simone",
  "Joni Mitchell",
  "Marvin Gaye",
  "Stevie Wonder",
  "Prince",
  "Kate Bush",
  "Talking Heads",
  "The Velvet Underground",
  "Aretha Franklin",
];

function getRandomArtistPlaceholders(count = ONBOARDING_PLACEHOLDER_COUNT) {
  const pool = [...CURATED_ARTIST_PLACEHOLDER_POOL];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, Math.min(count, pool.length)).map((artist) => `e.g. ${artist}`);
}

const ARTIST_INPUT_PALETTES = [
  { fill: "#68aed4", border: "#234975", text: "#16171a", shadow: "#002859" },
  { fill: "#10d275", border: "#007899", text: "#16171a", shadow: "#002859" },
  { fill: "#ffd100", border: "#ff8426", text: "#16171a", shadow: "#7f0622" },
  { fill: "#ff80a4", border: "#94216a", text: "#16171a", shadow: "#430067" },
  { fill: "#ff8426", border: "#7f0622", text: "#16171a", shadow: "#430067" },
];

const ARTIST_GRAPH_VIEWBOX = {
  width: 560,
  height: 360,
};

const GENRE_COLORS = {
  "alternative": "#f97316",
  "alternative rock": "#fb923c",
  "art rock": "#f59e0b",
  "baroque pop": "#f9a8d4",
  "country": "#d97706",
  "country pop": "#f59e0b",
  "dance": "#34d399",
  "dance-punk": "#2dd4bf",
  "dream pop": "#818cf8",
  "electronic": "#10b981",
  "folk": "#a78bfa",
  "hip-hop/rap": "#22d3ee",
  "indie": "#c084fc",
  "indie folk": "#b794f4",
  "indie pop": "#f472b6",
  "indie rock": "#f59e0b",
  "jazz": "#eab308",
  "metal": "#ef4444",
  "new wave": "#c084fc",
  "pop": "#ff6b9d",
  "post-punk": "#fb7185",
  "psychedelic": "#a855f7",
  "r&b": "#8b5cf6",
  "r&b/soul": "#8b5cf6",
  "rock": "#ef4444",
  "shoegaze": "#93c5fd",
  "singer-songwriter": "#a78bfa",
  "trip-hop": "#6366f1",
};

const PIXEL_ASSETS = {
  logo: "/pixel/logo.png",
  bgTile: "/pixel/bg-tile.png",
  panelFrame: "/pixel/panel-frame.png",
  buttonPrimary: "/pixel/button-primary.png",
  buttonSecondary: "/pixel/button-secondary.png",
  buttonDanger: "/pixel/button-danger.png",
  badgePill: "/pixel/badge-pill.png",
};

const PIXEL_DISPLAY_FONT = "'Silkscreen', monospace";
const PIXEL_BODY_FONT = "'VT323', monospace";
const PANEL_FRAME_SLICE = 16;
const PIXEL_BACKGROUND_BLUE = "#002859";
const PIXEL_TILE_BACKGROUND = `linear-gradient(rgba(0, 40, 89, 0.78), rgba(0, 40, 89, 0.78)), url(${PIXEL_ASSETS.bgTile})`;

const PANEL_FRAME_BASE = {
  borderStyle: "solid",
  borderWidth: `${PANEL_FRAME_SLICE}px`,
  borderImageSource: `url(${PIXEL_ASSETS.panelFrame})`,
  borderImageSlice: `${PANEL_FRAME_SLICE}`,
  borderImageWidth: `${PANEL_FRAME_SLICE}px`,
  borderImageRepeat: "stretch",
  boxSizing: "border-box",
  imageRendering: "pixelated",
  backgroundColor: PIXEL_BACKGROUND_BLUE,
  backgroundImage: PIXEL_TILE_BACKGROUND,
  backgroundRepeat: "repeat, repeat",
  backgroundSize: "auto, 32px 32px",
  backgroundBlendMode: "multiply",
};

const PIXEL_BOX_BASE = {
  backgroundColor: PIXEL_BACKGROUND_BLUE,
  backgroundImage: PIXEL_TILE_BACKGROUND,
  backgroundRepeat: "repeat, repeat",
  backgroundSize: "auto, 32px 32px",
  backgroundBlendMode: "multiply",
  border: "3px solid #23304b",
  boxShadow: "6px 6px 0 rgba(4, 8, 18, 0.68)",
  boxSizing: "border-box",
};

function createPixelButtonStyle(
  assetPath,
  {
    color = "#f8fafc",
    minHeight = "48px",
    padding = "12px 18px",
    backgroundSize = "32px 32px",
    fontSize = "12px",
  } = {},
) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight,
    padding,
    border: "none",
    backgroundColor: "#18233a",
    backgroundImage: `url(${assetPath})`,
    backgroundRepeat: "round",
    backgroundSize,
    color,
    textDecoration: "none",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize,
    lineHeight: 1.35,
    cursor: "pointer",
    boxShadow: "0 6px 0 rgba(4, 8, 18, 0.72)",
    imageRendering: "pixelated",
    transition: "transform 0.14s ease, filter 0.14s ease",
  };
}

function createBadgeSkinStyle({ color = "#f8fafc", fontSize = "11px", padding = "5px 12px" } = {}) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "32px",
    padding,
    backgroundColor: "#1a2032",
    backgroundImage: `url(${PIXEL_ASSETS.badgePill})`,
    backgroundRepeat: "round",
    backgroundSize: "96px 32px",
    color,
    fontSize,
    fontFamily: PIXEL_DISPLAY_FONT,
    lineHeight: 1.2,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    imageRendering: "pixelated",
  };
}

function normalizeText(value = "") {
  return value.trim().toLowerCase();
}

function normalizeLookupKey(value = "") {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’'`"]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase()
    .trim();
}

function formatDecade(year) {
  return Number.isFinite(year) ? `${Math.floor(year / 10) * 10}s` : "Unknown";
}

function formatGenreLabel(genre = "music") {
  return genre
    .replace(/\//g, " / ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeTracks(tracks, excludeIds = new Set()) {
  const seen = new Set(excludeIds);
  return tracks.filter((track) => {
    if (!track?.id || seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function mergeCatalog(current, incoming) {
  return dedupeTracks([...current, ...incoming]);
}

function countValues(items, getKey) {
  const counts = {};
  items.forEach((item) => {
    const key = getKey(item);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function getSortedEntries(map, { positiveOnly = false } = {}) {
  return Object.entries(map)
    .filter(([, value]) => (positiveOnly ? value > 0 : true))
    .sort((a, b) => b[1] - a[1]);
}

function getTopGenresFromTracks(tracks, limit = 2) {
  const counts = {};
  tracks.forEach((track) => {
    track.genres.forEach((genre) => {
      counts[genre] = (counts[genre] || 0) + 1;
    });
  });
  return getSortedEntries(counts).slice(0, limit).map(([genre]) => genre);
}

function getPrimaryGenreKey(track) {
  return normalizeText(track?.genres?.[0] || "music");
}

function pushHistory(history, value, limit, normalize = (item) => item) {
  if (!value) return history;
  return [...history, normalize(value)].slice(-limit);
}

function getHistorySet(history = []) {
  return new Set(history);
}

function createArtistExposureMemory() {
  return {
    events: [],
    updatedAt: 0,
  };
}

function pruneArtistExposureEvents(events = []) {
  const cutoff = Date.now() - SEARCH_CONFIG.exposureRetentionMs;
  return events
    .filter(
      (event) =>
        event &&
        typeof event.artistKey === "string" &&
        typeof event.timestamp === "number" &&
        event.timestamp >= cutoff,
    )
    .slice(-SEARCH_CONFIG.exposureMaxEvents);
}

function loadArtistExposureMemory() {
  if (typeof window === "undefined" || !window.localStorage) return createArtistExposureMemory();

  try {
    const raw = window.localStorage.getItem(ARTIST_EXPOSURE_STORAGE_KEY);
    if (!raw) return createArtistExposureMemory();
    const parsed = JSON.parse(raw);
    return {
      events: pruneArtistExposureEvents(Array.isArray(parsed?.events) ? parsed.events : []),
      updatedAt: typeof parsed?.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return createArtistExposureMemory();
  }
}

function saveArtistExposureMemory(memory) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    window.localStorage.setItem(
      ARTIST_EXPOSURE_STORAGE_KEY,
      JSON.stringify({
        events: pruneArtistExposureEvents(memory?.events || []),
        updatedAt: memory?.updatedAt || Date.now(),
      }),
    );
  } catch {
    // localStorage can be unavailable or full; fall back to session-only memory.
  }
}

function trimSeenSet(seen, limit = SEARCH_CONFIG.sessionSeenLimit) {
  const ids = Array.from(seen || []).slice(-limit);
  return new Set(ids);
}

function loadSeenTracks() {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_TRACKS_STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return trimSeenSet(new Set(Array.isArray(ids) ? ids : []));
  } catch {
    return new Set();
  }
}

function saveSeenTracks(seen) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const ids = [...trimSeenSet(seen, SEEN_TRACKS_MAX)];
    window.localStorage.setItem(SEEN_TRACKS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable or full; seen deduplication will be session-only.
  }
}

function clearPersistentDiscoveryMemory() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(SEEN_TRACKS_STORAGE_KEY);
  } catch {
    // Ignore storage failures and fall back to in-memory resets.
  }
}

function saveTasteProfile(engine) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      TASTE_PROFILE_KEY,
      JSON.stringify({
        genreScores: engine.genreScores,
        decadeScores: engine.decadeScores,
        clusterScores: engine.clusterScores,
        savedAt: Date.now(),
      }),
    );
  } catch {}
}

function loadTasteProfile(decayFactor = 0.5) {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(TASTE_PROFILE_KEY);
    if (!raw) return null;
    const { genreScores, decadeScores, clusterScores } = JSON.parse(raw);
    const decay = (obj) =>
      Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k, typeof v === "number" ? v * decayFactor : v]));
    return {
      genreScores: decay(genreScores),
      decadeScores: decay(decadeScores),
      clusterScores: decay(clusterScores),
    };
  } catch {
    return null;
  }
}

function createArtistExposureSnapshot(memory) {
  const events = pruneArtistExposureEvents(memory?.events || []);
  const cutoff = Date.now() - SEARCH_CONFIG.exposurePenaltyWindowMs;
  const blockedArtistKeys = new Set(
    events.slice(-SEARCH_CONFIG.exposureRecentArtistLimit).map((event) => event.artistKey),
  );
  const recentCounts = {};

  events.forEach((event) => {
    if (event.timestamp < cutoff) return;
    recentCounts[event.artistKey] = (recentCounts[event.artistKey] || 0) + 1;
  });

  return {
    events,
    blockedArtistKeys,
    recentCounts,
  };
}

function getArtistExposureStats(snapshot, artist) {
  const artistKey = normalizeCatalogArtistName(artist);
  const recentCount = snapshot?.recentCounts?.[artistKey] || 0;
  return {
    artistKey,
    hardBlocked: snapshot?.blockedArtistKeys?.has(artistKey) || false,
    recentCount,
    underexposed: recentCount === 0,
  };
}

function recordSurfacedArtists(memory, tracks) {
  const now = Date.now();
  const seenPairArtists = new Set();
  const nextEvents = [...pruneArtistExposureEvents(memory?.events || [])];

  tracks.forEach((track) => {
    const artistKey = normalizeCatalogArtistName(track?.artist);
    if (!artistKey || seenPairArtists.has(artistKey)) return;
    seenPairArtists.add(artistKey);
    nextEvents.push({ artistKey, timestamp: now });
  });

  return {
    events: pruneArtistExposureEvents(nextEvents),
    updatedAt: now,
  };
}

function filterExposureBlockedTracks(tracks, exposureMemory) {
  const snapshot = createArtistExposureSnapshot(exposureMemory);
  return tracks.filter((track) => {
    const artistKey = normalizeCatalogArtistName(track.artist);
    const sourceArtistKey = normalizeCatalogArtistName(track.sourceArtist || track.artist);
    if (isBlockedRecommendationArtist(track.artist) || isBlockedRecommendationArtist(track.sourceArtist || track.artist)) {
      return false;
    }
    if (!snapshot.blockedArtistKeys.size) return true;
    return !snapshot.blockedArtistKeys.has(artistKey) && !snapshot.blockedArtistKeys.has(sourceArtistKey);
  });
}

function getMainstreamPenalty(name = "") {
  if (isBlockedRecommendationArtist(name)) return Number.POSITIVE_INFINITY;
  const discoveryWeight = getArtistDiscoveryWeight(name);
  if (discoveryWeight >= 1) return 0;
  return (1 - discoveryWeight) * 8.5;
}

function getVotedArtistBlockSet(engine) {
  return new Set(
    [
      ...Object.keys(engine?.likedArtists || {}),
      ...Object.keys(engine?.dislikedArtists || {}),
    ]
      .map((artist) => normalizeCatalogArtistName(artist))
      .filter(Boolean),
  );
}

function filterVotedArtistBlockedTracks(tracks, engine) {
  const blockedArtists = getVotedArtistBlockSet(engine);
  if (!blockedArtists.size) return tracks;
  return tracks.filter((track) => !blockedArtists.has(normalizeCatalogArtistName(track.artist)));
}

function getWeightedRandomEntry(entries, getWeight) {
  if (!entries.length) return null;

  const rawWeights = entries.map((entry) => Math.max(0.05, getWeight(entry)));
  const totalWeight = rawWeights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return entries[0];

  let cursor = Math.random() * totalWeight;
  for (let index = 0; index < entries.length; index += 1) {
    cursor -= rawWeights[index];
    if (cursor <= 0) return entries[index];
  }

  return entries[entries.length - 1];
}

function pruneSeenTracks(catalog, seen) {
  return catalog.filter((track) => !seen.has(track.id));
}

function resolveArtistNameFromKey(artistKey, catalog = [], liked = [], seedArtists = [], editorialItems = []) {
  if (!artistKey) return "";
  if (LOCAL_ARTIST_CATALOG[artistKey]?.name) return LOCAL_ARTIST_CATALOG[artistKey].name;

  const trackMatch = [...catalog, ...liked].find(
    (track) => normalizeCatalogArtistName(track.artist) === artistKey,
  );
  if (trackMatch) return trackMatch.artist;

  const seedMatch = seedArtists.find((artist) => normalizeCatalogArtistName(artist) === artistKey);
  if (seedMatch) return seedMatch;

  const editorialMatch = editorialItems.find(
    (item) =>
      normalizeCatalogArtistName(item.artist) === artistKey || normalizeLookupKey(item.artist) === artistKey,
  );
  return editorialMatch?.artist || artistKey;
}

function limitRefillBatchTracks(tracks, limit) {
  const artistCounts = {};
  const sourceArtistCounts = {};
  const genreCounts = {};

  return tracks.filter((track) => {
    if (!track?.id) return false;

    const artistKey = normalizeCatalogArtistName(track.artist);
    const sourceArtistKey = normalizeCatalogArtistName(track.sourceArtist || track.artist);
    const genreKey = getPrimaryGenreKey(track);

    if ((artistCounts[artistKey] || 0) >= SEARCH_CONFIG.refillMaxTracksPerArtist) return false;
    if ((sourceArtistCounts[sourceArtistKey] || 0) >= SEARCH_CONFIG.refillMaxTracksPerSourceArtist) return false;
    if ((genreCounts[genreKey] || 0) >= SEARCH_CONFIG.refillMaxTracksPerGenre) return false;

    artistCounts[artistKey] = (artistCounts[artistKey] || 0) + 1;
    sourceArtistCounts[sourceArtistKey] = (sourceArtistCounts[sourceArtistKey] || 0) + 1;
    genreCounts[genreKey] = (genreCounts[genreKey] || 0) + 1;
    return true;
  }).slice(0, limit);
}

function getArtistCooldownSet(engine) {
  const blocked = new Set();
  Object.entries(engine.artistCooldowns || {}).forEach(([artist, remaining]) => {
    if (remaining > 0) blocked.add(artist);
  });
  return blocked;
}

function isArtistCooling(artist, coolingArtistSet) {
  return coolingArtistSet.has(normalizeCatalogArtistName(artist));
}

function filterCoolingArtists(tracks, coolingArtistSet) {
  if (!coolingArtistSet.size) return tracks;
  return tracks.filter((track) => !isArtistCooling(track.artist, coolingArtistSet));
}

function advanceArtistCooldowns(cooldowns, currentArtist) {
  const nextCooldowns = {};
  const currentArtistKey = normalizeCatalogArtistName(currentArtist);

  Object.entries(cooldowns || {}).forEach(([artistKey, remaining]) => {
    if (artistKey === currentArtistKey || remaining <= 0) return;
    const nextRemaining = remaining - 1;
    if (nextRemaining > 0) nextCooldowns[artistKey] = nextRemaining;
  });

  return nextCooldowns;
}

function buildRecommendationReason({ discoveryMode = "seed-artist", sourceArtist, reasonGenre }) {
  if (discoveryMode === "similar-artist" && sourceArtist) return `Similar to ${sourceArtist}`;
  if (discoveryMode === "genre-fallback" && reasonGenre) return `Matches your ${formatGenreLabel(reasonGenre).toLowerCase()} tastes`;
  if (discoveryMode === "genre-fallback" && sourceArtist) return `Expands beyond ${sourceArtist}`;
  if (sourceArtist) return `Anchor track from ${sourceArtist}`;
  return "Discovery pick";
}


function createEngine(tasteProfile = null) {
  return {
    liked: [],
    disliked: [],
    seen: new Set(),
    likedArtists: {},
    dislikedArtists: {},
    artistCooldowns: {},
    genreScores: { ...(tasteProfile?.genreScores || {}) },
    decadeScores: { ...(tasteProfile?.decadeScores || {}) },
    clusterScores: { ...(tasteProfile?.clusterScores || {}) },
    recentArtists: [],
    artistHistory: [],
    sourceArtistHistory: [],
    genreHistory: [],
    recentRefillDrivers: [],
    cardsShown: 0,
    openingMix: { discovery: 0, seed: 0 },
  };
}

function adjustNamedScore(map, key, delta) {
  if (!key) return;
  map[key] = (map[key] || 0) + delta;
  if (Math.abs(map[key]) < 0.05) delete map[key];
}

function updateEngine(engine, song, liked) {
  const next = {
    liked: liked ? [...engine.liked, song] : [...engine.liked],
    disliked: liked ? [...engine.disliked] : [...engine.disliked, song],
    seen: new Set(engine.seen),
    likedArtists: { ...engine.likedArtists },
    dislikedArtists: { ...engine.dislikedArtists },
    artistCooldowns: advanceArtistCooldowns(engine.artistCooldowns, song.artist),
    genreScores: { ...engine.genreScores },
    decadeScores: { ...engine.decadeScores },
    clusterScores: { ...engine.clusterScores },
    recentArtists: [...engine.recentArtists],
    artistHistory: [...(engine.artistHistory || [])],
    sourceArtistHistory: [...(engine.sourceArtistHistory || [])],
    genreHistory: [...(engine.genreHistory || [])],
    recentRefillDrivers: [...(engine.recentRefillDrivers || [])],
    cardsShown: engine.cardsShown + 1,
    openingMix: { ...engine.openingMix },
  };

  next.seen.add(song.id);
  next.seen = trimSeenSet(next.seen);

  if (liked) {
    next.likedArtists[song.artist] = (next.likedArtists[song.artist] || 0) + 1;
  } else {
    next.dislikedArtists[song.artist] = (next.dislikedArtists[song.artist] || 0) + 1;
  }

  if ((next.likedArtists[song.artist] || 0) > 0) {
    next.artistCooldowns[normalizeCatalogArtistName(song.artist)] = SEARCH_CONFIG.likedArtistCooldownCards;
  }

  song.genres.forEach((genre, index) => {
    const weight = index === 0 ? 1 : 0.2;
    adjustNamedScore(next.genreScores, genre, (liked ? 1 : -1) * weight);
  });

  const decade = formatDecade(song.era);
  next.decadeScores[decade] = (next.decadeScores[decade] || 0) + (liked ? 1 : -1);
  if (next.decadeScores[decade] === 0) delete next.decadeScores[decade];

  const openingBucket = song.discoveryMode === "seed-artist" ? "seed" : "discovery";
  next.openingMix[openingBucket] = (next.openingMix[openingBucket] || 0) + 1;

  getClusterNeighbors(song.artist, SEARCH_CONFIG.clusterNeighborLimit).forEach((neighbor) => {
    adjustNamedScore(
      next.clusterScores,
      normalizeCatalogArtistName(neighbor.name),
      (liked ? 1 : -1) * neighbor.weight,
    );
  });

  if (song.sourceArtist && song.sourceArtist !== song.artist) {
    adjustNamedScore(
      next.clusterScores,
      normalizeCatalogArtistName(song.sourceArtist),
      liked ? 0.35 : -0.35,
    );
  }

  next.recentArtists = [...next.recentArtists, song.artist].slice(-2);
  next.artistHistory = pushHistory(
    next.artistHistory,
    song.artist,
    SEARCH_CONFIG.artistHistoryLimit,
    normalizeCatalogArtistName,
  );
  next.sourceArtistHistory = pushHistory(
    next.sourceArtistHistory,
    song.sourceArtist || song.artist,
    SEARCH_CONFIG.sourceArtistHistoryLimit,
    normalizeCatalogArtistName,
  );
  next.genreHistory = pushHistory(next.genreHistory, getPrimaryGenreKey(song), SEARCH_CONFIG.genreHistoryLimit);
  return next;
}

function scoreSong(engine, song, exposureMemory = createArtistExposureMemory()) {
  if (isBlockedRecommendationArtist(song.artist) || isBlockedRecommendationArtist(song.sourceArtist || song.artist)) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;
  const clusterKey = normalizeCatalogArtistName(song.artist);
  const sourceArtistKey = normalizeCatalogArtistName(song.sourceArtist || song.artist);
  const genreKey = getPrimaryGenreKey(song);
  const recentArtistSet = getHistorySet(engine.artistHistory);
  const recentSourceArtists = getHistorySet(engine.sourceArtistHistory);
  const recentGenres = engine.genreHistory || [];
  const recentGenreCount = recentGenres.filter((recentGenre) => recentGenre === genreKey).length;
  const exposureSnapshot = createArtistExposureSnapshot(exposureMemory);
  const artistExposure = getArtistExposureStats(exposureSnapshot, song.artist);
  const sourceArtistExposure = getArtistExposureStats(exposureSnapshot, song.sourceArtist || song.artist);
  const neighborhoodRepeatCount = getClusterNeighbors(song.artist, SEARCH_CONFIG.clusterNeighborLimit).filter((neighbor) => {
    const neighborKey = normalizeCatalogArtistName(neighbor.name);
    return recentArtistSet.has(neighborKey) || exposureSnapshot.blockedArtistKeys.has(neighborKey);
  }).length;
  const sourceNeighborhoodRepeatCount =
    song.sourceArtist && song.sourceArtist !== song.artist
      ? getClusterNeighbors(song.sourceArtist, SEARCH_CONFIG.clusterNeighborLimit).filter((neighbor) => {
          const neighborKey = normalizeCatalogArtistName(neighbor.name);
          return recentArtistSet.has(neighborKey) || exposureSnapshot.blockedArtistKeys.has(neighborKey);
        }).length
      : 0;
  const discoveryWeight = song.discoveryWeight ?? getArtistDiscoveryWeight(song.artist);
  const mainstreamPenalty = getMainstreamPenalty(song.artist) + getMainstreamPenalty(song.sourceArtist || song.artist) * 0.45;

  if (engine.dislikedArtists[song.artist]) score -= 3;

  if (song.sourceArtist && song.sourceArtist !== song.artist) {
    score += (engine.likedArtists[song.sourceArtist] || 0) * 0.85;
    score -= (engine.dislikedArtists[song.sourceArtist] || 0) * 0.85;
  }

  score += (engine.clusterScores[clusterKey] || 0) * 1.25;

  song.genres.forEach((genre) => {
    score += (engine.genreScores[genre] || 0) * 1.5;
  });

  score += (engine.decadeScores[formatDecade(song.era)] || 0) * 0.5;

  if (song.previewUrl) score += 0.5;
  if (recentSourceArtists.has(sourceArtistKey)) score -= 1.5;
  if (!recentGenres.includes(genreKey)) score += 0.75;
  if (!engine.genreScores[genreKey] || engine.genreScores[genreKey] <= 0) score += 0.6;
  if (recentGenreCount >= 3) score -= 0.5;
  if (artistExposure.recentCount >= SEARCH_CONFIG.exposurePenaltyRepeatThreshold) score -= 2.8;
  if (sourceArtistExposure.recentCount >= SEARCH_CONFIG.exposurePenaltyRepeatThreshold) score -= 1.2;
  if (neighborhoodRepeatCount) score -= neighborhoodRepeatCount * 0.85;
  if (sourceNeighborhoodRepeatCount) score -= sourceNeighborhoodRepeatCount * 0.45;
  if (artistExposure.underexposed) score += 1.25;
  if (sourceArtistExposure.underexposed) score += 0.6;
  score += (discoveryWeight - 1) * 4.25;
  score -= mainstreamPenalty;

  if (engine.cardsShown < SEARCH_CONFIG.discoveryBiasCards) {
    if (song.discoveryMode === "seed-artist") score -= 2.2;
    else score += 1.1;
  }

  if (song.discoveryMode === "genre-fallback") score += 0.2;
  if (song.editorialWeight) {
    const editorialMultiplier =
      song.editorialMatchMode === "album-exact"
        ? SEARCH_CONFIG.editorialAlbumBoost
        : SEARCH_CONFIG.editorialArtistBoost;
    score += Math.min(SEARCH_CONFIG.editorialBoostClamp, song.editorialWeight * editorialMultiplier);
  }

  return score + Math.random() * 0.35;
}

function filterForOpeningMix(scoredSongs, engine) {
  if (engine.cardsShown >= SEARCH_CONFIG.openingWindow) return scoredSongs;

  const discoverySongs = scoredSongs.filter(({ song }) => song.discoveryMode !== "seed-artist");
  if (!discoverySongs.length) return scoredSongs;

  const discoveryCount = engine.openingMix.discovery || 0;
  const seedCount = engine.openingMix.seed || 0;
  const slotsRemaining = SEARCH_CONFIG.openingWindow - engine.cardsShown;
  const discoveryNeeded = Math.max(0, SEARCH_CONFIG.openingDiscoveryMin - discoveryCount);

  if (engine.cardsShown === 0) return discoverySongs;
  if (seedCount >= SEARCH_CONFIG.openingSeedMax) return discoverySongs;
  if (discoveryNeeded >= slotsRemaining) return discoverySongs;

  return scoredSongs;
}

function getRankedCandidates(engine, catalog, excludeTrackIds = new Set(), exposureMemory = createArtistExposureMemory()) {
  const coolingArtistSet = getArtistCooldownSet(engine);
  const recentArtistSet = getHistorySet(engine.artistHistory);
  const exposureSnapshot = createArtistExposureSnapshot(exposureMemory);
  const votedArtistBlockSet = getVotedArtistBlockSet(engine);
  const eligible = catalog.filter(
    (track) =>
      !excludeTrackIds.has(track.id) &&
      !engine.seen.has(track.id) &&
      !isBlockedRecommendationArtist(track.artist) &&
      !votedArtistBlockSet.has(normalizeCatalogArtistName(track.artist)) &&
      !isBlockedRecommendationArtist(track.sourceArtist || track.artist) &&
      !isArtistCooling(track.artist, coolingArtistSet) &&
      !recentArtistSet.has(normalizeCatalogArtistName(track.artist)) &&
      !exposureSnapshot.blockedArtistKeys.has(normalizeCatalogArtistName(track.artist)),
  );
  if (!eligible.length) return [];

  const scored = eligible
    .map((song) => ({ song, score: scoreSong(engine, song, exposureMemory) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score);

  const filtered = filterForOpeningMix(scored, engine);
  return filtered.length ? filtered : scored;
}

function pickStretchCandidate(safeEntry, rankedCandidates, engine, exposureMemory = createArtistExposureMemory()) {
  const safeSong = safeEntry.song;
  const safeGenre = getPrimaryGenreKey(safeSong);
  const exposureSnapshot = createArtistExposureSnapshot(exposureMemory);
  const strictPool = rankedCandidates.filter(({ song }) => {
    if (song.id === safeSong.id) return false;
    if (normalizeCatalogArtistName(song.artist) === normalizeCatalogArtistName(safeSong.artist)) return false;
    if (normalizeCatalogArtistName(song.sourceArtist || song.artist) === normalizeCatalogArtistName(safeSong.sourceArtist || safeSong.artist)) {
      return false;
    }
    return true;
  });

  const fallbackPool = rankedCandidates.filter(
    ({ song }) => song.id !== safeSong.id && normalizeCatalogArtistName(song.artist) !== normalizeCatalogArtistName(safeSong.artist),
  );

  const pool = strictPool.length ? strictPool : fallbackPool;
  if (!pool.length) return null;

  const stretchBand = pool.slice(0, Math.min(SEARCH_CONFIG.stretchBandSize, pool.length));
  const minScore = Math.min(...stretchBand.map((entry) => entry.score));

  return getWeightedRandomEntry(stretchBand, (entry) => {
    const genreKey = getPrimaryGenreKey(entry.song);
    const exposure = getArtistExposureStats(exposureSnapshot, entry.song.artist);
    let value = entry.score - minScore + 0.6;
    if (genreKey !== safeGenre) value += 1.6;
    if ((entry.song.sourceArtist || entry.song.artist) !== (safeSong.sourceArtist || safeSong.artist)) value += 1;
    if (entry.song.discoveryMode !== "seed-artist") value += 0.9;
    if (!engine.likedArtists[entry.song.artist]) value += 0.45;
    if (entry.song.editorialWeight) value += 0.4;
    if (exposure.underexposed) value += 1;
    value += Math.max(0.2, entry.song.discoveryWeight || 1) * 1.1;
    return value;
  });
}

function buildNextPair(engine, catalog, exposureMemory = createArtistExposureMemory()) {
  const rankedCandidates = getRankedCandidates(engine, catalog, new Set(), exposureMemory);
  if (rankedCandidates.length < 2) return null;

  const safeBand = rankedCandidates.slice(0, Math.min(SEARCH_CONFIG.safeBandSize, rankedCandidates.length));
  const minSafeScore = Math.min(...safeBand.map((entry) => entry.score));
  const safeEntry =
    getWeightedRandomEntry(safeBand, (entry) => {
      let value = entry.score - minSafeScore + 0.75;
      if (entry.song.discoveryMode !== "seed-artist") value += 0.55;
      if (entry.song.editorialWeight) value += 0.25;
      value += Math.max(0.2, entry.song.discoveryWeight || 1) * 0.8;
      return value;
    }) || rankedCandidates[0];
  const stretchEntry = pickStretchCandidate(safeEntry, rankedCandidates.slice(1), engine, exposureMemory);
  if (!stretchEntry) return null;

  const safeSong = safeEntry.song;
  const stretchSong = stretchEntry.song;
  if (Math.random() < 0.5) {
    return { left: safeSong, right: stretchSong };
  }
  return { left: stretchSong, right: safeSong };
}

function buildRecoveryEngine(engine) {
  return {
    ...engine,
    seen: trimSeenSet(engine.seen, SEARCH_CONFIG.recoverySeenLimit),
    artistCooldowns: {},
    recentArtists: [],
    artistHistory: [],
    sourceArtistHistory: [],
    genreHistory: [],
    recentRefillDrivers: [],
  };
}

function buildEmergencyRepeatPair(engine, catalog, exposureMemory = createArtistExposureMemory()) {
  const exposureSnapshot = createArtistExposureSnapshot(exposureMemory);
  const votedArtistBlockSet = getVotedArtistBlockSet(engine);
  const candidates = dedupeTracks(
    catalog.filter(
      (track) =>
        !isBlockedRecommendationArtist(track.artist) &&
        !votedArtistBlockSet.has(normalizeCatalogArtistName(track.artist)) &&
        !isBlockedRecommendationArtist(track.sourceArtist || track.artist),
    ),
  );

  if (candidates.length < 2) return null;

  const scored = candidates
    .map((song) => {
      const artistExposure = getArtistExposureStats(exposureSnapshot, song.artist);
      const sourceExposure = getArtistExposureStats(exposureSnapshot, song.sourceArtist || song.artist);
      const discoveryWeight = song.discoveryWeight ?? getArtistDiscoveryWeight(song.artist);
      const editorialBoost = Math.min(SEARCH_CONFIG.editorialBoostClamp, song.editorialWeight || 0);
      const mainstreamPenalty = getMainstreamPenalty(song.artist) + getMainstreamPenalty(song.sourceArtist || song.artist) * 0.4;
      const noveltyBonus = (artistExposure.underexposed ? 1.2 : 0) + (sourceExposure.underexposed ? 0.5 : 0);

      return {
        song,
        score: discoveryWeight * 4.4 + editorialBoost * 0.85 + noveltyBonus - mainstreamPenalty - artistExposure.recentCount * 0.9,
      };
    })
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score);

  if (scored.length < 2) return null;

  const safeBand = scored.slice(0, Math.min(12, scored.length));
  const minScore = Math.min(...safeBand.map((entry) => entry.score));
  const safeEntry =
    getWeightedRandomEntry(safeBand, (entry) => entry.score - minScore + Math.max(0.2, entry.song.discoveryWeight || 1)) ||
    safeBand[0];

  const preferredStretchPool = scored.filter(
    ({ song }) =>
      song.id !== safeEntry.song.id &&
      normalizeCatalogArtistName(song.artist) !== normalizeCatalogArtistName(safeEntry.song.artist) &&
      normalizeCatalogArtistName(song.sourceArtist || song.artist) !==
        normalizeCatalogArtistName(safeEntry.song.sourceArtist || safeEntry.song.artist),
  );
  const fallbackStretchPool = scored.filter(({ song }) => song.id !== safeEntry.song.id);
  const stretchPool = preferredStretchPool.length ? preferredStretchPool : fallbackStretchPool;
  if (!stretchPool.length) return null;

  const stretchBand = stretchPool.slice(0, Math.min(16, stretchPool.length));
  const stretchMinScore = Math.min(...stretchBand.map((entry) => entry.score));
  const stretchEntry =
    getWeightedRandomEntry(stretchBand, (entry) => {
      let value = entry.score - stretchMinScore + Math.max(0.2, entry.song.discoveryWeight || 1);
      if (getPrimaryGenreKey(entry.song) !== getPrimaryGenreKey(safeEntry.song)) value += 0.8;
      if (entry.song.editorialWeight) value += 0.4;
      return value;
    }) || stretchBand[0];

  return Math.random() < 0.5
    ? { left: safeEntry.song, right: stretchEntry.song }
    : { left: stretchEntry.song, right: safeEntry.song };
}


async function collectTaskResults(
  tasks,
  { flatten = true, concurrency = SEARCH_CONFIG.liveSearchConcurrency } = {},
) {
  if (!tasks.length) {
    return {
      results: [],
      failureCount: 0,
      failures: [],
      settled: [],
    };
  }

  const settled = new Array(tasks.length);
  const failures = [];
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const task = tasks[currentIndex];

      try {
        settled[currentIndex] = await task.run();
      } catch (error) {
        failures.push({
          index: currentIndex,
          label: task.label || `task-${currentIndex + 1}`,
          error,
        });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => runWorker()),
  );

  return {
    results: flatten
      ? settled.flatMap((value) => {
          if (value == null) return [];
          return Array.isArray(value) ? value : [value];
        })
      : settled.filter((value) => value !== undefined),
    failureCount: failures.length,
    failures,
    settled,
  };
}

function appendSkippedLookupNote(message, skippedLookups) {
  if (!skippedLookups) return message;
  return `${message.replace(/[.\s]+$/, "")}; some live lookups were skipped.`;
}

function getEditorialAnchorArtists(engine, seedArtists) {
  const likedArtists = getSortedEntries(countValues(engine.liked, (track) => track.artist)).map(([artist]) => artist);

  return uniqueBy(
    [
      ...seedArtists.map((artist) => ({ name: artist, type: "seed" })),
      ...likedArtists.map((artist) => ({ name: artist, type: "liked" })),
    ],
    (artist) => normalizeLookupKey(artist.name),
  );
}

function getPositiveGenreTerms(engine) {
  return getSortedEntries(engine.genreScores, { positiveOnly: true }).map(([genre]) => normalizeText(genre));
}

function findEditorialGraphAnchor(artistKey, anchors) {
  return (
    anchors.find((anchor) =>
      getClusterNeighbors(anchor.name, SEARCH_CONFIG.clusterNeighborLimit).some(
        (neighbor) => normalizeLookupKey(neighbor.name) === artistKey,
      ),
    ) || null
  );
}

function getEditorialContext(item, engine, seedArtists) {
  const anchors = getEditorialAnchorArtists(engine, seedArtists);
  const exactAnchor = anchors.find((anchor) => normalizeLookupKey(anchor.name) === item.artistKey);

  if (exactAnchor) {
    return {
      matchType: "exact-artist",
      sourceArtist: exactAnchor.name,
      discoveryMode: exactAnchor.type === "seed" ? "seed-artist" : "similar-artist",
      recommendedBecause:
        exactAnchor.type === "seed"
          ? `Anchor track from ${exactAnchor.name}`
          : `Because you liked ${exactAnchor.name}`,
    };
  }

  const graphAnchor = findEditorialGraphAnchor(item.artistKey, anchors);
  if (graphAnchor) {
    return {
      matchType: "graph-neighbor",
      sourceArtist: graphAnchor.name,
      discoveryMode: "similar-artist",
      recommendedBecause:
        graphAnchor.type === "seed"
          ? `Similar to ${graphAnchor.name}`
          : `Because you liked ${graphAnchor.name}`,
    };
  }

  const positiveGenres = getPositiveGenreTerms(engine);
  const catalogGenres = getArtistCatalogEntry(item.artist)?.genres || [];
  const matchedGenre = positiveGenres.find((genre) =>
    catalogGenres.some((catalogGenre) => genre === catalogGenre || genre.includes(catalogGenre) || catalogGenre.includes(genre)),
  );

  if (matchedGenre) {
    return {
      matchType: "genre-overlap",
      sourceArtist: anchors[0]?.name || item.artist,
      discoveryMode: "genre-fallback",
      reasonGenre: matchedGenre,
      recommendedBecause: `Matches your ${formatGenreLabel(matchedGenre).toLowerCase()} likes`,
    };
  }

  const clusterAffinity =
    engine.clusterScores[item.artistKey] || engine.clusterScores[normalizeCatalogArtistName(item.artist)] || 0;

  if (clusterAffinity > 0) {
    const fallbackAnchor = anchors[0];
    return {
      matchType: "cluster-affinity",
      sourceArtist: fallbackAnchor?.name || item.artist,
      discoveryMode: "similar-artist",
      recommendedBecause: fallbackAnchor
        ? `Because you liked ${fallbackAnchor.name}`
        : `Similar to ${item.artist}`,
    };
  }

  return null;
}

function selectEditorialCandidates(editorialItems, engine, seedArtists, limit, exposureMemory = createArtistExposureMemory()) {
  const matchPriority = {
    "exact-artist": 3,
    "graph-neighbor": 2.5,
    "genre-overlap": 1.5,
    "cluster-affinity": 1,
  };
  const exposureSnapshot = createArtistExposureSnapshot(exposureMemory);

  return editorialItems
    .map((item) => {
      if (isBlockedRecommendationArtist(item.artist)) return null;
      const context = getEditorialContext(item, engine, seedArtists);
      if (!context) return null;
      const exposure = getArtistExposureStats(exposureSnapshot, item.artist);
      if (exposure.hardBlocked) return null;

      return {
        item,
        context,
        score:
          item.editorialWeight +
          (matchPriority[context.matchType] || 0) +
          (exposure.underexposed ? 2.1 : 0) -
          Math.max(0, exposure.recentCount - 1) * 1.4 +
          (getArtistDiscoveryWeight(item.artist) - 1) * 1.8 -
          getMainstreamPenalty(item.artist),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score;
      if (scoreDelta !== 0) return scoreDelta;
      const dateDelta = (b.item.sources[0]?.publishedAt || "").localeCompare(a.item.sources[0]?.publishedAt || "");
      if (dateDelta !== 0) return dateDelta;
      const artistDelta = a.item.artist.localeCompare(b.item.artist);
      if (artistDelta !== 0) return artistDelta;
      return a.item.album.localeCompare(b.item.album);
    })
    .slice(0, limit);
}

function selectRotatingDrivers(drivers, recentRefillDrivers, limit) {
  if (!limit || !drivers.length) return [];

  const recentDriverSet = new Set((recentRefillDrivers || []).slice(-SEARCH_CONFIG.refillDriverHistoryLimit));
  const freshDrivers = drivers.filter((driver) => !recentDriverSet.has(driver.key));
  const selected = [...freshDrivers.slice(0, limit)];

  if (selected.length < limit) {
    const fallbackDrivers = drivers.filter(
      (driver) => recentDriverSet.has(driver.key) && !selected.some((selectedDriver) => selectedDriver.key === driver.key),
    );
    selected.push(...fallbackDrivers.slice(0, limit - selected.length));
  }

  return selected;
}

function buildRefillDriverPool(engine, catalog, seedArtists, editorialItems, exposureMemory = createArtistExposureMemory()) {
  const likedDrivers = getSortedEntries(engine.likedArtists, { positiveOnly: true })
    .filter(([artist]) => !isBlockedRecommendationArtist(artist))
    .map(([artist, score]) => ({
      key: `artist:${normalizeCatalogArtistName(artist)}`,
      name: artist,
      score: (score + 4) * Math.max(0.2, getArtistDiscoveryWeight(artist)) - getMainstreamPenalty(artist),
      type: "liked-artist",
    }));

  const clusterDrivers = getSortedEntries(engine.clusterScores, { positiveOnly: true })
    .map(([artistKey, score]) => ({
      key: `artist:${artistKey}`,
      name: resolveArtistNameFromKey(artistKey, catalog, engine.liked, seedArtists, editorialItems),
      score,
    }))
    .filter(({ name }) => name && !isBlockedRecommendationArtist(name))
    .map(({ key, name, score }) => ({
      key,
      name,
      score: (score + 2) * Math.max(0.2, getArtistDiscoveryWeight(name)) - getMainstreamPenalty(name),
      type: "cluster-artist",
    }));

  const artistDrivers = uniqueBy([...likedDrivers, ...clusterDrivers], (driver) => driver.key).sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  const genreDrivers = getSortedEntries(engine.genreScores, { positiveOnly: true })
    .filter(([, score]) => score >= SEARCH_CONFIG.genreDriverMinScore)
    .map(([genre, score]) => ({
      key: `genre:${normalizeText(genre)}`,
      genre,
      score,
      type: "genre",
    }));

  const editorialDrivers = selectEditorialCandidates(
    editorialItems,
    engine,
    seedArtists,
    40,
    exposureMemory,
  ).map((candidate) => ({
    ...candidate,
    key: `editorial:${candidate.item.artistKey}:${candidate.item.albumKey}`,
    score: candidate.score,
    type: "editorial",
  }));

  const seedDrivers = seedArtists.map((artist, index) => ({
    key: `seed:${normalizeCatalogArtistName(artist)}`,
    name: artist,
    score:
      Math.max(0, 2 - index * 0.25) * Math.max(0.2, getArtistDiscoveryWeight(artist)) -
      getMainstreamPenalty(artist),
    type: "seed-artist",
  })).filter((driver) => !isBlockedRecommendationArtist(driver.name));

  return {
    artistDrivers,
    genreDrivers,
    editorialDrivers,
    seedDrivers,
  };
}

async function buildEditorialTracks(
  editorialCandidates,
  engine,
  existingCatalog,
  limit,
  exposureMemory = createArtistExposureMemory(),
) {
  if (!limit || !editorialCandidates.length) return { tracks: [], skippedLookups: 0 };

  const coolingArtistSet = getArtistCooldownSet(engine);
  const excludeIds = new Set(existingCatalog.map((track) => track.id));
  const tracks = [];
  let skippedLookups = 0;

  for (const candidate of editorialCandidates) {
    if (tracks.length >= limit) break;

    let rawTracks = [];
    try {
      rawTracks = await searchTracksByArtist(
        candidate.item.artist,
        candidate.item.album,
        SEARCH_CONFIG.editorialTrackLimit,
      );
    } catch {
      skippedLookups += 1;
      continue;
    }

    const normalized = rawTracks
      .map((t) =>
        normalizeDeezerTrack(t, {
          ...candidate.context,
          editorialWeight: candidate.item.editorialWeight,
          editorialSources: candidate.item.sources,
        }),
      )
      .filter(Boolean)
      .filter((t) => !excludeIds.has(t.id));

    const filteredTracks = filterVotedArtistBlockedTracks(
      filterExposureBlockedTracks(filterCoolingArtists(normalized, coolingArtistSet), exposureMemory),
      engine,
    );

    for (const track of filteredTracks) {
      if (tracks.length >= limit) break;
      tracks.push(track);
      excludeIds.add(track.id);
    }
  }

  return { tracks, skippedLookups };
}

function blendEditorialTracks(baseTracks, editorialTracks, targetSize, editorialLimit) {
  const pickedEditorial = dedupeTracks(editorialTracks).slice(0, editorialLimit);
  const pickedEditorialIds = new Set(pickedEditorial.map((track) => track.id));
  const baseOnly = dedupeTracks(baseTracks.filter((track) => !pickedEditorialIds.has(track.id)));

  return dedupeTracks([...pickedEditorial, ...baseOnly]).slice(0, targetSize);
}

function filterSeedArtistTracks(tracks, seedNames) {
  const seedKeys = new Set(seedNames.map((n) => normalizeCatalogArtistName(n)));
  return tracks.filter((t) => !seedKeys.has(normalizeCatalogArtistName(t.artist)));
}

const SOUNDTRACK_PATTERN = /\b(soundtrack|original\s+score|o\.?s\.?t\.?|motion\s+picture|from\s+the\s+(film|movie|series|show|television)|original\s+music\s+from|music\s+from\s+(the|and\s+inspired))\b/i;

const KNOWN_COMPOSERS = new Set([
  "hans zimmer", "john williams", "ennio morricone", "danny elfman",
  "howard shore", "james newton howard", "bernard herrmann", "jerry goldsmith",
  "max richter", "hildur gudnadottir", "hildur guðnadóttir", "jonny greenwood",
  "joe hisaishi", "bear mccreary", "ramin djawadi", "alexandre desplat",
  "michael giacchino", "thomas newman", "harry gregson-williams", "john powell",
  "brian tyler", "cliff martinez", "trent reznor", "atticus ross",
  "nicholas britell", "ryuichi sakamoto", "angelo badalamenti", "carter burwell",
  "john carpenter", "john debney", "alan silvestri", "mark isham",
  "henry jackman", "lorne balfe", "benjamin wallfisch", "geoff zanelli",
  "jóhann jóhannsson", "johann johannsson", "mychael danna", "marco beltrami",
  "david arnold", "trevor jones", "basil poledouris", "james horner",
  "george fenton", "gabriel yared", "elliot goldenthal", "rachel portman",
]);

function isSoundtrackTrack(track) {
  return SOUNDTRACK_PATTERN.test(track.album || "") || SOUNDTRACK_PATTERN.test(track.artist || "");
}

function isKaraokeTrack(track) {
  return /\bkaraoke\b/i.test(track.title || "") || /\bkaraoke\b/i.test(track.album || "");
}

function isComposerArtist(name) {
  if (!name) return false;
  const key = name.toLowerCase().trim();
  return KNOWN_COMPOSERS.has(key) || KNOWN_COMPOSERS.has(normalizeCatalogArtistName(name));
}

function filterSoundtrackTracks(tracks, seedArtists = []) {
  const composerSeedKeys = new Set(
    seedArtists.filter(isComposerArtist).map(normalizeCatalogArtistName),
  );
  return tracks.filter((t) => {
    if (!isSoundtrackTrack(t)) return true;
    const sourceKey = normalizeCatalogArtistName(t.sourceArtist || t.artist);
    return composerSeedKeys.has(sourceKey);
  });
}

async function buildInitialCatalog(
  artistTerms,
  editorialItems = [],
  engine = createEngine(),
  exposureMemory = createArtistExposureMemory(),
) {
  // Step 1: Find Deezer artist IDs for seed artists
  const seedResults = await Promise.allSettled(artistTerms.map((name) => searchArtist(name)));
  const validSeeds = seedResults.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);

  // Step 2: Get artist radio for each seed (Deezer's recommendation engine)
  const radioBatch = await Promise.allSettled(
    validSeeds.slice(0, 5).map(async (seed) => {
      const radioTracks = await getArtistRadio(seed.id, 40);
      return radioTracks
        .filter((t) => !t.rank || t.rank <= 500_000)
        .map((t) =>
          normalizeDeezerTrack(t, {
            sourceArtist: seed.name,
            discoveryMode: "deezer-radio",
            recommendedBecause: `Fan of ${seed.name}`,
          }),
        )
        .filter(Boolean);
    }),
  );
  let tracks = radioBatch.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);

  // Step 3: Additional variety via Deezer's related-artist graph
  const relatedBatch = await Promise.allSettled(
    validSeeds.slice(0, 3).map(async (seed) => {
      const related = await getDeezerRelatedArtists(seed.id);
      const relatedRadio = await Promise.allSettled(
        related.slice(0, 3).map(async (relatedArtist) => {
          const radioTracks = await getArtistRadio(relatedArtist.id, 15);
          return radioTracks
            .filter((t) => !t.rank || t.rank <= 400_000)
            .map((t) =>
              normalizeDeezerTrack(t, {
                sourceArtist: seed.name,
                discoveryMode: "similar-artist",
                recommendedBecause: `Similar to ${seed.name}`,
              }),
            )
            .filter(Boolean);
        }),
      );
      return relatedRadio.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
    }),
  );
  const relatedTracks = relatedBatch.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
  tracks = filterSoundtrackTracks(
    filterSeedArtistTracks(dedupeTracks([...tracks, ...relatedTracks]), artistTerms),
    artistTerms,
  ).filter((t) => !isKaraokeTrack(t))
    .sort((a, b) => (a.popularity ?? 50) - (b.popularity ?? 50));

  // Step 4: Enrich with Deezer album dates, then Last.fm genre tags + fallback dates
  tracks = await enrichTracksWithDeezerDates(tracks);
  tracks = await enrichTracksWithLastFm(tracks);

  // Step 5: Blend in editorial-signal tracks (Bandcamp AOTD, NeedleDrop, etc.)
  const editorialCandidates = selectEditorialCandidates(
    editorialItems,
    engine,
    artistTerms,
    Math.max(SEARCH_CONFIG.editorialInitialLimit * 5, 16),
    exposureMemory,
  );
  const editorialResult = await buildEditorialTracks(
    editorialCandidates,
    engine,
    tracks,
    SEARCH_CONFIG.editorialInitialLimit,
    exposureMemory,
  );
  tracks = blendEditorialTracks(
    tracks,
    editorialResult.tracks,
    SEARCH_CONFIG.startQueueTarget,
    SEARCH_CONFIG.editorialInitialLimit,
  );

  // Step 5: Filter exposure-blocked and voted-blocked tracks
  tracks = filterExposureBlockedTracks(filterVotedArtistBlockedTracks(tracks, engine), exposureMemory);

  return {
    tracks: dedupeTracks(tracks).slice(0, SEARCH_CONFIG.startQueueTarget),
    skippedLookups: editorialResult.skippedLookups,
  };
}
async function buildRefillCatalog(
  engine,
  catalog,
  seedArtists,
  editorialItems = [],
  exposureMemory = createArtistExposureMemory(),
) {
  const existingIds = new Set(catalog.map((track) => track.id));

  // Step 1: Derive artist seeds from liked artists, fall back to original seeds
  const likedArtistNames = getSortedEntries(engine.likedArtists, { positiveOnly: true })
    .slice(0, 5)
    .map(([name]) => name)
    .filter((name) => !isBlockedRecommendationArtist(name));

  const artistNames = likedArtistNames.length ? likedArtistNames : seedArtists.slice(0, 3);
  const artistResults = await Promise.allSettled(artistNames.map((name) => searchArtist(name)));
  const artistIds = artistResults
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value.id);

  // Step 2: Get Deezer radio for seed artists — niche focus (rank <= 400k)
  let newTracks = [];
  if (artistIds.length) {
    const radioBatch = await Promise.allSettled(
      artistIds.slice(0, 3).map(async (id) => {
        const radioTracks = await getArtistRadio(id, 25);
        return radioTracks
          .filter((t) => !t.rank || t.rank <= 400_000)
          .map((t) => normalizeDeezerTrack(t, { discoveryMode: "deezer-radio" }))
          .filter(Boolean);
      }),
    );
    newTracks = radioBatch.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
  }

  // Horizon pull: related artists of top liked artist (2 hops out for variety)
  const topLikedId = artistIds[0];
  if (topLikedId) {
    const horizonRelated = await getDeezerRelatedArtists(topLikedId);
    const alreadyPulled = new Set(artistIds.map(String));
    const likedKeys = new Set(Object.keys(engine.likedArtists).map(normalizeCatalogArtistName));
    const horizonArtists = horizonRelated
      .filter((a) => !alreadyPulled.has(String(a.id)) && !likedKeys.has(normalizeCatalogArtistName(a.name)))
      .slice(0, 4);

    const horizonBatch = await Promise.allSettled(
      horizonArtists.map(async (a) => {
        const radio = await getArtistRadio(a.id, 12);
        return radio
          .filter((t) => !t.rank || t.rank <= 350_000)
          .map((t) =>
            normalizeDeezerTrack(t, {
              discoveryMode: "similar-artist",
              sourceArtist: a.name,
              recommendedBecause: `Similar to ${a.name}`,
            }),
          )
          .filter(Boolean);
      }),
    );
    const horizonTracks = horizonBatch.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
    newTracks = dedupeTracks([...newTracks, ...horizonTracks]);
  }

  // Step 3: Filter out tracks already in catalog or seen
  newTracks = filterSoundtrackTracks(
    filterSeedArtistTracks(
      newTracks.filter((t) => !existingIds.has(t.id) && !engine.seen.has(t.id)),
      seedArtists,
    ),
    seedArtists,
  ).filter((t) => !isKaraokeTrack(t));
  newTracks = filterExposureBlockedTracks(filterVotedArtistBlockedTracks(newTracks, engine), exposureMemory);
  newTracks = await enrichTracksWithDeezerDates(newTracks);
  newTracks = await enrichTracksWithLastFm(newTracks);

  // Step 4: Blend in editorial tracks
  const driverPool = buildRefillDriverPool(engine, catalog, seedArtists, editorialItems, exposureMemory);
  const editorialDrivers = selectRotatingDrivers(
    driverPool.editorialDrivers,
    engine.recentRefillDrivers,
    SEARCH_CONFIG.editorialRefillLimit,
  );
  const editorialResult = await buildEditorialTracks(
    editorialDrivers,
    engine,
    [...catalog, ...newTracks],
    SEARCH_CONFIG.editorialRefillLimit,
    exposureMemory,
  );

  const tracks = dedupeTracks([...editorialResult.tracks, ...newTracks]).filter((t) => !existingIds.has(t.id));

  return {
    tracks: limitRefillBatchTracks(tracks, SEARCH_CONFIG.refillTarget),
    usedDriverKeys: editorialDrivers.map((d) => d.key),
    skippedLookups: editorialResult.skippedLookups,
  };
}
function getQueueSize(catalog, engine) {
  return catalog.filter((track) => !engine.seen.has(track.id)).length;
}

function getGenreColor(genre) {
  return GENRE_COLORS[normalizeText(genre)] || "#94a3b8";
}

const DECADE_BUCKETS = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

function getDecadeCounts(likedTracks) {
  const counts = Object.fromEntries(DECADE_BUCKETS.map((d) => [d, 0]));
  for (const track of likedTracks) {
    const d = formatDecade(track.era);
    if (d in counts) counts[d]++;
  }
  return DECADE_BUCKETS.map((d) => [d, counts[d]]).filter(([, c]) => c > 0);
}

function pluralizeCount(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function shortenLabel(label, maxLength = 16) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

function getArtistInputPalette(index) {
  return ARTIST_INPUT_PALETTES[index % ARTIST_INPUT_PALETTES.length];
}

function buildLikedArtistGraph(likedTracks, limit = 12) {
  const artistMap = new Map();

  likedTracks.forEach((track) => {
    const artistKey = normalizeCatalogArtistName(track.artist);
    if (!artistKey) return;

    if (!artistMap.has(artistKey)) {
      artistMap.set(artistKey, {
        id: artistKey,
        artist: track.artist,
        likeCount: 0,
        genreCounts: {},
        genreLabels: {},
      });
    }

    const node = artistMap.get(artistKey);
    node.likeCount += 1;

    track.genres.forEach((genre) => {
      const genreKey = normalizeText(genre);
      if (!genreKey) return;
      node.genreCounts[genreKey] = (node.genreCounts[genreKey] || 0) + 1;
      if (!node.genreLabels[genreKey]) node.genreLabels[genreKey] = genre;
    });
  });

  const nodes = Array.from(artistMap.values())
    .map((artist) => {
      const genreEntries = Object.entries(artist.genreCounts)
        .sort((a, b) => {
          const countDelta = b[1] - a[1];
          if (countDelta !== 0) return countDelta;
          return artist.genreLabels[a[0]].localeCompare(artist.genreLabels[b[0]]);
        })
        .map(([key, count]) => ({
          key,
          label: artist.genreLabels[key],
          count,
        }));

      return {
        id: artist.id,
        artist: artist.artist,
        likeCount: artist.likeCount,
        genres: genreEntries.map((entry) => entry.label),
        genreKeys: genreEntries.map((entry) => entry.key),
        primaryGenre: genreEntries[0]?.label || "Music",
      };
    })
    .sort((a, b) => b.likeCount - a.likeCount || a.artist.localeCompare(b.artist))
    .slice(0, limit);

  const degreeMap = Object.fromEntries(nodes.map((node) => [node.id, 0]));
  const edges = [];

  for (let index = 0; index < nodes.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < nodes.length; compareIndex += 1) {
      const source = nodes[index];
      const target = nodes[compareIndex];
      const sharedGenres = source.genreKeys
        .filter((genreKey) => target.genreKeys.includes(genreKey))
        .map((genreKey) => {
          const sourceIndex = source.genreKeys.indexOf(genreKey);
          const targetIndex = target.genreKeys.indexOf(genreKey);
          return source.genres[sourceIndex] || target.genres[targetIndex] || formatGenreLabel(genreKey);
        });

      if (!sharedGenres.length) continue;

      const uniqueSharedGenres = uniqueBy(sharedGenres, (genre) => normalizeText(genre));
      const edge = {
        id: `${source.id}__${target.id}`,
        source: source.id,
        target: target.id,
        sharedGenres: uniqueSharedGenres,
        weight: uniqueSharedGenres.length,
        curveDirection: (index + compareIndex) % 2 === 0 ? 1 : -1,
      };

      edges.push(edge);
      degreeMap[source.id] += edge.weight;
      degreeMap[target.id] += edge.weight;
    }
  }

  return {
    nodes: nodes.map((node) => ({
      ...node,
      degree: degreeMap[node.id] || 0,
    })),
    edges,
  };
}

function buildArtistGraphEdgePath(source, target, curveDirection = 1) {
  if (!source || !target) return "";

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const curveAmount = Math.min(42, 12 + distance * 0.08) * curveDirection;
  const controlX = midX + normalX * curveAmount;
  const controlY = midY + normalY * curveAmount - 10;

  return `M ${source.x.toFixed(1)} ${source.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
}

function layoutLikedArtistGraph(nodes, edges, width = ARTIST_GRAPH_VIEWBOX.width, height = ARTIST_GRAPH_VIEWBOX.height) {
  if (!nodes.length) return { nodes: [], edges: [] };

  const sortedNodes = [...nodes].sort(
    (a, b) => b.degree - a.degree || b.likeCount - a.likeCount || a.artist.localeCompare(b.artist),
  );
  const maxDegree = Math.max(1, ...sortedNodes.map((node) => node.degree));
  const maxLikes = Math.max(1, ...sortedNodes.map((node) => node.likeCount));
  const centerX = width / 2;
  const centerY = height / 2 - 6;
  const outerRadius = Math.min(width, height) * 0.38;

  const laidOutNodes = sortedNodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index / sortedNodes.length) * Math.PI * 2;
    const degreeFactor = node.degree / maxDegree;
    const likeFactor = node.likeCount / maxLikes;
    const orbitRadius = Math.max(outerRadius * 0.56, outerRadius - degreeFactor * 42 - likeFactor * 18);
    const x = centerX + Math.cos(angle) * orbitRadius;
    const y = centerY + Math.sin(angle) * orbitRadius * 0.78;

    return {
      ...node,
      x,
      y,
      radius: Math.max(12, 12 + likeFactor * 12),
    };
  });

  const nodeMap = Object.fromEntries(laidOutNodes.map((node) => [node.id, node]));
  const laidOutEdges = edges.map((edge) => ({
    ...edge,
    path: buildArtistGraphEdgePath(nodeMap[edge.source], nodeMap[edge.target], edge.curveDirection),
  }));

  return {
    nodes: laidOutNodes,
    edges: laidOutEdges,
  };
}

function getArtistGraphDetail(hoverState, nodes, edges) {
  if (!nodes.length) {
    return {
      eyebrow: "Artist web",
      title: "Genre Similarity Web",
      body: "Like tracks from at least 2 artists to reveal your connections.",
      detail: "Each node represents a liked artist. Lines appear when artists share genre ground.",
    };
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  if (hoverState?.type === "node") {
    const node = nodeMap.get(hoverState.id);
    if (!node) return null;

    const connectedEdges = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
    const sharedGenres = uniqueBy(
      connectedEdges.flatMap((edge) => edge.sharedGenres),
      (genre) => normalizeText(genre),
    );

    return {
      eyebrow: "Focused artist",
      title: node.artist,
      body: `${pluralizeCount(node.likeCount, "liked track")} · ${pluralizeCount(connectedEdges.length, "shared-genre link")}`,
      detail: connectedEdges.length
        ? `Shared genres: ${sharedGenres.join(", ")}`
        : "No shared-genre links yet. Like more adjacent genres to reveal connections.",
    };
  }

  if (hoverState?.type === "edge") {
    const edge = edges.find((item) => item.id === hoverState.id);
    if (!edge) return null;

    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) return null;

    return {
      eyebrow: "Shared genre bridge",
      title: `${source.artist} ↔ ${target.artist}`,
      body: pluralizeCount(edge.weight, "shared genre"),
      detail: edge.sharedGenres.join(", "),
    };
  }

  return {
    eyebrow: "Artist web",
    title: "Genre Similarity Web",
    body: `${pluralizeCount(nodes.length, "artist")} · ${pluralizeCount(edges.length, "genre link")}`,
    detail: edges.length
      ? "Hover a node to inspect how your liked artists connect through shared genres."
      : "Like more adjacent genres to reveal connections.",
  };
}

function ArtistInput({ value, onChange, onSelect, placeholder, index, disabled }) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const wrapRef = useRef(null);
  const filledPalette = getArtistInputPalette(index);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setFocused(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!focused || disabled || value.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setSearchError("");
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setSearchError("");
    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchDeezerArtistSuggestions(value.trim(), SEARCH_CONFIG.artistSuggestionLimit);
        if (!cancelled) setSuggestions(results);
      } catch (error) {
        if (!cancelled) {
          setSuggestions([]);
          setSearchError(error.message || "Artist search is unavailable.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, SEARCH_CONFIG.debounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [value, focused, disabled]);

  const showDropdown = focused && value.trim().length >= 2;

  return (
    <div ref={wrapRef} style={S.inputWrap}>
      <span style={{ ...S.inputNumber, color: filledPalette ? filledPalette.border : S.inputNumber.color }}>
        {index + 1}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        style={{
          ...S.artistInput,
          ...(filledPalette
            ? {
                backgroundImage: "none",
                backgroundColor: filledPalette.fill,
                borderColor: filledPalette.border,
                color: filledPalette.text,
                boxShadow: `10px 10px 0 ${filledPalette.shadow}`,
              }
            : null),
        }}
        autoComplete="off"
        disabled={disabled}
      />
      {value && !disabled && (
        <button
          onClick={() => onChange("")}
          style={{ ...S.clearBtn, color: filledPalette ? filledPalette.border : S.clearBtn.color }}
          aria-label="Clear artist"
        >
          ✕
        </button>
      )}

      {showDropdown && (
        <div style={S.dropdown}>
          {isLoading && <div style={S.dropdownStatus}>Searching live artists...</div>}

          {!isLoading &&
            suggestions.map((artist) => (
              <button
                key={artist.id}
                onClick={() => {
                  onSelect(artist.name);
                  setFocused(false);
                }}
                style={S.dropdownItem}
              >
                <span style={S.dropdownName}>{artist.name}</span>
                <span style={S.dropdownGenres}>{artist.genreLabel}</span>
              </button>
            ))}

          {!isLoading && !searchError && suggestions.length === 0 && (
            <div style={S.dropdownStatus}>No exact match. You can still continue with this text.</div>
          )}

          {!isLoading && searchError && <div style={S.dropdownStatus}>{searchError}</div>}
        </div>
      )}
    </div>
  );
}

function YouTubePlayer({ artist, title }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setVideoId(null);
    findYouTubeVideoId(artist, title).then((id) => {
      if (alive) { setVideoId(id); setLoading(false); }
    });
    return () => { alive = false; };
  }, [artist, title]);

  const baseStyle = { width: "100%", aspectRatio: "16/9", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1322", color: "#64748b", fontSize: 12, fontFamily: "monospace" };

  if (loading) return <div style={baseStyle}>Loading video...</div>;
  if (!videoId) return <div style={baseStyle}>No video found</div>;

  return (
    <iframe
      style={{ width: "100%", aspectRatio: "16/9", border: "none", borderRadius: 4, display: "block" }}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      title={`${artist} – ${title}`}
    />
  );
}

export default function MusicDiscovery() {
  const [engine, setEngine] = useState(() => createEngine(loadTasteProfile()));
  const [catalog, setCatalog] = useState([]);
  const [currentPair, setCurrentPair] = useState(null);
  const [phase, setPhase] = useState("onboarding");
  const [artists, setArtists] = useState(["", "", "", "", ""]);
  const [artistPlaceholders, setArtistPlaceholders] = useState(() => getRandomArtistPlaceholders());
  const [seedArtists, setSeedArtists] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");
  const [queueMessage, setQueueMessage] = useState("Ready to discover.");
  const [loadedCount, setLoadedCount] = useState(0);
  const [artistGraphHover, setArtistGraphHover] = useState(null);
  const [ytActiveSide, setYtActiveSide] = useState(null);
  const [activePreviewSide, setActivePreviewSide] = useState(null);
  const leftAudioRef = useRef(null);
  const rightAudioRef = useRef(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [isResolvingPair, setIsResolvingPair] = useState(false);
  const [tasteMemoryCleared, setTasteMemoryCleared] = useState(false);

  const engineRef = useRef(engine);
  const catalogRef = useRef(catalog);
  const seedArtistsRef = useRef(seedArtists);
  const prefetchRef = useRef(false);
  const prefetchPromiseRef = useRef(null);
  const voteTimeoutRef = useRef(null);
  const editorialSignalsRef = useRef([]);
  const exposureMemoryRef = useRef(loadArtistExposureMemory());
  const surfacedPairRef = useRef("");

  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    seedArtistsRef.current = seedArtists;
  }, [seedArtists]);

  useEffect(() => {
    let cancelled = false;

    const loadEditorialSignals = async () => {
      try {
        const response = await fetch("/editorial-signals.json", { cache: "no-store" });
        if (!response.ok) return;

        const payload = await response.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];

        if (!cancelled) editorialSignalsRef.current = items;
      } catch {
        if (!cancelled) editorialSignalsRef.current = [];
      }
    };

    void loadEditorialSignals();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (voteTimeoutRef.current) window.clearTimeout(voteTimeoutRef.current);
    };
  }, []);


  useEffect(() => {
    setYtActiveSide(null);
    setActivePreviewSide(null);
    [leftAudioRef.current, rightAudioRef.current].forEach((player) => {
      if (!player) return;
      player.pause();
      player.currentTime = 0;
    });
  }, [currentPair]);

  const filledCount = artists.filter((artist) => artist.trim().length > 0).length;
  const queueSize = getQueueSize(catalog, engine);
  const likedTracks = engine.liked;
  const topGenres = getSortedEntries(engine.genreScores, { positiveOnly: true }).slice(0, 6);
  const topDecades = getDecadeCounts(likedTracks);
  const likedArtistGraph = buildLikedArtistGraph(likedTracks);
  const { nodes: likedArtistGraphNodes, edges: likedArtistGraphEdges } = layoutLikedArtistGraph(
    likedArtistGraph.nodes,
    likedArtistGraph.edges,
  );
  const hoveredArtistNodeId = artistGraphHover?.type === "node" ? artistGraphHover.id : null;
  const hoveredArtistEdge =
    artistGraphHover?.type === "edge"
      ? likedArtistGraphEdges.find((edge) => edge.id === artistGraphHover.id) || null
      : null;
  const graphFocusNodeIds = new Set();
  const graphFocusEdgeIds = new Set();

  if (hoveredArtistNodeId) {
    graphFocusNodeIds.add(hoveredArtistNodeId);
    likedArtistGraphEdges.forEach((edge) => {
      if (edge.source !== hoveredArtistNodeId && edge.target !== hoveredArtistNodeId) return;
      graphFocusEdgeIds.add(edge.id);
      graphFocusNodeIds.add(edge.source);
      graphFocusNodeIds.add(edge.target);
    });
  }

  if (hoveredArtistEdge) {
    graphFocusEdgeIds.add(hoveredArtistEdge.id);
    graphFocusNodeIds.add(hoveredArtistEdge.source);
    graphFocusNodeIds.add(hoveredArtistEdge.target);
  }

  const graphHasHover = Boolean(hoveredArtistNodeId || hoveredArtistEdge);
  const artistGraphDetail =
    getArtistGraphDetail(artistGraphHover, likedArtistGraphNodes, likedArtistGraphEdges) ||
    getArtistGraphDetail(null, likedArtistGraphNodes, likedArtistGraphEdges);

  const updateArtist = (index, value) => {
    const next = [...artists];
    next[index] = value;
    if (discoveryError) setDiscoveryError("");
    setArtists(next);
  };

  const resetApp = useCallback(() => {
    if (voteTimeoutRef.current) window.clearTimeout(voteTimeoutRef.current);
    prefetchRef.current = false;
    prefetchPromiseRef.current = null;
    clearPersistentDiscoveryMemory();
    const freshEngine = createEngine();
    engineRef.current = freshEngine;
    catalogRef.current = [];
    seedArtistsRef.current = [];
    setEngine(freshEngine);
    setCatalog([]);
    setCurrentPair(null);
    setPhase("onboarding");
    setArtists(["", "", "", "", ""]);
    setArtistPlaceholders(getRandomArtistPlaceholders());
    setSeedArtists([]);
    setIsStarting(false);
    setIsPrefetching(false);
    setIsResolvingPair(false);
    setDiscoveryError("");
    setQueueMessage("Ready to discover.");
    setLoadedCount(0);
    setArtistGraphHover(null);
    setYtActiveSide(null);
    surfacedPairRef.current = "";
  }, []);


  const loadMoreTracks = useCallback(async () => {
    if (prefetchRef.current && prefetchPromiseRef.current) {
      return prefetchPromiseRef.current;
    }

    prefetchRef.current = true;
    setIsPrefetching(true);
    setQueueMessage("Refreshing your discovery graph...");
    prefetchPromiseRef.current = (async () => {
      try {
        const liveCatalog = catalogRef.current;

        const { tracks: moreTracks, usedDriverKeys = [], skippedLookups = 0 } = await buildRefillCatalog(
          engineRef.current,
          liveCatalog,
          seedArtistsRef.current,
          editorialSignalsRef.current,
          exposureMemoryRef.current,
        );

        if (usedDriverKeys.length) {
          const nextEngine = {
            ...engineRef.current,
            recentRefillDrivers: [...(engineRef.current.recentRefillDrivers || []), ...usedDriverKeys].slice(
              -SEARCH_CONFIG.refillDriverHistoryLimit,
            ),
          };
          engineRef.current = nextEngine;
          setEngine(nextEngine);
        }

        if (moreTracks.length) {
          const merged = mergeCatalog(liveCatalog, moreTracks);
          catalogRef.current = merged;
          setCatalog(merged);
          setQueueMessage(
            appendSkippedLookupNote(
              `Added ${moreTracks.length} more discovery tracks to your queue.`,
              skippedLookups,
            ),
          );
        } else if (skippedLookups) {
          setQueueMessage("Some live lookups were skipped while FREQFIND searched for deeper cuts.");
        } else {
          setQueueMessage("Still digging for deeper discovery tracks...");
        }

        return moreTracks;
      } catch (error) {
        setQueueMessage(error.message || "Unable to refresh the queue right now.");
        return [];
      } finally {
        prefetchRef.current = false;
        prefetchPromiseRef.current = null;
        setIsPrefetching(false);
      }
    })();

    return prefetchPromiseRef.current;
  }, []);

  const resolveNextContinuousPair = useCallback(async () => {
    let nextPair = buildNextPair(engineRef.current, catalogRef.current, exposureMemoryRef.current);
    let refillAttempts = 0;

    while (!nextPair && refillAttempts < SEARCH_CONFIG.refillAttempts) {
      await loadMoreTracks();
      refillAttempts += 1;
      nextPair = buildNextPair(engineRef.current, catalogRef.current, exposureMemoryRef.current);
    }

    if (nextPair) return nextPair;

    const recoveredEngine = buildRecoveryEngine(engineRef.current);
    engineRef.current = recoveredEngine;
    setEngine(recoveredEngine);
    setQueueMessage("Digging deeper into fresher lanes for another pair...");

    let recoveryPair = buildNextPair(recoveredEngine, catalogRef.current, exposureMemoryRef.current);
    let recoveryAttempts = 0;

    while (!recoveryPair && recoveryAttempts < SEARCH_CONFIG.refillAttempts + 1) {
      await loadMoreTracks();
      recoveryAttempts += 1;
      recoveryPair = buildNextPair(engineRef.current, catalogRef.current, exposureMemoryRef.current);
    }

    if (recoveryPair) return recoveryPair;

    const emergencyPair = buildEmergencyRepeatPair(engineRef.current, catalogRef.current, exposureMemoryRef.current);
    if (emergencyPair) {
      setQueueMessage("Recycling the deepest cuts in your session to keep discovery moving.");
      return emergencyPair;
    }

    setQueueMessage("Still searching for another niche pair...");
    return null;
  }, [loadMoreTracks]);

  const startDiscovery = useCallback(async () => {
    const filledArtists = artists.map((artist) => artist.trim()).filter(Boolean);
    if (!filledArtists.length || isStarting) return;

    prefetchRef.current = false;
    prefetchPromiseRef.current = null;
    clearPersistentDiscoveryMemory();
    const freshEngine = createEngine();
    engineRef.current = freshEngine;
    catalogRef.current = [];
    setEngine(freshEngine);
    setCatalog([]);
    setCurrentPair(null);
    setSeedArtists(filledArtists);
    setDiscoveryError("");
    setQueueMessage("Searching Spotify for niche picks around your artists...");
    setLoadedCount(0);
    setIsStarting(true);
    setIsResolvingPair(false);
    setArtistGraphHover(null);
    setYtActiveSide(null);

    try {
      const { tracks, skippedLookups = 0 } = await buildInitialCatalog(
        filledArtists,
        editorialSignalsRef.current,
        freshEngine,
        exposureMemoryRef.current,
      );

      if (!tracks.length && skippedLookups === 0) {
        throw new Error("No live tracks were found. Try broader artist names or fewer typos.");
      }
      if (tracks.length < 2) {
        throw new Error("We couldn't load enough live tracks right now. Try again in a moment or use a different artist mix.");
      }

      const nextPair = buildNextPair(freshEngine, tracks, exposureMemoryRef.current);
      if (!nextPair) {
        throw new Error("We couldn't load enough live tracks right now. Try again in a moment or use a different artist mix.");
      }

      catalogRef.current = tracks;
      setCatalog(tracks);
      setCurrentPair(nextPair);
      setLoadedCount(tracks.length);
      setQueueMessage(
        appendSkippedLookupNote(
          `Loaded ${tracks.length} tracks via Spotify — playing the most niche picks first.`,
          skippedLookups,
        ),
      );
      setPhase("playing");
    } catch (error) {
      setDiscoveryError(error.message || "Unable to start discovery. Check your Spotify API credentials in .env.");
      setQueueMessage("Ready to discover.");
      setPhase("onboarding");
    } finally {
      setIsStarting(false);
    }
  }, [artists, isStarting]);

  const handlePairVote = useCallback(
    (outcome) => {
      if (!currentPair || isResolvingPair) return;

      const { left, right } = currentPair;
      const voteOrder = {
        left: [
          [left, true],
          [right, false],
        ],
        right: [
          [right, true],
          [left, false],
        ],
        both: [
          [left, true],
          [right, true],
        ],
        neither: [
          [left, false],
          [right, false],
        ],
      }[outcome];

      if (!voteOrder) return;
      setIsResolvingPair(true);

      voteTimeoutRef.current = window.setTimeout(async () => {
        try {
          let updatedEngine = engineRef.current;
          voteOrder.forEach(([song, liked]) => {
            updatedEngine = updateEngine(updatedEngine, song, liked);
          });

          engineRef.current = updatedEngine;
          setEngine(updatedEngine);
          saveTasteProfile(updatedEngine);

          const nextCatalog = filterVotedArtistBlockedTracks(catalogRef.current, updatedEngine);
          catalogRef.current = nextCatalog;
          setCatalog(nextCatalog);

          let nextPair = buildNextPair(updatedEngine, nextCatalog, exposureMemoryRef.current);
          if (!nextPair) nextPair = await resolveNextContinuousPair();

          if (nextPair) {
            setCurrentPair(nextPair);
          } else {
            setCurrentPair(buildEmergencyRepeatPair(updatedEngine, catalogRef.current, exposureMemoryRef.current) || null);
            setQueueMessage("FREQFIND is widening the search while keeping voted artists out of the queue.");
          }
        } finally {
          setIsResolvingPair(false);
        }
      }, 180);
    },
    [currentPair, isResolvingPair, resolveNextContinuousPair],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (phase !== "playing") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePairVote("left");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handlePairVote("right");
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handlePairVote("both");
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        handlePairVote("neither");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handlePairVote]);

  useEffect(() => {
    if (phase !== "playing" || !currentPair || queueSize >= SEARCH_CONFIG.minQueue || prefetchRef.current) return;
    void loadMoreTracks();
  }, [phase, currentPair, queueSize, loadMoreTracks]);

  useEffect(() => {
    if (phase !== "playing" || !currentPair) return;

    const pairKey = [currentPair.left?.id, currentPair.right?.id].filter(Boolean).join("|");
    if (!pairKey || surfacedPairRef.current === pairKey) return;

    surfacedPairRef.current = pairKey;
    const nextMemory = recordSurfacedArtists(exposureMemoryRef.current, [currentPair.left, currentPair.right]);
    exposureMemoryRef.current = nextMemory;
    saveArtistExposureMemory(nextMemory);
  }, [phase, currentPair]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setYtActiveSide(null);
    setActivePreviewSide(null);
    [leftAudioRef.current, rightAudioRef.current].forEach((player) => {
      if (!player) return;
      player.pause();
      player.currentTime = 0;
    });
    // If the mouse is already hovering over a card when the pair loads, start preview
    requestAnimationFrame(() => {
      const { x, y } = lastMousePosRef.current;
      if (!x && !y) return;
      let el = document.elementFromPoint(x, y);
      while (el) {
        const side = el.dataset?.cardSide;
        if (side === "left" || side === "right") {
          const audioRef = side === "left" ? leftAudioRef : rightAudioRef;
          if (audioRef.current?.src) {
            audioRef.current.play().catch(() => {});
            setActivePreviewSide(side);
          }
          break;
        }
        el = el.parentElement;
      }
    });
  }, [currentPair]);

  const stopPreview = useCallback((side) => {
    const ref = side === "left" ? leftAudioRef : rightAudioRef;
    if (ref.current) {
      ref.current.pause();
      ref.current.currentTime = 0;
    }
    setActivePreviewSide((current) => (current === side ? null : current));
  }, []);

  const playPreview = useCallback(
    (side) => {
      const otherSide = side === "left" ? "right" : "left";
      const otherRef = otherSide === "left" ? leftAudioRef : rightAudioRef;
      if (otherRef.current) {
        otherRef.current.pause();
        otherRef.current.currentTime = 0;
      }
      const ref = side === "left" ? leftAudioRef : rightAudioRef;
      if (ref.current) {
        ref.current.play().catch(() => {});
        setActivePreviewSide(side);
      }
    },
    [],
  );

  const renderTrackCard = (song, side) => {
    const isPreviewing = activePreviewSide === side;
    const isYtActive = ytActiveSide === side;
    const isActive = isPreviewing || isYtActive;
    const audioRef = side === "left" ? leftAudioRef : rightAudioRef;
    const accentColor = side === "left" ? "#38bdf8" : "#fb7185";
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.artist} ${song.title}`)}`;

    const handleCardClick = (event) => {
      if (event.target.closest("a,button,iframe")) return;
      if (isResolvingPair) return;
      handlePairVote(side);
    };

    return (
      <div
        key={song.id}
        data-card-side={side}
        style={{
          ...S.pairCard,
          outline: isActive ? `3px solid ${accentColor}` : "3px solid transparent",
          outlineOffset: "4px",
          boxShadow: isActive ? `0 18px 0 ${accentColor}44` : S.pairCard.boxShadow,
          transform: isActive ? "translateY(-2px)" : "none",
        }}
        onMouseEnter={() => {
          if (song.previewUrl && !isYtActive) playPreview(side);
        }}
        onMouseLeave={() => {
          if (activePreviewSide === side) stopPreview(side);
        }}
        onClick={handleCardClick}
      >
        <div style={{ ...S.mediaWrap, position: "relative" }}>
          {isYtActive ? (
            <YouTubePlayer artist={song.artist} title={song.title} />
          ) : (
            <>
              {song.artworkUrl ? (
                <img src={song.artworkUrl} alt={song.title} style={S.artwork} />
              ) : (
                <div style={S.artworkFallback}>
                  <span style={S.artworkFallbackTitle}>{song.title}</span>
                  <span style={S.artworkFallbackArtist}>{song.artist}</span>
                </div>
              )}
              <button
                style={S.ytPlayBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  stopPreview(side);
                  setYtActiveSide(side);
                }}
              >
                ▶ Full
              </button>
            </>
          )}
          <div style={S.mediaBadge}>{side === "left" ? "Left pick" : "Right pick"}</div>
        </div>

        <div style={S.songInfo}>
          <h2 style={S.songTitle}>{song.title}</h2>
          <p style={S.songArtist}>{song.artist}</p>
          {song.recommendedBecause && <div style={S.reasonBadge}>{song.recommendedBecause}</div>}

          <div style={S.tags}>
            {song.genres.map((genre) => (
              <span key={genre} style={S.tag}>
                {genre}
              </span>
            ))}
            {song.era && <span style={S.tagYear}>{song.era}</span>}
          </div>

          <div style={S.previewBlock}>
            {song.previewUrl ? (
              <>
                <div
                  style={{
                    ...S.previewHint,
                    color: isActive ? accentColor : S.previewHint.color,
                    borderColor: isActive ? `${accentColor}66` : S.previewHint.borderColor,
                  }}
                >
                  {isYtActive
                    ? "Playing full song — click card to choose"
                    : isPreviewing
                      ? "Previewing — click ▶ Full or click card to choose"
                      : "Hover to preview · ▶ Full song · Click card to choose"}
                </div>
                <audio
                  key={song.id}
                  ref={audioRef}
                  preload="none"
                  src={song.previewUrl}
                  style={{ display: "none" }}
                  onEnded={() => {
                    setActivePreviewSide((current) => (current === side ? null : current));
                  }}
                />
              </>
            ) : (
              <div
                style={{
                  ...S.previewHint,
                  color: isYtActive ? accentColor : S.previewHint.color,
                  borderColor: isYtActive ? `${accentColor}66` : S.previewHint.borderColor,
                }}
              >
                {isYtActive ? "Playing full song — click card to choose" : "Click ▶ Full for YouTube · Click card to choose"}
              </div>
            )}
          </div>

          <div style={S.ctaRow} onClick={(event) => event.stopPropagation()}>
            {song.deezerUrl && (
              <a href={song.deezerUrl} target="_blank" rel="noopener noreferrer" style={S.primaryLink}>
                Deezer
              </a>
            )}
            <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer" style={S.secondaryLink}>
              YouTube Search
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={S.app}>
      <link
        href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=VT323&display=swap"
        rel="stylesheet"
      />
      <div style={S.bgGlow} />
      <div style={S.bgGlow2} />

      <header style={S.header}>
        <button onClick={resetApp} type="button" style={S.logoWrap} aria-label="Return to home">
          <img src={PIXEL_ASSETS.logo} alt="FREQFIND" style={S.logoImage} />
        </button>

        {phase === "playing" && (
          <div style={S.headerRight}>
            <button onClick={() => setPhase("profile")} style={S.profileBtn}>
              ♫ {likedTracks.length}
            </button>
            <span style={S.counter}>{queueSize} in queue</span>
          </div>
        )}
      </header>

      {phase === "onboarding" && (
        <div style={S.introWrap}>
          <div style={S.onboardCard}>
            <div style={S.onboardInner}>
              <h1 style={S.introTitle}>Discover artists near your taste</h1>
              <p style={S.introSub}>
                Enter up to 5 artists you love. FREQFIND uses Spotify to branch into similar and related artists,
                then surfaces niche and underground tracks so the queue feels like genuine discovery — not a replay of your seed picks.
              </p>

              <div style={S.artistFields}>
                {artists.map((value, index) => (
                  <ArtistInput
                    key={index}
                    index={index}
                    value={value}
                    onChange={(nextValue) => updateArtist(index, nextValue)}
                    onSelect={(name) => updateArtist(index, name)}
                    placeholder={artistPlaceholders[index] || `e.g. ${CURATED_ARTIST_PLACEHOLDER_POOL[index]}`}
                    disabled={isStarting}
                  />
                ))}
              </div>

              {discoveryError && <div style={S.messageError}>{discoveryError}</div>}
              {!discoveryError && <div style={S.messageInfo}>{queueMessage}</div>}

              <button
                onClick={startDiscovery}
                disabled={filledCount < 1 || isStarting}
                style={{
                  ...S.startBtn,
                  ...S.startBtnEmpty,
                  opacity: filledCount < 1 || isStarting ? 0.72 : 1,
                  cursor: filledCount < 1 || isStarting ? "not-allowed" : "pointer",
                }}
              >
                {isStarting
                  ? "Loading live catalog..."
                  : filledCount >= 5
                    ? "Start Live Discovery"
                    : filledCount >= 1
                      ? `Continue with ${filledCount}/5`
                      : "Add at least 1 artist"}
              </button>

              <p style={S.introFootnote}>
                {filledCount}/5 artists · starter artist graph + US storefront · {loadedCount ? `${loadedCount} tracks last loaded` : "Live discovery catalog"}
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "playing" && currentPair && (
        <div style={S.playArea}>
          <div style={S.pairIntro}>
            <p style={S.pairIntroTitle}>Pick the stronger match for your taste.</p>
            <p style={S.pairIntroSub}>
              Click ▶ on a card to preview on YouTube, then click the card to choose it. Use the buttons below for both or neither.
            </p>
          </div>

          <div style={S.pairGrid}>
            {renderTrackCard(currentPair.left, "left")}
            {renderTrackCard(currentPair.right, "right")}
          </div>

          <div style={S.pairVoteGrid}>
            <button
              onClick={() => handlePairVote("both")}
              disabled={isResolvingPair}
              style={{ ...S.choiceBtn, ...S.bothChoiceBtn, opacity: isResolvingPair ? 0.6 : 1 }}
            >
              I love them both!
            </button>
            <button
              onClick={() => handlePairVote("neither")}
              disabled={isResolvingPair}
              style={{ ...S.choiceBtn, ...S.neitherChoiceBtn, opacity: isResolvingPair ? 0.6 : 1 }}
            >
              I don't like either of them.
            </button>
          </div>

          <div style={S.sessionActionRow}>
            <button
              onClick={() => setPhase("profile")}
              disabled={isResolvingPair}
              style={{ ...S.endSessionBtn, opacity: isResolvingPair ? 0.6 : 1, cursor: isResolvingPair ? "not-allowed" : "pointer" }}
            >
              End Session
            </button>
          </div>

          <div style={S.queueStatusRow}>
            <p style={S.kbHint}>← left · → right · ↑ both · ↓ neither</p>
            <p style={S.queueNote}>{isPrefetching ? "Refreshing queue..." : queueMessage}</p>
          </div>
        </div>
      )}

      {phase === "playing" && !currentPair && (
        <div style={S.playArea}>
          <div style={S.pairIntro}>
            <p style={S.pairIntroTitle}>Searching for another match.</p>
            <p style={S.pairIntroSub}>FREQFIND is digging for a fresh pair without repeating artists you already voted on.</p>
          </div>

          <div style={{ ...S.emptyCard, maxWidth: "980px", width: "100%", textAlign: "center" }}>
            {isPrefetching ? "Refreshing the discovery queue..." : queueMessage}
          </div>

          <div style={S.sessionActionRow}>
            <button
              onClick={() => setPhase("profile")}
              disabled={isResolvingPair}
              style={{ ...S.endSessionBtn, opacity: isResolvingPair ? 0.6 : 1, cursor: isResolvingPair ? "not-allowed" : "pointer" }}
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {(phase === "profile" || phase === "done") && (
        <div style={S.profileWrap}>
          <div style={S.profileCard}>
            <h2 style={S.profileTitle}>{phase === "done" ? "Queue Complete" : "Your Live Taste Profile"}</h2>
            <p style={S.profileSub}>
              {likedTracks.length} liked · {engine.disliked.length} skipped · {catalog.length} total tracks loaded
            </p>

            {topGenres.length > 0 && (
              <div style={S.sectionBlock}>
                <h3 style={S.sectionTitle}>Top Genres</h3>
                <div style={S.genrePills}>
                  {topGenres.map(([genre, score]) => {
                    const color = getGenreColor(genre);
                    return (
                      <span
                        key={genre}
                        style={{
                          ...S.genrePill,
                          color,
                          boxShadow: `inset 0 0 0 2px ${color}`,
                        }}
                      >
                        {genre} <span style={S.genreScore}>+{score.toFixed(1)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {topDecades.length > 0 && (
              <div style={S.sectionBlock}>
                <h3 style={S.sectionTitle}>Decade Mix</h3>
                <div style={S.decadeChart}>
                  {(() => {
                    const max = Math.max(...topDecades.map(([, c]) => c));
                    return topDecades.map(([decade, count]) => (
                      <div key={decade} style={S.decadeRow}>
                        <span style={S.decadeLabel}>{decade}</span>
                        <div style={S.decadeBarTrack}>
                          <div
                            style={{
                              ...S.decadeBar,
                              width: `${Math.round((count / max) * 100)}%`,
                            }}
                          />
                        </div>
                        <span style={S.decadeCount}>{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {likedTracks.length > 0 ? (
              <div style={S.sectionBlock}>
                <h3 style={S.sectionTitle}>Liked Tracks</h3>
                <div style={S.likedList}>
                  {likedTracks.map((song) => (
                    <div key={song.id} style={S.likedItem}>
                      {song.artworkUrl ? <img src={song.artworkUrl} style={S.likedThumb} alt="" /> : <div style={S.likedThumbFallback}>◉</div>}
                      <div style={S.likedMeta}>
                        {song.era && <div style={S.likedYear}>{song.era}</div>}
                        <div style={S.likedTitle}>{song.title}</div>
                        <div style={S.likedArtist}>{song.artist}</div>
                      </div>
                      <div style={S.likedActions}>
                        {song.deezerUrl && (
                          <a href={song.deezerUrl} target="_blank" rel="noopener noreferrer" style={S.listPrimaryLink}>
                            Deezer
                          </a>
                        )}
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.artist} ${song.title}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={S.listSecondaryLink}
                        >
                          YouTube
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={S.emptyCard}>Like a few tracks to build a richer profile.</div>
            )}

            <div style={S.sectionBlock}>
              <h3 style={S.sectionTitle}>Genre Similarity Web</h3>

              {likedArtistGraphNodes.length < 2 ? (
                <div style={S.artistGraphEmpty}>Like tracks from at least 2 artists to reveal genre connections.</div>
              ) : (
                <div style={S.artistGraphShell}>
                  <p style={S.artistGraphIntro}>Top liked artists, sized by likes and linked only by shared genres.</p>

                  <div style={S.artistGraphFrame}>
                    <svg
                      viewBox={`0 0 ${ARTIST_GRAPH_VIEWBOX.width} ${ARTIST_GRAPH_VIEWBOX.height}`}
                      style={S.artistGraphSvg}
                      role="img"
                      aria-label="Genre similarity web of your liked artists"
                      onMouseLeave={() => setArtistGraphHover(null)}
                    >
                      {likedArtistGraphEdges.map((edge) => {
                        const isActive = graphFocusEdgeIds.has(edge.id);
                        const isDimmed = graphHasHover && !isActive;

                        return (
                          <path
                            key={edge.id}
                            d={edge.path}
                            fill="none"
                            stroke={isActive ? "#f8fafc" : "#94a3b8"}
                            strokeWidth={1.2 + edge.weight * 0.75}
                            strokeOpacity={isDimmed ? 0.14 : isActive ? 0.92 : 0.34 + edge.weight * 0.09}
                            style={{ transition: "stroke-opacity 0.2s, stroke 0.2s, stroke-width 0.2s" }}
                            onMouseEnter={() => setArtistGraphHover({ type: "edge", id: edge.id })}
                          >
                            <title>{edge.sharedGenres.join(", ")}</title>
                          </path>
                        );
                      })}

                      {likedArtistGraphNodes.map((node) => {
                        const color = getGenreColor(node.primaryGenre);
                        const isActive = !graphHasHover || graphFocusNodeIds.has(node.id);
                        const labelOnRight = node.x >= ARTIST_GRAPH_VIEWBOX.width / 2;
                        const labelOffset = node.radius + 8;
                        const labelX = node.x + (labelOnRight ? labelOffset : -labelOffset);

                        return (
                          <g
                            key={node.id}
                            onMouseEnter={() => setArtistGraphHover({ type: "node", id: node.id })}
                            style={{
                              opacity: isActive ? 1 : 0.28,
                              transition: "opacity 0.2s ease",
                              cursor: "default",
                            }}
                          >
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.radius + 3}
                              fill="rgba(15,23,42,0.72)"
                              stroke={isActive ? `${color}66` : "rgba(148,163,184,0.12)"}
                              strokeWidth={isActive ? 2 : 1}
                            />
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.radius}
                              fill={color}
                              fillOpacity={0.92}
                              stroke={isActive ? "#ffffff" : "rgba(15,23,42,0.85)"}
                              strokeWidth={isActive ? 2 : 1.4}
                            />
                            <text
                              x={labelX}
                              y={node.y}
                              textAnchor={labelOnRight ? "start" : "end"}
                              dominantBaseline="middle"
                              fill={isActive ? "#f8fafc" : "#94a3b8"}
                              fontSize="12"
                              fontWeight="700"
                              fontFamily="'DM Sans', sans-serif"
                              stroke="rgba(7,7,11,0.82)"
                              strokeWidth="4"
                              paintOrder="stroke"
                            >
                              {shortenLabel(node.artist)}
                            </text>
                            <title>{`${node.artist} • ${pluralizeCount(node.likeCount, "liked track")}`}</title>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div style={S.artistGraphDetailCard}>
                    <div style={S.artistGraphEyebrow}>{artistGraphDetail.eyebrow}</div>
                    <div style={S.artistGraphTitle}>{artistGraphDetail.title}</div>
                    <div style={S.artistGraphBody}>{artistGraphDetail.body}</div>
                    <div style={S.artistGraphCaption}>{artistGraphDetail.detail}</div>
                  </div>

                  {likedArtistGraphEdges.length === 0 && (
                    <div style={S.artistGraphHint}>Like more adjacent genres to reveal connections.</div>
                  )}
                </div>
              )}
            </div>

            <div style={S.footerActions}>
              {phase === "profile" && (
                <button onClick={() => setPhase("playing")} style={S.backBtn}>
                  ← Back to Discovery
                </button>
              )}
              {phase === "done" && (
                <button onClick={resetApp} style={S.startOverBtn}>
                  Start Over
                </button>
              )}
              <button
                onClick={() => {
                  window.localStorage.removeItem(TASTE_PROFILE_KEY);
                  setTasteMemoryCleared(true);
                  setTimeout(() => setTasteMemoryCleared(false), 3000);
                }}
                style={S.resetTasteBtn}
              >
                {tasteMemoryCleared ? "✓ Cleared" : "Reset Taste Memory"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  app: {
    minHeight: "100vh",
    backgroundColor: PIXEL_BACKGROUND_BLUE,
    backgroundImage: PIXEL_TILE_BACKGROUND,
    backgroundRepeat: "repeat, repeat",
    backgroundSize: "auto, 32px 32px",
    backgroundBlendMode: "multiply",
    color: "#f3f4f6",
    fontFamily: PIXEL_BODY_FONT,
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    display: "none",
  },
  bgGlow2: {
    display: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    position: "relative",
    zIndex: 10,
    background: "rgba(8, 12, 22, 0.88)",
    borderBottom: "4px solid #202d45",
    boxShadow: "0 6px 0 rgba(4, 8, 18, 0.64)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    minHeight: "48px",
    backgroundImage: "none",
    backgroundColor: "#68aed4",
    border: "3px solid #234975",
    boxShadow: "0 6px 0 #002859",
    padding: "8px 12px",
    cursor: "pointer",
  },
  logoImage: { width: "192px", height: "48px", imageRendering: "pixelated", display: "block" },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  profileBtn: {
    backgroundImage: "none",
    backgroundColor: "#94216a",
    border: "3px solid #ffd100",
    color: "#fafdff",
    minHeight: "40px",
    padding: "8px 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    boxShadow: "0 5px 0 #430067",
    cursor: "pointer",
  },
  counter: {
    backgroundColor: "#ffd100",
    border: "3px solid #ff8426",
    color: "#430067",
    minHeight: "40px",
    padding: "8px 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    boxShadow: "0 5px 0 #7f0622",
  },
  introWrap: {
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
    minHeight: "calc(100vh - 70px)",
    padding: "8px",
    width: "100%",
  },
  onboardCard: {
    ...PANEL_FRAME_BASE,
    width: "100%",
    minHeight: "calc(100vh - 86px)",
    padding: "16px 18px 18px",
    boxShadow: "0 10px 0 rgba(4, 8, 18, 0.56)",
  },
  onboardInner: {
    width: "100%",
    maxWidth: "1080px",
    margin: "0 auto",
    textAlign: "center",
  },
  introTitle: {
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "clamp(26px, 5vw, 38px)",
    fontWeight: 700,
    marginBottom: "16px",
    lineHeight: 1.2,
    color: "#fef3c7",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  introSub: { fontSize: "18px", color: "#dbe4ff", lineHeight: 1.4, marginBottom: "28px" },
  artistFields: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px", textAlign: "left" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center", gap: "10px" },
  inputNumber: {
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    color: "#fbbf24",
    width: "18px",
    textAlign: "right",
    flexShrink: 0,
  },
  artistInput: {
    flex: 1,
    ...PIXEL_BOX_BASE,
    padding: "14px 38px 14px 16px",
    fontSize: "18px",
    color: "#f8fafc",
    fontFamily: PIXEL_BODY_FONT,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
    width: "100%",
  },
  clearBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#f8fafc",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px",
    fontFamily: PIXEL_DISPLAY_FONT,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: "28px",
    right: 0,
    zIndex: 50,
    ...PIXEL_BOX_BASE,
    marginTop: "6px",
    overflow: "hidden",
  },
  dropdownItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "12px 14px",
    background: "none",
    border: "none",
    color: "#e2e8f0",
    cursor: "pointer",
    fontSize: "17px",
    textAlign: "left",
    borderBottom: "2px solid rgba(35,48,75,0.72)",
    fontFamily: PIXEL_BODY_FONT,
  },
  dropdownStatus: {
    padding: "12px 14px",
    fontSize: "16px",
    color: "#cbd5f5",
    textAlign: "left",
    fontFamily: PIXEL_BODY_FONT,
  },
  dropdownName: { fontWeight: 400 },
  dropdownGenres: { fontSize: "10px", color: "#fbbf24", fontFamily: PIXEL_DISPLAY_FONT },
  messageInfo: {
    ...PIXEL_BOX_BASE,
    color: "#dbeafe",
    fontSize: "17px",
    lineHeight: 1.35,
    padding: "12px 14px",
    marginBottom: "18px",
    textAlign: "left",
  },
  messageError: {
    ...PIXEL_BOX_BASE,
    borderColor: "#7f1d1d",
    color: "#fecaca",
    fontSize: "17px",
    lineHeight: 1.35,
    padding: "12px 14px",
    marginBottom: "18px",
    textAlign: "left",
  },
  startBtn: {
    ...createPixelButtonStyle(PIXEL_ASSETS.buttonPrimary, {
      color: "#fff7ed",
      minHeight: "56px",
      padding: "14px 32px",
      fontSize: "12px",
    }),
  },
  startBtnEmpty: {
    backgroundImage: "none",
    backgroundColor: "#234975",
    color: "#fafdff",
    border: "3px solid #68aed4",
    boxShadow: "0 6px 0 #002859",
    textTransform: "uppercase",
  },
  startOverBtn: {
    backgroundImage: "none",
    backgroundColor: "#430067",
    color: "#fef3c7",
    border: "3px solid #ff8426",
    boxShadow: "0 6px 0 #7f0622",
    minHeight: "52px",
    padding: "12px 26px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    cursor: "pointer",
  },
  introFootnote: {
    fontSize: "10px",
    color: "#9ca3af",
    marginTop: "16px",
    fontFamily: PIXEL_DISPLAY_FONT,
    letterSpacing: "0.4px",
  },
  playArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 16px 24px",
    minHeight: "calc(100vh - 70px)",
  },
  pairIntro: {
    width: "100%",
    maxWidth: "1100px",
    textAlign: "center",
    marginBottom: "14px",
  },
  pairIntroTitle: {
    margin: "0 0 6px",
    color: "#fef3c7",
    fontSize: "16px",
    fontWeight: 700,
    fontFamily: PIXEL_DISPLAY_FONT,
    textTransform: "uppercase",
  },
  pairIntroSub: {
    margin: 0,
    color: "#dbe4ff",
    fontSize: "16px",
    fontFamily: PIXEL_BODY_FONT,
  },
  pairGrid: {
    width: "100%",
    maxWidth: "900px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
    alignItems: "stretch",
  },
  pairCard: {
    ...PANEL_FRAME_BASE,
    width: "100%",
    backgroundColor: "#111827",
    overflow: "hidden",
    boxShadow: "0 18px 0 rgba(4, 8, 18, 0.68)",
    position: "relative",
    transition: "box-shadow 0.2s ease, transform 0.2s ease, outline-color 0.2s ease",
    cursor: "pointer",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "linear-gradient(180deg, rgba(18,22,34,0.98) 0%, rgba(9,11,18,0.98) 100%)",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
    position: "relative",
  },
  swipeOverlay: {
    position: "absolute",
    top: "20px",
    zIndex: 20,
    padding: "8px 24px",
    borderRadius: "8px",
    fontSize: "20px",
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "3px",
    pointerEvents: "none",
  },
  swipeLike: { right: "20px", background: "rgba(34,197,94,0.2)", color: "#22c55e", border: "2px solid #22c55e" },
  swipeSkip: { left: "20px", background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "2px solid #ef4444" },
  mediaWrap: {
    width: "100%",
    aspectRatio: "5 / 3",
    position: "relative",
    background: "linear-gradient(135deg, rgba(13, 19, 34, 0.95), rgba(32, 45, 69, 0.95))",
  },
  artwork: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  artworkFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.55), rgba(15,23,42,1))",
  },
  artworkFallbackTitle: {
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#fff",
    marginBottom: "6px",
  },
  artworkFallbackArtist: { fontSize: "14px", color: "#cbd5e1" },
  mediaBadge: {
    ...createBadgeSkinStyle({ color: "#fef3c7", fontSize: "10px", padding: "6px 10px" }),
    position: "absolute",
    right: "14px",
    bottom: "14px",
  },
  songInfo: { padding: "10px 12px 12px" },
  songTitle: {
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 4px",
    color: "#fef3c7",
    lineHeight: 1.3,
    fontFamily: PIXEL_DISPLAY_FONT,
    textTransform: "uppercase",
  },
  songArtist: { fontSize: "15px", color: "#e2e8f0", margin: "0 0 8px", fontFamily: PIXEL_BODY_FONT },
  reasonBadge: {
    backgroundImage: "none",
    backgroundColor: "#430067",
    border: "3px solid #ff8426",
    color: "#ffd100",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "26px",
    padding: "4px 10px",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    lineHeight: 1.2,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    boxShadow: "0 4px 0 #16171a",
    gap: "6px",
    marginBottom: "8px",
  },
  tags: { display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" },
  tag: {
    backgroundImage: "none",
    backgroundColor: "#ffd100",
    border: "3px solid #ff8426",
    color: "#430067",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "24px",
    padding: "3px 8px",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    lineHeight: 1.2,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    boxShadow: "0 3px 0 #16171a",
  },
  tagYear: {
    backgroundImage: "none",
    backgroundColor: "#ff8426",
    border: "3px solid #430067",
    color: "#16171a",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "24px",
    padding: "3px 8px",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    lineHeight: 1.2,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    boxShadow: "0 3px 0 #16171a",
  },
  previewBlock: {
    ...PIXEL_BOX_BASE,
    padding: "8px",
    marginBottom: "8px",
  },
  previewHint: {
    ...PIXEL_BOX_BASE,
    display: "inline-flex",
    alignItems: "center",
    minHeight: "28px",
    padding: "5px 8px",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.4,
    fontFamily: PIXEL_BODY_FONT,
  },
  ytPlayBtn: {
    position: "absolute", bottom: 8, right: 8,
    background: "rgba(0,0,0,0.7)", color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4,
    padding: "4px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", zIndex: 2,
  },
  ctaRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  primaryLink: {
    backgroundImage: "none",
    backgroundColor: "#68aed4",
    border: "3px solid #234975",
    color: "#16171a",
    minHeight: "42px",
    padding: "10px 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textDecoration: "none",
    boxShadow: "0 6px 0 #002859",
  },
  secondaryLink: {
    backgroundImage: "none",
    backgroundColor: "#fafdff",
    border: "3px solid #430067",
    color: "#430067",
    minHeight: "42px",
    padding: "10px 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textDecoration: "none",
    boxShadow: "0 6px 0 #94216a",
  },
  pairVoteGrid: {
    width: "100%",
    maxWidth: "980px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "14px",
  },
  sessionActionRow: {
    width: "100%",
    maxWidth: "980px",
    display: "flex",
    justifyContent: "center",
    marginTop: "8px",
  },
  choiceBtn: {
    backgroundImage: "none",
    backgroundRepeat: "no-repeat",
    backgroundSize: "auto",
    backgroundColor: "#234975",
    border: "3px solid #002859",
    color: "#fafdff",
    minHeight: "56px",
    padding: "12px 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    boxShadow: "0 6px 0 #002859",
    cursor: "pointer",
    transition: "transform 0.18s ease, filter 0.18s ease",
  },
  bothChoiceBtn: {
    backgroundColor: "#10d275",
    borderColor: "#007899",
    color: "#16171a",
    boxShadow: "0 6px 0 #007899",
  },
  neitherChoiceBtn: {
    backgroundColor: "#ff80a4",
    borderColor: "#94216a",
    color: "#16171a",
    boxShadow: "0 6px 0 #430067",
  },
  endSessionBtn: {
    backgroundImage: "none",
    backgroundColor: "#430067",
    border: "3px solid #ff8426",
    color: "#fef3c7",
    minHeight: "46px",
    padding: "10px 18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 6px 0 #16171a",
    cursor: "pointer",
  },
  voteRow: { display: "flex", gap: "24px", marginTop: "22px" },
  skipBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "rgba(239,68,68,0.1)",
    border: "2px solid rgba(239,68,68,0.28)",
    color: "#ef4444",
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    cursor: "pointer",
    justifyContent: "center",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
  },
  likeBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    background: "rgba(34,197,94,0.1)",
    border: "2px solid rgba(34,197,94,0.28)",
    color: "#22c55e",
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    cursor: "pointer",
    justifyContent: "center",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
  },
  voteBtnIcon: { fontSize: "24px" },
  voteBtnLabel: { fontSize: "11px", fontFamily: "'Space Mono', monospace" },
  queueStatusRow: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", marginTop: "14px" },
  kbHint: { fontSize: "10px", color: "#fbbf24", margin: 0, fontFamily: PIXEL_DISPLAY_FONT, letterSpacing: "0.4px" },
  queueNote: { fontSize: "16px", color: "#dbe4ff", margin: 0, fontFamily: PIXEL_BODY_FONT, textAlign: "center" },
  profileWrap: { display: "flex", justifyContent: "center", padding: "28px 16px", minHeight: "calc(100vh - 70px)" },
  profileCard: {
    ...PANEL_FRAME_BASE,
    width: "100%",
    maxWidth: "620px",
    padding: "20px",
    boxShadow: "0 18px 0 rgba(4, 8, 18, 0.72)",
  },
  profileTitle: {
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#fef3c7",
    lineHeight: 1.3,
    textTransform: "uppercase",
  },
  profileSub: {
    fontSize: "16px",
    color: "#dbe4ff",
    marginBottom: "28px",
    fontFamily: PIXEL_BODY_FONT,
  },
  sectionBlock: { marginBottom: "28px" },
  sectionTitle: {
    fontSize: "11px",
    color: "#fbbf24",
    fontFamily: PIXEL_DISPLAY_FONT,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  genrePills: { display: "flex", flexWrap: "wrap", gap: "8px" },
  genrePill: {
    ...createBadgeSkinStyle({ fontSize: "10px", padding: "6px 12px" }),
  },
  genreScore: { fontSize: "9px", opacity: 0.8 },
  decadeChart: { display: "flex", flexDirection: "column", gap: "8px" },
  decadeRow: { display: "flex", alignItems: "center", gap: "10px" },
  decadeLabel: { color: "#e2e8f0", fontSize: "13px", fontFamily: PIXEL_BODY_FONT, width: "46px", flexShrink: 0 },
  decadeBarTrack: { flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 3, height: 14, overflow: "hidden" },
  decadeBar: { height: "100%", background: "linear-gradient(90deg,#38bdf8,#818cf8)", borderRadius: 3, transition: "width 0.4s ease" },
  decadeCount: { color: "#fbbf24", fontSize: "11px", fontFamily: PIXEL_DISPLAY_FONT, width: "24px", textAlign: "right", flexShrink: 0 },
  likedYear: { fontSize: "10px", color: "#94a3b8", fontFamily: PIXEL_DISPLAY_FONT, letterSpacing: "0.5px", marginBottom: "2px" },
  statList: {
    ...PIXEL_BOX_BASE,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "16px",
  },
  statRow: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" },
  statLabel: { color: "#e2e8f0", fontSize: "18px", fontFamily: PIXEL_BODY_FONT },
  statValue: { color: "#fbbf24", fontSize: "10px", fontFamily: PIXEL_DISPLAY_FONT },
  likedList: { display: "flex", flexDirection: "column", gap: "10px" },
  likedItem: {
    ...PIXEL_BOX_BASE,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
  },
  likedThumb: { width: "68px", height: "68px", objectFit: "cover", flexShrink: 0, border: "3px solid #26304a" },
  likedThumbFallback: {
    width: "68px",
    height: "68px",
    background: "#121b2d",
    border: "3px solid #26304a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fbbf24",
    flexShrink: 0,
    fontFamily: PIXEL_DISPLAY_FONT,
  },
  likedMeta: { flex: 1, minWidth: 0 },
  likedTitle: { fontSize: "18px", fontWeight: 400, color: "#fef3c7", marginBottom: "3px", fontFamily: PIXEL_BODY_FONT },
  likedArtist: { fontSize: "16px", color: "#dbe4ff", fontFamily: PIXEL_BODY_FONT },
  likedActions: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" },
  listPrimaryLink: {
    backgroundImage: "none",
    backgroundColor: "#68aed4",
    border: "3px solid #234975",
    color: "#16171a",
    minHeight: "38px",
    padding: "8px 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textDecoration: "none",
    boxShadow: "0 5px 0 #002859",
  },
  listSecondaryLink: {
    backgroundImage: "none",
    backgroundColor: "#fafdff",
    border: "3px solid #430067",
    color: "#430067",
    minHeight: "38px",
    padding: "8px 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textDecoration: "none",
    boxShadow: "0 5px 0 #94216a",
  },
  artistGraphShell: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  artistGraphIntro: {
    margin: 0,
    color: "#dbe4ff",
    fontSize: "16px",
    lineHeight: 1.35,
    fontFamily: PIXEL_BODY_FONT,
  },
  artistGraphFrame: {
    ...PANEL_FRAME_BASE,
    overflow: "hidden",
    padding: "10px",
  },
  artistGraphSvg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  artistGraphDetailCard: {
    ...PIXEL_BOX_BASE,
    padding: "14px 16px",
  },
  artistGraphEyebrow: {
    fontSize: "10px",
    color: "#fbbf24",
    fontFamily: PIXEL_DISPLAY_FONT,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "8px",
  },
  artistGraphTitle: {
    fontSize: "18px",
    color: "#fef3c7",
    fontWeight: 700,
    marginBottom: "4px",
    fontFamily: PIXEL_DISPLAY_FONT,
  },
  artistGraphBody: {
    fontSize: "10px",
    color: "#dbe4ff",
    marginBottom: "6px",
    fontFamily: PIXEL_DISPLAY_FONT,
  },
  artistGraphCaption: {
    fontSize: "16px",
    color: "#cbd5e1",
    lineHeight: 1.35,
    fontFamily: PIXEL_BODY_FONT,
  },
  artistGraphHint: {
    fontSize: "10px",
    color: "#fbbf24",
    fontFamily: PIXEL_DISPLAY_FONT,
  },
  artistGraphEmpty: {
    ...PIXEL_BOX_BASE,
    padding: "18px",
    color: "#dbe4ff",
    fontSize: "16px",
    fontFamily: PIXEL_BODY_FONT,
  },
  emptyCard: {
    ...PIXEL_BOX_BASE,
    padding: "18px",
    color: "#dbe4ff",
    fontSize: "16px",
    fontFamily: PIXEL_BODY_FONT,
  },
  footerActions: { display: "flex", justifyContent: "flex-start", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "10px 22px",
    backgroundColor: "#68aed4",
    border: "3px solid #234975",
    boxShadow: "0 5px 0 #002859",
    color: "#16171a",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "10px",
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
  },
  resetTasteBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#64748b",
    fontFamily: PIXEL_DISPLAY_FONT,
    fontSize: "9px",
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    cursor: "pointer",
    padding: "4px 0",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
};
