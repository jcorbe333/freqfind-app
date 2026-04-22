import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const NEEDLE_ARCHIVE_URL = "https://theneedledrop.com/loved-list/";
const BANDCAMP_AOTD_URL = "https://daily.bandcamp.com/album-of-the-day";
const BANDCAMP_WINDOW_DAYS = 365;
// Use no-www + no trailing slash to avoid redirect chain
const STEREOGUM_FEED_URL = "https://stereogum.com/category/album-of-the-week/feed";
const STEREOGUM_WINDOW_DAYS = 365;
const INDIESHUFFLE_BASE_URL = "https://www.indieshuffle.com";
const INDIESHUFFLE_WINDOW_DAYS = 365;
const INDIESHUFFLE_MAX_PAGES = 20;
const INDIESHUFFLE_POST_LIMIT = 80; // cap to avoid excessive individual page fetches
const PITCHFORK_FEED_URL = "https://pitchfork.com/feed/feed-album-reviews/rss";
const PITCHFORK_WINDOW_DAYS = 365;
const KEXP_PLAYS_API = "https://api.kexp.org/v2/plays/";
const KEXP_WINDOW_DAYS = 365;
const NPR_FEED_URL = "https://feeds.npr.org/1108/rss.xml";
const NPR_WINDOW_DAYS = 365;
const QUIETUS_FEED_URL = "https://thequietus.com/feed/";
const QUIETUS_WINDOW_DAYS = 365;
// Genre slugs from /songs/<slug> hrefs — excludes artist-name tags that share the same prefix.
const INDIESHUFFLE_TARGET_GENRE_SLUGS = new Set([
  "indie",
  "indie-rock",
  "indie-pop",
  "indie-folk",
  "indie-electronic",
  "alternative",
  "alternative-rock",
  "dream-pop",
  "shoegaze",
  "post-rock",
  "post-punk",
  "art-rock",
  "psychedelic-rock",
  "garage-rock",
  "folk-rock",
  "indietronica",
  "chamber-pop",
  "rock",
]);
const REQUEST_HEADERS = {
  "user-agent": "FREQFIND/1.0 (+https://freqfind.local)",
  "accept-language": "en-US,en;q=0.9",
};
const SOURCE_DEFINITIONS = {
  "needle-drop-loved-list": {
    label: "The Needle Drop Loved List",
    weight: 5,
  },
  "bandcamp-album-of-the-day": {
    label: "Bandcamp Album of the Day",
    weight: 4,
  },
  "indieshuffle": {
    label: "IndieShuffle",
    weight: 3,
  },
  "stereogum-album-of-the-week": {
    label: "Stereogum Album of the Week",
    weight: 4,
  },
  "pitchfork-bnm": {
    label: "Pitchfork Best New Music",
    weight: 5,
  },
  "kexp-song-of-the-day": {
    label: "KEXP Song of the Day",
    weight: 3,
  },
  "npr-music": {
    label: "NPR Music",
    weight: 4,
  },
  "the-quietus": {
    label: "The Quietus",
    weight: 4,
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_FILE = path.join(ROOT_DIR, "public", "editorial-signals.json");

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeKey(value = "") {
  return cleanText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[’'`"]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase()
    .trim();
}

function toAbsoluteUrl(href, baseUrl) {
  if (!href) return baseUrl;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function toIsoDate(value, fallback = null) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().slice(0, 10);
}

function extractPublishedDate($, fallbackYear = "") {
  return (
    toIsoDate($('meta[property="article:published_time"]').attr("content")) ||
    toIsoDate($('meta[name="article:published_time"]').attr("content")) ||
    toIsoDate($("time[datetime]").first().attr("datetime")) ||
    (fallbackYear ? `${fallbackYear}-01-01` : null)
  );
}

function parseArtistAlbumText(rawText) {
  const text = cleanText(rawText)
    .replace(/\s+[|·]\s+.*/g, "")
    .replace(/\s*\(Album of the Day\)$/i, "")
    .trim();

  if (!text) return null;
  if (/full\s+\d{4}\s+list|playlist|older posts|read more/i.test(text)) return null;

  const quotedMatch = text.match(/^(.*),\s*[“"](.+?)[”"]$/);
  if (quotedMatch) {
    const artist = cleanText(quotedMatch[1]);
    const album = cleanText(quotedMatch[2]);
    if (artist && album) return { artist, album };
  }

  const dashedMatch = text.match(/^(.*)\s[-–—]\s(.+)$/);
  if (dashedMatch) {
    const artist = cleanText(dashedMatch[1]);
    const album = cleanText(dashedMatch[2]);
    if (artist && album && !/albums?\/eps?/i.test(artist)) return { artist, album };
  }

  return null;
}

function buildMention({ artist, album, sourceId, publishedAt, url }) {
  const source = SOURCE_DEFINITIONS[sourceId];
  if (!source) return null;

  return {
    artist,
    album,
    artistKey: normalizeKey(artist),
    albumKey: normalizeKey(album),
    sourceId,
    sourceLabel: source.label,
    weight: source.weight,
    publishedAt,
    url,
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}.`);
  }
  return response.text();
}

function extractNeedleYearUrls($) {
  const yearUrls = new Map();

  $('a[href*="/loved-list/"]').each((_, element) => {
    const href = toAbsoluteUrl($(element).attr("href"), NEEDLE_ARCHIVE_URL);
    const match = href.match(/\/loved-list\/(\d{4})\/?$/);
    if (!match) return;
    yearUrls.set(match[1], href);
  });

  return Array.from(yearUrls.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([, url]) => url);
}

async function fetchNeedleMentions() {
  const archiveHtml = await fetchHtml(NEEDLE_ARCHIVE_URL);
  const archive$ = cheerio.load(archiveHtml);
  const yearUrls = extractNeedleYearUrls(archive$);
  const mentions = [];

  for (const pageUrl of yearUrls) {
    const html = await fetchHtml(pageUrl);
    const $ = cheerio.load(html);
    const fallbackYear = pageUrl.match(/\/loved-list\/(\d{4})\/?$/)?.[1] || "";
    const publishedAt = extractPublishedDate($, fallbackYear);
    const seen = new Set();

    $(".post_content .post_c_in a").each((_, element) => {
      const parsed = parseArtistAlbumText($(element).text());
      if (!parsed) return;

      const mention = buildMention({
        artist: parsed.artist,
        album: parsed.album,
        sourceId: "needle-drop-loved-list",
        publishedAt,
        url: pageUrl,
      });

      if (!mention?.artistKey || !mention.albumKey) return;

      const key = `${mention.artistKey}__${mention.albumKey}`;
      if (seen.has(key)) return;
      seen.add(key);
      mentions.push(mention);
    });
  }

  return mentions;
}

function parseBandcampDate(rawText = "") {
  const match = cleanText(rawText).match(/([A-Z][a-z]+ \d{1,2}, \d{4})/);
  return match ? toIsoDate(match[1]) : null;
}

async function fetchBandcampMentions() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - BANDCAMP_WINDOW_DAYS);

  const mentions = [];
  const visited = new Set();
  let pageUrl = BANDCAMP_AOTD_URL;

  while (pageUrl && !visited.has(pageUrl)) {
    visited.add(pageUrl);

    const html = await fetchHtml(pageUrl);
    const $ = cheerio.load(html);
    let reachedOlderWindow = false;

    $(".list-article.aotd").each((_, element) => {
      const publishedAt = parseBandcampDate($(element).find(".article-info-text").text());
      if (!publishedAt) return;

      const publishedDate = new Date(publishedAt);
      if (publishedDate < cutoff) {
        reachedOlderWindow = true;
        return;
      }

      const parsed = parseArtistAlbumText($(element).find("a.title").first().text());
      if (!parsed) return;

      const mention = buildMention({
        artist: parsed.artist,
        album: parsed.album,
        sourceId: "bandcamp-album-of-the-day",
        publishedAt,
        url: toAbsoluteUrl($(element).find("a.title").first().attr("href"), BANDCAMP_AOTD_URL),
      });

      if (mention?.artistKey && mention.albumKey) mentions.push(mention);
    });

    const olderPostsUrl = $("a")
      .toArray()
      .map((element) => ({
        text: cleanText($(element).text()),
        href: $(element).attr("href"),
      }))
      .find((link) => /older posts/i.test(link.text))?.href;

    if (!olderPostsUrl || reachedOlderWindow) break;
    pageUrl = toAbsoluteUrl(olderPostsUrl, BANDCAMP_AOTD_URL);
  }

  return mentions;
}

async function fetchSterogumMentions() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - STEREOGUM_WINDOW_DAYS);

  let xml;
  try {
    xml = await fetchHtml(STEREOGUM_FEED_URL);
  } catch {
    return [];
  }

  const $ = cheerio.load(xml, { xmlMode: true });
  const mentions = [];

  $("item").each((_, el) => {
    const link = cleanText($(el).find("link").text()) || cleanText($(el).find("guid").text());
    const pubDate = cleanText($(el).find("pubDate").text());
    const publishedAt = toIsoDate(pubDate);

    if (publishedAt && new Date(publishedAt) < cutoff) return;

    // Description CDATA: em tags are entity-encoded (&lt;em&gt;) so use regex
    // e.g. "Album Of The Week: Carla dal Forno &lt;em&gt;Confession&lt;/em&gt;"
    const descText = $(el).find("description").text();
    const albumMatch = descText.match(/&lt;em&gt;(.+?)&lt;\/em&gt;/);
    const album = albumMatch ? cleanText(albumMatch[1]) : null;
    if (!album) return;

    const titleMatch = descText.match(/Album Of The Week:\s*(.*?)&lt;em&gt;/i);
    const artist = titleMatch ? cleanText(titleMatch[1]) : null;
    if (!artist) return;

    const mention = buildMention({
      artist,
      album,
      sourceId: "stereogum-album-of-the-week",
      publishedAt,
      url: link,
    });
    if (mention?.artistKey && mention.albumKey) mentions.push(mention);
  });

  return mentions;
}

async function fetchIndieshuffleSitemapUrls() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - INDIESHUFFLE_WINDOW_DAYS);

  const urls = [];

  for (let i = 1; i <= 34; i++) {
    const sitemapUrl = `${INDIESHUFFLE_BASE_URL}/sitemap/post${i}.xml`;
    let html;
    try {
      html = await fetchHtml(sitemapUrl);
    } catch {
      break;
    }

    const $ = cheerio.load(html, { xmlMode: true });
    let reachedCutoff = false;

    $("url").each((_, el) => {
      const loc = cleanText($(el).find("loc").text());
      const lastmod = cleanText($(el).find("lastmod").text());
      if (!loc) return;
      const postDate = lastmod ? new Date(lastmod) : null;
      if (postDate && postDate < cutoff) {
        reachedCutoff = true;
        return;
      }
      urls.push({ url: loc, lastmod: lastmod ? lastmod.slice(0, 10) : null });
    });

    if (reachedCutoff) break;
  }

  return urls;
}

async function parseIndieshufflePost({ url, lastmod }) {
  let html;
  try {
    html = await fetchHtml(url);
  } catch {
    return null;
  }

  const $ = cheerio.load(html);

  const hasTargetGenre = $('a[href^="/songs/"]').toArray().some((el) => {
    const slug = ($(el).attr("href") || "")
      .replace(/^\/songs\//, "")
      .replace(/\/$/, "");
    return INDIESHUFFLE_TARGET_GENRE_SLUGS.has(slug);
  });
  if (!hasTargetGenre) return null;

  const artist = cleanText($("h1").first().text());
  const song = cleanText($("h2").first().text());
  if (!artist || !song) return null;

  return { artist, song, publishedAt: extractPublishedDate($) || lastmod || null, url };
}

async function fetchIndieshuffleMentions() {
  const allPostRefs = await fetchIndieshuffleSitemapUrls();
  const postRefs = allPostRefs.slice(0, INDIESHUFFLE_POST_LIMIT);
  console.log(`IndieShuffle: fetching ${postRefs.length} of ${allPostRefs.length} posts...`);
  const mentions = [];

  for (let i = 0; i < postRefs.length; i += INDIESHUFFLE_MAX_PAGES) {
    const batch = postRefs.slice(i, i + INDIESHUFFLE_MAX_PAGES);
    console.log(`  IndieShuffle batch ${Math.floor(i / INDIESHUFFLE_MAX_PAGES) + 1}/${Math.ceil(postRefs.length / INDIESHUFFLE_MAX_PAGES)}...`);
    const results = await Promise.allSettled(batch.map((ref) => parseIndieshufflePost(ref)));

    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) continue;
      const { artist, song, publishedAt, url } = result.value;
      const mention = buildMention({ artist, album: song, sourceId: "indieshuffle", publishedAt, url });
      if (mention?.artistKey && mention.albumKey) mentions.push(mention);
    }
  }

  return mentions;
}

function aggregateMentions(mentions) {
  const grouped = new Map();
  const artistSources = new Map();

  mentions.forEach((mention) => {
    if (!artistSources.has(mention.artistKey)) {
      artistSources.set(mention.artistKey, new Set());
    }
    artistSources.get(mention.artistKey).add(mention.sourceId);

    const key = `${mention.artistKey}__${mention.albumKey}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        artist: mention.artist,
        album: mention.album,
        artistKey: mention.artistKey,
        albumKey: mention.albumKey,
        sources: [],
        sourceKeys: new Set(),
        mentionCount: 0,
      });
    }

    const group = grouped.get(key);
    group.mentionCount += 1;

    const sourceKey = `${mention.sourceId}::${mention.url}`;
    if (!group.sourceKeys.has(sourceKey)) {
      group.sourceKeys.add(sourceKey);
      group.sources.push({
        sourceId: mention.sourceId,
        sourceLabel: mention.sourceLabel,
        weight: mention.weight,
        publishedAt: mention.publishedAt,
        url: mention.url,
      });
    }
  });

  return Array.from(grouped.values())
    .map((group) => {
      const distinctSources = new Set(group.sources.map((source) => source.sourceId));
      const artistSourceCount = artistSources.get(group.artistKey)?.size || 0;
      const multiSourceBonus =
        distinctSources.size > 1 ? 2 : artistSourceCount > 1 ? 1 : 0;
      const editorialWeight =
        group.sources.reduce((sum, source) => sum + source.weight, 0) + multiSourceBonus;

      return {
        artist: group.artist,
        album: group.album,
        artistKey: group.artistKey,
        albumKey: group.albumKey,
        sources: group.sources.sort((a, b) => {
          const dateDelta = (b.publishedAt || "").localeCompare(a.publishedAt || "");
          if (dateDelta !== 0) return dateDelta;
          return a.sourceLabel.localeCompare(b.sourceLabel);
        }),
        editorialWeight: Number(editorialWeight.toFixed(2)),
        multiSourceBonus,
        mentionCount: group.mentionCount,
      };
    })
    .sort((a, b) => {
      const weightDelta = b.editorialWeight - a.editorialWeight;
      if (weightDelta !== 0) return weightDelta;
      const mentionDelta = b.mentionCount - a.mentionCount;
      if (mentionDelta !== 0) return mentionDelta;
      const sourceDateA = a.sources[0]?.publishedAt || "";
      const sourceDateB = b.sources[0]?.publishedAt || "";
      const dateDelta = sourceDateB.localeCompare(sourceDateA);
      if (dateDelta !== 0) return dateDelta;
      const artistDelta = a.artist.localeCompare(b.artist);
      if (artistDelta !== 0) return artistDelta;
      return a.album.localeCompare(b.album);
    });
}

function slugToTitleCase(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function fetchPitchforkMentions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PITCHFORK_WINDOW_DAYS);

  let xml;
  try {
    xml = await fetchHtml(PITCHFORK_FEED_URL);
  } catch {
    return [];
  }

  const $ = cheerio.load(xml, { xmlMode: true });
  const mentions = [];

  $("item").each((_, el) => {
    const pubDate = cleanText($(el).find("pubDate").text());
    const publishedAt = toIsoDate(pubDate);
    if (publishedAt && new Date(publishedAt) < cutoff) return;

    // Pitchfork RSS: title = album name only; artist is encoded in the URL slug
    // e.g. /reviews/albums/yaya-bey-fidelity/ with title "Fidelity"
    const link = cleanText($(el).find("link").text()) || cleanText($(el).find("guid").text());
    const urlMatch = link.match(/\/reviews\/albums\/([^/]+)\/?$/);
    if (!urlMatch) return;

    const albumTitle = cleanText($(el).find("title").text());
    if (!albumTitle) return;

    // Build a slug from the album title and remove it from the full URL slug to get artist slug
    const albumSlug = normalizeKey(albumTitle).replace(/\s+/g, "-");
    const fullSlug = urlMatch[1];
    const escapedAlbumSlug = albumSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const artistSlug = fullSlug
      .replace(new RegExp(`-?${escapedAlbumSlug}$`), "")
      .replace(/-$/, "")
      .trim();
    if (!artistSlug) return;

    const artist = slugToTitleCase(artistSlug);
    const mention = buildMention({
      artist,
      album: albumTitle,
      sourceId: "pitchfork-bnm",
      publishedAt,
      url: link,
    });
    if (mention?.artistKey && mention.albumKey) mentions.push(mention);
  });

  return mentions;
}

async function fetchKexpMentions() {
  // KEXP has no public RSS feed; use their open API to fetch tracks with
  // rotation_status "R/N" (Rotation New) — KEXP's editorial signal for newly
  // championed music. We paginate until we reach the window cutoff.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - KEXP_WINDOW_DAYS);

  const seen = new Map(); // artistKey__albumKey → mention
  let nextUrl = `${KEXP_PLAYS_API}?format=json&limit=200&ordering=-airdate`;
  let pages = 0;

  while (nextUrl && pages < 20) {
    let data;
    try {
      const res = await fetch(nextUrl, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) break;
      data = await res.json();
    } catch {
      break;
    }

    pages++;
    let reachedCutoff = false;

    for (const play of data.results || []) {
      if (play.play_type !== "trackplay") continue;
      if (play.rotation_status !== "R/N") continue;
      if (!play.artist || !play.album) continue;

      const airdate = toIsoDate(play.airdate);
      if (airdate && new Date(airdate) < cutoff) {
        reachedCutoff = true;
        break;
      }

      const key = `${normalizeKey(play.artist)}__${normalizeKey(play.album)}`;
      if (seen.has(key)) continue;

      const mention = buildMention({
        artist: play.artist,
        album: play.album,
        sourceId: "kexp-song-of-the-day",
        publishedAt: airdate,
        url: `https://www.kexp.org/playlist/`,
      });
      if (mention?.artistKey && mention.albumKey) seen.set(key, mention);
    }

    if (reachedCutoff || !data.next) break;
    nextUrl = data.next;
  }

  return Array.from(seen.values());
}

async function fetchNprMentions() {
  // NPR Music feed (World Cafe): items are artist interview/profile articles.
  // Artist is often extractable from the URL slug (pattern: /artist-name-album-title-slug/)
  // Album title is in an <em> tag in the description CDATA.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NPR_WINDOW_DAYS);

  let xml;
  try {
    xml = await fetchHtml(NPR_FEED_URL);
  } catch {
    return [];
  }

  const $ = cheerio.load(xml, { xmlMode: true });
  const mentions = [];

  $("item").each((_, el) => {
    const pubDate = cleanText($(el).find("pubDate").text());
    const publishedAt = toIsoDate(pubDate);
    if (publishedAt && new Date(publishedAt) < cutoff) return;

    const link = cleanText($(el).find("link").text()) || cleanText($(el).find("guid").text());

    // Skip roundup articles — these list many albums, not one artist
    const rawTitle = cleanText($(el).find("title").text());
    if (/^(the\s+)?best new albums/i.test(rawTitle)) return;
    if (/new music friday/i.test(rawTitle)) return;

    // Extract album title from <em> in description.
    // NPR encodes entities in description (&lt;em&gt;) but cheerio decodes them
    // when parsing in xmlMode, so we match actual <em> tags.
    const descText = $(el).find("description").text();
    const emMatch = descText.match(/<em>(.+?)<\/em>/);
    const album = emMatch ? cleanText(emMatch[1]).replace(/,?\s*$/, "") : null;
    if (!album) return;

    // Extract artist from URL slug: last path segment, split on "-album-"
    // e.g. /born-ruffians-album-beautys-pride → "Born Ruffians"
    const slugMatch = link.match(/\/([^/]+)$/);
    if (!slugMatch) return;
    const lastSegment = slugMatch[1].replace(/[?#].*/, "");
    const albumPart = /-album-/i.test(lastSegment)
      ? lastSegment.split(/-album-/i)[0]
      : null;
    if (!albumPart) return;

    const artist = slugToTitleCase(albumPart);

    const mention = buildMention({
      artist,
      album,
      sourceId: "npr-music",
      publishedAt,
      url: link,
    });
    if (mention?.artistKey && mention.albumKey) mentions.push(mention);
  });

  return mentions;
}

async function fetchQuietusMentions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - QUIETUS_WINDOW_DAYS);

  let xml;
  try {
    xml = await fetchHtml(QUIETUS_FEED_URL);
  } catch {
    return [];
  }

  const $ = cheerio.load(xml, { xmlMode: true });
  const mentions = [];

  $("item").each((_, el) => {
    // Filter to review items only via category (not title text)
    const categories = $(el).find("category").toArray().map((c) => cleanText($(c).text()));
    if (!categories.some((c) => /^reviews?$/i.test(c))) return;

    const pubDate = cleanText($(el).find("pubDate").text());
    const publishedAt = toIsoDate(pubDate);
    if (publishedAt && new Date(publishedAt) < cutoff) return;

    const link = cleanText($(el).find("link").text()) || cleanText($(el).find("guid").text());
    // Quietus review title format: "Artist Name – Album Title"
    const rawTitle = cleanText($(el).find("title").text());
    const parsed = parseArtistAlbumText(rawTitle);
    if (!parsed) return;

    const mention = buildMention({
      artist: parsed.artist,
      album: parsed.album,
      sourceId: "the-quietus",
      publishedAt,
      url: link,
    });
    if (mention?.artistKey && mention.albumKey) mentions.push(mention);
  });

  return mentions;
}

async function main() {
  console.log("Fetching editorial signals...");
  const [
    needleMentions,
    bandcampMentions,
    indieshuffleMentions,
    stereogumMentions,
    pitchforkMentions,
    kexpMentions,
    nprMentions,
    quietusMentions,
  ] = await Promise.all([
    fetchNeedleMentions().then((r) => { console.log(`Needle Drop done: ${r.length} mentions`); return r; }),
    fetchBandcampMentions().then((r) => { console.log(`Bandcamp done: ${r.length} mentions`); return r; }),
    fetchIndieshuffleMentions().then((r) => { console.log(`IndieShuffle done: ${r.length} mentions`); return r; }),
    fetchSterogumMentions().then((r) => { console.log(`Stereogum done: ${r.length} mentions`); return r; }),
    fetchPitchforkMentions().then((r) => { console.log(`Pitchfork BNM done: ${r.length} mentions`); return r; }),
    fetchKexpMentions().then((r) => { console.log(`KEXP done: ${r.length} mentions`); return r; }),
    fetchNprMentions().then((r) => { console.log(`NPR Music done: ${r.length} mentions`); return r; }),
    fetchQuietusMentions().then((r) => { console.log(`The Quietus done: ${r.length} mentions`); return r; }),
  ]);

  const items = aggregateMentions([
    ...needleMentions,
    ...bandcampMentions,
    ...indieshuffleMentions,
    ...stereogumMentions,
    ...pitchforkMentions,
    ...kexpMentions,
    ...nprMentions,
    ...quietusMentions,
  ]);
  const payload = {
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Saved ${items.length} editorial items to ${OUTPUT_FILE}`);
  console.log(`Needle Drop mentions: ${needleMentions.length}`);
  console.log(`Bandcamp mentions: ${bandcampMentions.length}`);
  console.log(`IndieShuffle mentions: ${indieshuffleMentions.length}`);
  console.log(`Stereogum AOTW mentions: ${stereogumMentions.length}`);
  console.log(`Pitchfork BNM mentions: ${pitchforkMentions.length}`);
  console.log(`KEXP mentions: ${kexpMentions.length}`);
  console.log(`NPR Music mentions: ${nprMentions.length}`);
  console.log(`The Quietus mentions: ${quietusMentions.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
