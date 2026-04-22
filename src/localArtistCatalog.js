const ARTIST_GRAPH = [
  {
    name: "Radiohead",
    genres: ["alternative", "art rock", "electronic"],
    discoveryTags: ["atmospheric", "restless", "left-field"],
    similarArtists: [
      { name: "The Smile", weight: 1 },
      { name: "Portishead", weight: 0.92 },
      { name: "Massive Attack", weight: 0.82 },
      { name: "Interpol", weight: 0.72 },
    ],
  },
  {
    name: "The Smile",
    genres: ["alternative", "art rock", "post-punk"],
    discoveryTags: ["angular", "live-wire", "moody"],
    similarArtists: [
      { name: "Radiohead", weight: 1 },
      { name: "Interpol", weight: 0.72 },
      { name: "LCD Soundsystem", weight: 0.62 },
    ],
  },
  {
    name: "Portishead",
    genres: ["trip-hop", "alternative", "electronic"],
    discoveryTags: ["smoky", "cinematic", "nocturnal"],
    similarArtists: [
      { name: "Massive Attack", weight: 1 },
      { name: "Radiohead", weight: 0.86 },
      { name: "Bonobo", weight: 0.68 },
    ],
  },
  {
    name: "Massive Attack",
    genres: ["trip-hop", "electronic", "alternative"],
    discoveryTags: ["shadowy", "bass-heavy", "brooding"],
    similarArtists: [
      { name: "Portishead", weight: 1 },
      { name: "Bonobo", weight: 0.72 },
      { name: "Radiohead", weight: 0.7 },
    ],
  },
  {
    name: "Interpol",
    genres: ["post-punk", "indie rock", "alternative"],
    discoveryTags: ["icy", "tight", "guitar-driven"],
    similarArtists: [
      { name: "The National", weight: 0.86 },
      { name: "The Strokes", weight: 0.8 },
      { name: "Radiohead", weight: 0.62 },
    ],
  },
  {
    name: "The National",
    genres: ["indie rock", "alternative", "baroque pop"],
    discoveryTags: ["melancholic", "literate", "steady-burn"],
    similarArtists: [
      { name: "Phoebe Bridgers", weight: 0.86 },
      { name: "Bon Iver", weight: 0.78 },
      { name: "Interpol", weight: 0.7 },
    ],
  },
  {
    name: "Arcade Fire",
    genres: ["indie rock", "art rock", "alternative"],
    discoveryTags: ["anthemic", "communal", "dramatic"],
    similarArtists: [
      { name: "LCD Soundsystem", weight: 0.84 },
      { name: "Vampire Weekend", weight: 0.66 },
      { name: "The National", weight: 0.64 },
    ],
  },
  {
    name: "LCD Soundsystem",
    genres: ["dance-punk", "electronic", "indie rock"],
    discoveryTags: ["groove-forward", "wry", "kinetic"],
    similarArtists: [
      { name: "Jamie xx", weight: 0.86 },
      { name: "Arcade Fire", weight: 0.78 },
      { name: "The Strokes", weight: 0.68 },
    ],
  },
  {
    name: "Tame Impala",
    genres: ["psychedelic", "indie rock", "electronic"],
    discoveryTags: ["dreamy", "saturated", "headphone"],
    similarArtists: [
      { name: "MGMT", weight: 0.84 },
      { name: "Beach House", weight: 0.76 },
      { name: "M83", weight: 0.72 },
      { name: "The Flaming Lips", weight: 0.66 },
    ],
  },
  {
    name: "MGMT",
    genres: ["indie pop", "psychedelic", "electronic"],
    discoveryTags: ["offbeat", "bright", "spacey"],
    similarArtists: [
      { name: "Tame Impala", weight: 0.84 },
      { name: "M83", weight: 0.74 },
      { name: "Vampire Weekend", weight: 0.62 },
    ],
  },
  {
    name: "M83",
    genres: ["electronic", "shoegaze", "synth-pop"],
    discoveryTags: ["widescreen", "nostalgic", "soaring"],
    similarArtists: [
      { name: "Beach House", weight: 0.82 },
      { name: "Tame Impala", weight: 0.72 },
      { name: "Slowdive", weight: 0.68 },
    ],
  },
  {
    name: "Beach House",
    genres: ["dream pop", "shoegaze", "indie"],
    discoveryTags: ["hazy", "romantic", "slow-bloom"],
    similarArtists: [
      { name: "Mazzy Star", weight: 0.88 },
      { name: "Slowdive", weight: 0.8 },
      { name: "M83", weight: 0.72 },
      { name: "Tame Impala", weight: 0.64 },
    ],
  },
  {
    name: "Mazzy Star",
    genres: ["dream pop", "shoegaze", "alternative"],
    discoveryTags: ["dusty", "intimate", "twilight"],
    similarArtists: [
      { name: "Beach House", weight: 0.88 },
      { name: "Slowdive", weight: 0.76 },
      { name: "Phoebe Bridgers", weight: 0.56 },
    ],
  },
  {
    name: "Slowdive",
    genres: ["shoegaze", "dream pop", "alternative"],
    discoveryTags: ["glacial", "immersive", "floating"],
    similarArtists: [
      { name: "Beach House", weight: 0.8 },
      { name: "Mazzy Star", weight: 0.74 },
      { name: "M83", weight: 0.64 },
    ],
  },
  {
    name: "Phoebe Bridgers",
    genres: ["indie folk", "indie rock", "singer-songwriter"],
    discoveryTags: ["confessional", "quiet-loud", "fragile"],
    similarArtists: [
      { name: "Boygenius", weight: 0.92 },
      { name: "Big Thief", weight: 0.84 },
      { name: "Julien Baker", weight: 0.84 },
      { name: "Adrianne Lenker", weight: 0.78 },
      { name: "Wednesday", weight: 0.72 },
    ],
  },
  {
    name: "Boygenius",
    genres: ["indie rock", "indie folk", "alternative"],
    discoveryTags: ["harmonic", "earnest", "sharp"],
    similarArtists: [
      { name: "Phoebe Bridgers", weight: 0.92 },
      { name: "Big Thief", weight: 0.82 },
      { name: "Julien Baker", weight: 0.84 },
      { name: "Lucy Dacus", weight: 0.84 },
    ],
  },
  {
    name: "Julien Baker",
    genres: ["indie folk", "singer-songwriter", "alternative"],
    discoveryTags: ["sparse", "intense", "unflinching"],
    similarArtists: [
      { name: "Phoebe Bridgers", weight: 0.86 },
      { name: "Lucy Dacus", weight: 0.8 },
      { name: "The National", weight: 0.58 },
    ],
  },
  {
    name: "Lucy Dacus",
    genres: ["indie rock", "singer-songwriter", "alternative"],
    discoveryTags: ["wry", "narrative", "warm"],
    similarArtists: [
      { name: "Phoebe Bridgers", weight: 0.8 },
      { name: "Boygenius", weight: 0.84 },
      { name: "Sufjan Stevens", weight: 0.54 },
    ],
  },
  {
    name: "Bon Iver",
    genres: ["indie folk", "experimental", "alternative"],
    discoveryTags: ["textural", "wintery", "fractured"],
    similarArtists: [
      { name: "Sufjan Stevens", weight: 0.78 },
      { name: "Sampha", weight: 0.76 },
      { name: "James Blake", weight: 0.72 },
      { name: "Adrianne Lenker", weight: 0.66 },
    ],
  },
  {
    name: "Sufjan Stevens",
    genres: ["indie folk", "baroque pop", "singer-songwriter"],
    discoveryTags: ["ornate", "spiritual", "delicate"],
    similarArtists: [
      { name: "Bon Iver", weight: 0.76 },
      { name: "Phoebe Bridgers", weight: 0.56 },
      { name: "Vampire Weekend", weight: 0.48 },
    ],
  },
  {
    name: "Vampire Weekend",
    genres: ["indie rock", "indie pop", "alternative"],
    discoveryTags: ["nimble", "sunlit", "literate"],
    similarArtists: [
      { name: "MGMT", weight: 0.62 },
      { name: "Arcade Fire", weight: 0.68 },
      { name: "The Strokes", weight: 0.6 },
    ],
  },
  {
    name: "The Strokes",
    genres: ["indie rock", "garage rock", "alternative"],
    discoveryTags: ["snappy", "downtown", "cool-toned"],
    similarArtists: [
      { name: "Arctic Monkeys", weight: 0.8 },
      { name: "Interpol", weight: 0.74 },
      { name: "The Killers", weight: 0.68 },
      { name: "Vampire Weekend", weight: 0.54 },
    ],
  },
  {
    name: "Arctic Monkeys",
    genres: ["indie rock", "alternative rock", "post-punk"],
    discoveryTags: ["sleek", "riffy", "dry"],
    similarArtists: [
      { name: "The Strokes", weight: 0.82 },
      { name: "Queens of the Stone Age", weight: 0.7 },
      { name: "The Killers", weight: 0.62 },
    ],
  },
  {
    name: "The Killers",
    genres: ["indie rock", "alternative rock", "new wave"],
    discoveryTags: ["anthemic", "neon", "heartland"],
    similarArtists: [
      { name: "The Strokes", weight: 0.72 },
      { name: "Arctic Monkeys", weight: 0.62 },
      { name: "M83", weight: 0.54 },
    ],
  },
  {
    name: "Foo Fighters",
    genres: ["alternative rock", "rock", "post-grunge"],
    discoveryTags: ["driving", "anthemic", "direct"],
    similarArtists: [
      { name: "Queens of the Stone Age", weight: 0.76 },
      { name: "The Smashing Pumpkins", weight: 0.6 },
      { name: "The Killers", weight: 0.48 },
    ],
  },
  {
    name: "Queens of the Stone Age",
    genres: ["rock", "alternative rock", "desert rock"],
    discoveryTags: ["muscular", "dry", "groove"],
    similarArtists: [
      { name: "Foo Fighters", weight: 0.78 },
      { name: "Arctic Monkeys", weight: 0.66 },
      { name: "Nine Inch Nails", weight: 0.46 },
    ],
  },
  {
    name: "Pink Floyd",
    genres: ["progressive rock", "psychedelic", "classic rock"],
    discoveryTags: ["expansive", "meditative", "cinematic"],
    similarArtists: [
      { name: "Led Zeppelin", weight: 0.64 },
      { name: "Tool", weight: 0.68 },
      { name: "Tame Impala", weight: 0.54 },
    ],
  },
  {
    name: "Led Zeppelin",
    genres: ["classic rock", "hard rock", "blues rock"],
    discoveryTags: ["towering", "mythic", "riff-first"],
    similarArtists: [
      { name: "Pink Floyd", weight: 0.58 },
      { name: "Queens of the Stone Age", weight: 0.54 },
      { name: "Metallica", weight: 0.46 },
    ],
  },
  {
    name: "Metallica",
    genres: ["metal", "hard rock", "thrash"],
    discoveryTags: ["precise", "relentless", "arena"],
    similarArtists: [
      { name: "Tool", weight: 0.6 },
      { name: "System of a Down", weight: 0.58 },
      { name: "Deftones", weight: 0.48 },
    ],
  },
  {
    name: "Tool",
    genres: ["metal", "progressive", "alternative"],
    discoveryTags: ["intricate", "hypnotic", "heavy"],
    similarArtists: [
      { name: "Deftones", weight: 0.62 },
      { name: "Nine Inch Nails", weight: 0.54 },
      { name: "Metallica", weight: 0.52 },
      { name: "Pink Floyd", weight: 0.5 },
    ],
  },
  {
    name: "System of a Down",
    genres: ["metal", "alternative", "hard rock"],
    discoveryTags: ["volatile", "political", "hooky"],
    similarArtists: [
      { name: "Deftones", weight: 0.58 },
      { name: "Metallica", weight: 0.52 },
      { name: "Nine Inch Nails", weight: 0.42 },
    ],
  },
  {
    name: "Deftones",
    genres: ["alternative metal", "metal", "shoegaze"],
    discoveryTags: ["lush-heavy", "sensual", "crushing"],
    similarArtists: [
      { name: "Tool", weight: 0.66 },
      { name: "Nine Inch Nails", weight: 0.62 },
      { name: "System of a Down", weight: 0.56 },
      { name: "Slowdive", weight: 0.42 },
    ],
  },
  {
    name: "Nine Inch Nails",
    genres: ["industrial", "alternative", "electronic"],
    discoveryTags: ["abrasive", "mechanical", "dark"],
    similarArtists: [
      { name: "Deftones", weight: 0.62 },
      { name: "Tool", weight: 0.54 },
      { name: "LCD Soundsystem", weight: 0.34 },
    ],
  },
  {
    name: "Taylor Swift",
    genres: ["pop", "singer-songwriter", "country pop"],
    discoveryTags: ["hooky", "narrative", "polished"],
    similarArtists: [
      { name: "Olivia Rodrigo", weight: 0.82 },
      { name: "Sabrina Carpenter", weight: 0.74 },
      { name: "Lorde", weight: 0.62 },
      { name: "Kacey Musgraves", weight: 0.52 },
    ],
  },
  {
    name: "Olivia Rodrigo",
    genres: ["pop", "alternative", "pop rock"],
    discoveryTags: ["cathartic", "sharpened", "youthful"],
    similarArtists: [
      { name: "Lorde", weight: 0.78 },
      { name: "Taylor Swift", weight: 0.74 },
      { name: "Billie Eilish", weight: 0.66 },
      { name: "Sabrina Carpenter", weight: 0.66 },
    ],
  },
  {
    name: "Lorde",
    genres: ["pop", "alternative", "electropop"],
    discoveryTags: ["minimal", "cool", "architectural"],
    similarArtists: [
      { name: "Billie Eilish", weight: 0.78 },
      { name: "Olivia Rodrigo", weight: 0.74 },
      { name: "Charli XCX", weight: 0.54 },
    ],
  },
  {
    name: "Billie Eilish",
    genres: ["pop", "alternative", "electronic"],
    discoveryTags: ["whispered", "tense", "minimal"],
    similarArtists: [
      { name: "ROSALIA", weight: 0.78 },
      { name: "Tirzah", weight: 0.74 },
      { name: "Lorde", weight: 0.64 },
      { name: "Frank Ocean", weight: 0.46 },
    ],
  },
  {
    name: "Dua Lipa",
    genres: ["pop", "dance", "disco"],
    discoveryTags: ["glossy", "club-ready", "confident"],
    similarArtists: [
      { name: "Charli XCX", weight: 0.7 },
      { name: "Sabrina Carpenter", weight: 0.62 },
      { name: "Chappell Roan", weight: 0.68 },
      { name: "Ariana Grande", weight: 0.54 },
    ],
  },
  {
    name: "Charli XCX",
    genres: ["pop", "electronic", "hyperpop"],
    discoveryTags: ["maximal", "clubby", "futurist"],
    similarArtists: [
      { name: "Chappell Roan", weight: 0.68 },
      { name: "Dua Lipa", weight: 0.62 },
      { name: "Lorde", weight: 0.48 },
      { name: "Carly Rae Jepsen", weight: 0.58 },
    ],
  },
  {
    name: "Chappell Roan",
    genres: ["pop", "synth-pop", "dance"],
    discoveryTags: ["theatrical", "camp", "big-chorus"],
    similarArtists: [
      { name: "Charli XCX", weight: 0.68 },
      { name: "Dua Lipa", weight: 0.64 },
      { name: "Sabrina Carpenter", weight: 0.58 },
    ],
  },
  {
    name: "Sabrina Carpenter",
    genres: ["pop", "dance", "singer-songwriter"],
    discoveryTags: ["sparkly", "light-footed", "wry"],
    similarArtists: [
      { name: "Taylor Swift", weight: 0.66 },
      { name: "Dua Lipa", weight: 0.62 },
      { name: "Chappell Roan", weight: 0.58 },
      { name: "Olivia Rodrigo", weight: 0.56 },
    ],
  },
  {
    name: "Harry Styles",
    genres: ["pop", "rock", "singer-songwriter"],
    discoveryTags: ["easygoing", "retro", "radio-ready"],
    similarArtists: [
      { name: "Taylor Swift", weight: 0.42 },
      { name: "Lorde", weight: 0.38 },
      { name: "Vampire Weekend", weight: 0.34 },
    ],
  },
  {
    name: "Ariana Grande",
    genres: ["pop", "r&b", "dance"],
    discoveryTags: ["melismatic", "sleek", "airy"],
    similarArtists: [
      { name: "SZA", weight: 0.56 },
      { name: "Dua Lipa", weight: 0.52 },
      { name: "Sabrina Carpenter", weight: 0.42 },
    ],
  },
  {
    name: "SZA",
    genres: ["r&b", "soul", "pop"],
    discoveryTags: ["liquid", "confessional", "left-center"],
    similarArtists: [
      { name: "Frank Ocean", weight: 0.76 },
      { name: "Billie Eilish", weight: 0.58 },
      { name: "Ariana Grande", weight: 0.48 },
    ],
  },
  {
    name: "Frank Ocean",
    genres: ["r&b", "alternative", "soul"],
    discoveryTags: ["drifting", "elliptical", "luxury"],
    similarArtists: [
      { name: "Sampha", weight: 0.84 },
      { name: "James Blake", weight: 0.8 },
      { name: "Orion Sun", weight: 0.74 },
      { name: "SZA", weight: 0.52 },
    ],
  },
  {
    name: "Kendrick Lamar",
    genres: ["hip-hop/rap", "conscious", "alternative"],
    discoveryTags: ["precision", "narrative", "restless"],
    similarArtists: [
      { name: "J. Cole", weight: 0.72 },
      { name: "Tyler, The Creator", weight: 0.66 },
      { name: "MF DOOM", weight: 0.56 },
      { name: "SZA", weight: 0.34 },
    ],
  },
  {
    name: "J. Cole",
    genres: ["hip-hop/rap", "conscious", "soulful"],
    discoveryTags: ["focused", "grounded", "clean-lined"],
    similarArtists: [
      { name: "Kendrick Lamar", weight: 0.72 },
      { name: "Tyler, The Creator", weight: 0.4 },
      { name: "SZA", weight: 0.28 },
    ],
  },
  {
    name: "Tyler, The Creator",
    genres: ["hip-hop/rap", "alternative", "neo-soul"],
    discoveryTags: ["colorful", "inventive", "shape-shifting"],
    similarArtists: [
      { name: "Kendrick Lamar", weight: 0.64 },
      { name: "Frank Ocean", weight: 0.66 },
      { name: "MF DOOM", weight: 0.52 },
      { name: "Steve Lacy", weight: 0.42 },
    ],
  },
  {
    name: "MF DOOM",
    genres: ["hip-hop/rap", "alternative", "underground"],
    discoveryTags: ["dense", "cryptic", "crate-dug"],
    similarArtists: [
      { name: "Kendrick Lamar", weight: 0.54 },
      { name: "Tyler, The Creator", weight: 0.52 },
      { name: "Freddie Gibbs", weight: 0.48 },
    ],
  },
  {
    name: "Freddie Gibbs",
    genres: ["hip-hop/rap", "gangsta rap", "underground"],
    discoveryTags: ["nimble", "hard-edged", "gritty"],
    similarArtists: [
      { name: "MF DOOM", weight: 0.48 },
      { name: "Kendrick Lamar", weight: 0.42 },
      { name: "Pusha T", weight: 0.58 },
    ],
  },
  {
    name: "Kanye West",
    genres: ["hip-hop/rap", "alternative", "pop"],
    discoveryTags: ["grandiose", "restless", "shape-shifting"],
    similarArtists: [
      { name: "Travis Scott", weight: 0.72 },
      { name: "Tyler, The Creator", weight: 0.54 },
      { name: "Frank Ocean", weight: 0.42 },
    ],
  },
  {
    name: "Travis Scott",
    genres: ["hip-hop/rap", "trap", "psychedelic"],
    discoveryTags: ["blown-out", "hypnotic", "festival-sized"],
    similarArtists: [
      { name: "Kanye West", weight: 0.72 },
      { name: "Future", weight: 0.56 },
      { name: "21 Savage", weight: 0.52 },
    ],
  },
  {
    name: "21 Savage",
    genres: ["hip-hop/rap", "trap", "southern"],
    discoveryTags: ["minimal", "icy", "deadpan"],
    similarArtists: [
      { name: "Travis Scott", weight: 0.52 },
      { name: "Future", weight: 0.58 },
      { name: "Metro Boomin", weight: 0.62 },
    ],
  },
  {
    name: "Future",
    genres: ["hip-hop/rap", "trap", "melodic"],
    discoveryTags: ["bleary", "autotuned", "club-dark"],
    similarArtists: [
      { name: "Travis Scott", weight: 0.56 },
      { name: "21 Savage", weight: 0.56 },
      { name: "Metro Boomin", weight: 0.64 },
    ],
  },
  {
    name: "Metro Boomin",
    genres: ["hip-hop/rap", "trap", "producer"],
    discoveryTags: ["cinematic", "low-end", "moody"],
    similarArtists: [
      { name: "21 Savage", weight: 0.62 },
      { name: "Future", weight: 0.64 },
      { name: "Travis Scott", weight: 0.52 },
    ],
  },
  {
    name: "Daft Punk",
    genres: ["electronic", "house", "dance"],
    discoveryTags: ["sleek", "mechanical", "euphoric"],
    similarArtists: [
      { name: "Justice", weight: 0.82 },
      { name: "Fred again..", weight: 0.58 },
      { name: "Jamie xx", weight: 0.48 },
      { name: "Disclosure", weight: 0.52 },
    ],
  },
  {
    name: "Justice",
    genres: ["electronic", "dance", "french house"],
    discoveryTags: ["distorted", "arena-club", "neon"],
    similarArtists: [
      { name: "Daft Punk", weight: 0.82 },
      { name: "Fred again..", weight: 0.48 },
      { name: "Four Tet", weight: 0.32 },
    ],
  },
  {
    name: "Fred again..",
    genres: ["electronic", "house", "dance"],
    discoveryTags: ["human", "vocal-sampled", "uplifting"],
    similarArtists: [
      { name: "Four Tet", weight: 0.72 },
      { name: "Jamie xx", weight: 0.68 },
      { name: "Bonobo", weight: 0.54 },
      { name: "Daft Punk", weight: 0.46 },
    ],
  },
  {
    name: "Jamie xx",
    genres: ["electronic", "uk garage", "dance"],
    discoveryTags: ["nimble", "percussive", "glowing"],
    similarArtists: [
      { name: "Four Tet", weight: 0.78 },
      { name: "Fred again..", weight: 0.7 },
      { name: "Bonobo", weight: 0.52 },
      { name: "LCD Soundsystem", weight: 0.48 },
    ],
  },
  {
    name: "Four Tet",
    genres: ["electronic", "house", "experimental"],
    discoveryTags: ["organic", "curious", "knotty"],
    similarArtists: [
      { name: "Jamie xx", weight: 0.78 },
      { name: "Bonobo", weight: 0.66 },
      { name: "Fred again..", weight: 0.72 },
      { name: "Aphex Twin", weight: 0.42 },
    ],
  },
  {
    name: "Bonobo",
    genres: ["electronic", "downtempo", "trip-hop"],
    discoveryTags: ["warm", "traveling", "patient"],
    similarArtists: [
      { name: "Four Tet", weight: 0.64 },
      { name: "Jamie xx", weight: 0.54 },
      { name: "Massive Attack", weight: 0.58 },
      { name: "Portishead", weight: 0.5 },
    ],
  },
  {
    name: "Flume",
    genres: ["electronic", "future bass", "pop"],
    discoveryTags: ["fractured", "sparkling", "maximal"],
    similarArtists: [
      { name: "Porter Robinson", weight: 0.72 },
      { name: "ODESZA", weight: 0.62 },
      { name: "Fred again..", weight: 0.42 },
    ],
  },
  {
    name: "ODESZA",
    genres: ["electronic", "indie electronic", "downtempo"],
    discoveryTags: ["cinematic", "sunset", "wide"],
    similarArtists: [
      { name: "Flume", weight: 0.62 },
      { name: "Porter Robinson", weight: 0.66 },
      { name: "Bonobo", weight: 0.58 },
    ],
  },
  {
    name: "Porter Robinson",
    genres: ["electronic", "synth-pop", "indie electronic"],
    discoveryTags: ["yearning", "melodic", "digital"],
    similarArtists: [
      { name: "Flume", weight: 0.72 },
      { name: "ODESZA", weight: 0.66 },
      { name: "M83", weight: 0.42 },
    ],
  },
  {
    name: "Aphex Twin",
    genres: ["electronic", "ambient", "experimental"],
    discoveryTags: ["abstract", "restless", "alien"],
    similarArtists: [
      { name: "Four Tet", weight: 0.44 },
      { name: "Bonobo", weight: 0.28 },
      { name: "Radiohead", weight: 0.36 },
    ],
  },
  {
    name: "Miles Davis",
    genres: ["jazz", "fusion", "modal"],
    discoveryTags: ["cool", "searching", "open-ended"],
    similarArtists: [
      { name: "John Coltrane", weight: 0.8 },
      { name: "Kamasi Washington", weight: 0.52 },
      { name: "Dave Brubeck", weight: 0.42 },
    ],
  },
  {
    name: "John Coltrane",
    genres: ["jazz", "modal", "spiritual"],
    discoveryTags: ["urgent", "probing", "transcendent"],
    similarArtists: [
      { name: "Miles Davis", weight: 0.8 },
      { name: "Kamasi Washington", weight: 0.58 },
      { name: "Dave Brubeck", weight: 0.34 },
    ],
  },
  {
    name: "Kamasi Washington",
    genres: ["jazz", "spiritual", "fusion"],
    discoveryTags: ["expansive", "cosmic", "modern"],
    similarArtists: [
      { name: "John Coltrane", weight: 0.58 },
      { name: "Miles Davis", weight: 0.52 },
      { name: "Kendrick Lamar", weight: 0.3 },
    ],
  },
  {
    name: "Dave Brubeck",
    genres: ["jazz", "cool jazz", "classic"],
    discoveryTags: ["swinging", "clean", "architectural"],
    similarArtists: [
      { name: "Miles Davis", weight: 0.42 },
      { name: "John Coltrane", weight: 0.34 },
      { name: "Ella Fitzgerald", weight: 0.28 },
    ],
  },
  {
    name: "Ella Fitzgerald",
    genres: ["jazz", "vocal jazz", "classic"],
    discoveryTags: ["effortless", "radiant", "swinging"],
    similarArtists: [
      { name: "Dave Brubeck", weight: 0.28 },
      { name: "Miles Davis", weight: 0.2 },
      { name: "Nina Simone", weight: 0.54 },
    ],
  },
  {
    name: "Nina Simone",
    genres: ["jazz", "soul", "vocal"],
    discoveryTags: ["commanding", "raw", "timeless"],
    similarArtists: [
      { name: "Ella Fitzgerald", weight: 0.52 },
      { name: "Billie Holiday", weight: 0.62 },
      { name: "Aretha Franklin", weight: 0.5 },
    ],
  },
  {
    name: "Dolly Parton",
    genres: ["country", "country pop", "folk"],
    discoveryTags: ["storytelling", "bright", "iconic"],
    similarArtists: [
      { name: "Kacey Musgraves", weight: 0.64 },
      { name: "Johnny Cash", weight: 0.52 },
      { name: "Zach Bryan", weight: 0.34 },
    ],
  },
  {
    name: "Kacey Musgraves",
    genres: ["country", "country pop", "singer-songwriter"],
    discoveryTags: ["soft-focus", "wry", "lush"],
    similarArtists: [
      { name: "Dolly Parton", weight: 0.62 },
      { name: "Taylor Swift", weight: 0.54 },
      { name: "Zach Bryan", weight: 0.42 },
    ],
  },
  {
    name: "Johnny Cash",
    genres: ["country", "folk", "americana"],
    discoveryTags: ["stark", "weathered", "mythic"],
    similarArtists: [
      { name: "Chris Stapleton", weight: 0.56 },
      { name: "Dolly Parton", weight: 0.48 },
      { name: "Neil Young", weight: 0.42 },
    ],
  },
  {
    name: "Zach Bryan",
    genres: ["country", "folk", "americana"],
    discoveryTags: ["plainspoken", "earnest", "windswept"],
    similarArtists: [
      { name: "Chris Stapleton", weight: 0.64 },
      { name: "Kacey Musgraves", weight: 0.42 },
      { name: "Bon Iver", weight: 0.28 },
    ],
  },
  {
    name: "Chris Stapleton",
    genres: ["country", "americana", "southern rock"],
    discoveryTags: ["gravelly", "soulful", "big-room"],
    similarArtists: [
      { name: "Zach Bryan", weight: 0.64 },
      { name: "Johnny Cash", weight: 0.52 },
      { name: "Neil Young", weight: 0.34 },
    ],
  },
  {
    name: "Neil Young",
    genres: ["folk rock", "country rock", "singer-songwriter"],
    discoveryTags: ["weathered", "restless", "earthy"],
    similarArtists: [
      { name: "Johnny Cash", weight: 0.4 },
      { name: "Chris Stapleton", weight: 0.3 },
      { name: "Bon Iver", weight: 0.26 },
    ],
  },
  {
    name: "Big Thief",
    genres: ["indie rock", "indie folk", "alternative"],
    discoveryTags: ["earthy", "sprawling", "vivid"],
    discoveryWeight: 1.5,
    similarArtists: [
      { name: "Adrianne Lenker", weight: 0.94 },
      { name: "Wednesday", weight: 0.84 },
      { name: "Alvvays", weight: 0.72 },
      { name: "Phoebe Bridgers", weight: 0.62 },
    ],
  },
  {
    name: "Adrianne Lenker",
    genres: ["indie folk", "singer-songwriter", "alternative"],
    discoveryTags: ["close-mic", "raw", "wandering"],
    discoveryWeight: 1.7,
    similarArtists: [
      { name: "Big Thief", weight: 0.94 },
      { name: "Annahstasia", weight: 0.78 },
      { name: "Jessica Pratt", weight: 0.72 },
      { name: "Bon Iver", weight: 0.62 },
    ],
  },
  {
    name: "Wednesday",
    genres: ["indie rock", "alt-country", "shoegaze"],
    discoveryTags: ["ragged", "wry", "fuzzy"],
    discoveryWeight: 1.62,
    similarArtists: [
      { name: "Big Thief", weight: 0.84 },
      { name: "Alvvays", weight: 0.72 },
      { name: "Faye Webster", weight: 0.62 },
      { name: "Phoebe Bridgers", weight: 0.58 },
    ],
  },
  {
    name: "Alvvays",
    genres: ["indie pop", "indie rock", "dream pop"],
    discoveryTags: ["jangly", "bright", "wistful"],
    discoveryWeight: 1.5,
    similarArtists: [
      { name: "Wednesday", weight: 0.72 },
      { name: "Big Thief", weight: 0.7 },
      { name: "The Japanese House", weight: 0.64 },
      { name: "Beach House", weight: 0.54 },
    ],
  },
  {
    name: "Faye Webster",
    genres: ["indie folk", "alt-country", "indie pop"],
    discoveryTags: ["dry", "tender", "unhurried"],
    discoveryWeight: 1.58,
    similarArtists: [
      { name: "Wednesday", weight: 0.62 },
      { name: "Big Thief", weight: 0.56 },
      { name: "Jessica Pratt", weight: 0.54 },
      { name: "Olivia Dean", weight: 0.48 },
    ],
  },
  {
    name: "The Japanese House",
    genres: ["indie pop", "dream pop", "electronic"],
    discoveryTags: ["glossy", "soft-focus", "restless"],
    discoveryWeight: 1.45,
    similarArtists: [
      { name: "Alvvays", weight: 0.64 },
      { name: "James Blake", weight: 0.5 },
      { name: "Lorde", weight: 0.46 },
      { name: "Beach House", weight: 0.42 },
    ],
  },
  {
    name: "Lola Young",
    genres: ["soul", "alternative", "singer-songwriter"],
    discoveryTags: ["raspy", "sharp", "modern-soul"],
    discoveryWeight: 1.55,
    similarArtists: [
      { name: "Olivia Dean", weight: 0.74 },
      { name: "Annahstasia", weight: 0.68 },
      { name: "Leon Bridges", weight: 0.56 },
      { name: "Cleo Sol", weight: 0.5 },
    ],
  },
  {
    name: "Olivia Dean",
    genres: ["soul", "pop", "singer-songwriter"],
    discoveryTags: ["warm", "clear-eyed", "silky"],
    discoveryWeight: 1.42,
    similarArtists: [
      { name: "Lola Young", weight: 0.74 },
      { name: "Leon Bridges", weight: 0.64 },
      { name: "Cleo Sol", weight: 0.58 },
      { name: "Annahstasia", weight: 0.44 },
    ],
  },
  {
    name: "Annahstasia",
    genres: ["folk", "soul", "singer-songwriter"],
    discoveryTags: ["stately", "earthbound", "smoky"],
    discoveryWeight: 1.75,
    similarArtists: [
      { name: "Adrianne Lenker", weight: 0.78 },
      { name: "Lola Young", weight: 0.68 },
      { name: "Jessica Pratt", weight: 0.64 },
      { name: "Leon Bridges", weight: 0.46 },
    ],
  },
  {
    name: "Jessica Pratt",
    genres: ["folk", "baroque pop", "singer-songwriter"],
    discoveryTags: ["hushed", "vintage", "elliptical"],
    discoveryWeight: 1.68,
    similarArtists: [
      { name: "Adrianne Lenker", weight: 0.72 },
      { name: "Faye Webster", weight: 0.54 },
      { name: "Annahstasia", weight: 0.64 },
      { name: "Sufjan Stevens", weight: 0.38 },
    ],
  },
  {
    name: "James Blake",
    genres: ["electronic", "alternative", "r&b"],
    discoveryTags: ["fractured", "submerged", "weightless"],
    discoveryWeight: 1.48,
    similarArtists: [
      { name: "Sampha", weight: 0.88 },
      { name: "Frank Ocean", weight: 0.8 },
      { name: "Tirzah", weight: 0.76 },
      { name: "Bon Iver", weight: 0.7 },
    ],
  },
  {
    name: "Sampha",
    genres: ["r&b", "electronic", "soul"],
    discoveryTags: ["aching", "liquid", "percussive"],
    discoveryWeight: 1.62,
    similarArtists: [
      { name: "James Blake", weight: 0.88 },
      { name: "Frank Ocean", weight: 0.84 },
      { name: "Orion Sun", weight: 0.66 },
      { name: "Little Dragon", weight: 0.6 },
    ],
  },
  {
    name: "Orion Sun",
    genres: ["r&b", "alternative", "soul"],
    discoveryTags: ["drifty", "sun-faded", "intimate"],
    discoveryWeight: 1.66,
    similarArtists: [
      { name: "Sampha", weight: 0.66 },
      { name: "Cleo Sol", weight: 0.62 },
      { name: "Little Dragon", weight: 0.58 },
      { name: "Frank Ocean", weight: 0.54 },
    ],
  },
  {
    name: "Little Dragon",
    genres: ["electronic", "r&b", "indie pop"],
    discoveryTags: ["sleek", "neon", "supple"],
    discoveryWeight: 1.46,
    similarArtists: [
      { name: "KAYTRANADA", weight: 0.76 },
      { name: "Sampha", weight: 0.6 },
      { name: "Orion Sun", weight: 0.58 },
      { name: "SAULT", weight: 0.54 },
    ],
  },
  {
    name: "KAYTRANADA",
    genres: ["electronic", "house", "r&b"],
    discoveryTags: ["rubbery", "club-lit", "warm-bass"],
    discoveryWeight: 1.52,
    similarArtists: [
      { name: "Little Dragon", weight: 0.76 },
      { name: "SAULT", weight: 0.56 },
      { name: "Floating Points", weight: 0.46 },
      { name: "Sampha", weight: 0.42 },
    ],
  },
  {
    name: "Tirzah",
    genres: ["electronic", "alternative", "r&b"],
    discoveryTags: ["minimal", "murky", "physical"],
    discoveryWeight: 1.76,
    similarArtists: [
      { name: "James Blake", weight: 0.76 },
      { name: "Erika de Casier", weight: 0.72 },
      { name: "Billie Eilish", weight: 0.68 },
      { name: "ROSALIA", weight: 0.58 },
    ],
  },
  {
    name: "Erika de Casier",
    genres: ["r&b", "electronic", "pop"],
    discoveryTags: ["cool-touch", "sleek", "late-night"],
    discoveryWeight: 1.72,
    similarArtists: [
      { name: "Tirzah", weight: 0.72 },
      { name: "ROSALIA", weight: 0.58 },
      { name: "Charli XCX", weight: 0.44 },
      { name: "Little Dragon", weight: 0.38 },
    ],
  },
  {
    name: "Cleo Sol",
    genres: ["soul", "r&b", "alternative"],
    discoveryTags: ["glowing", "devotional", "soft-edged"],
    discoveryWeight: 1.58,
    similarArtists: [
      { name: "SAULT", weight: 0.84 },
      { name: "Orion Sun", weight: 0.62 },
      { name: "Olivia Dean", weight: 0.58 },
      { name: "Leon Bridges", weight: 0.5 },
    ],
  },
  {
    name: "SAULT",
    genres: ["soul", "r&b", "alternative"],
    discoveryTags: ["mysterious", "percussive", "collective"],
    discoveryWeight: 1.64,
    similarArtists: [
      { name: "Cleo Sol", weight: 0.84 },
      { name: "Little Dragon", weight: 0.54 },
      { name: "KAYTRANADA", weight: 0.56 },
      { name: "Leon Bridges", weight: 0.42 },
    ],
  },
  {
    name: "Leon Bridges",
    genres: ["soul", "r&b", "americana"],
    discoveryTags: ["classic", "buttered", "easy-swinging"],
    discoveryWeight: 1.36,
    similarArtists: [
      { name: "Cleo Sol", weight: 0.5 },
      { name: "Olivia Dean", weight: 0.64 },
      { name: "Lola Young", weight: 0.56 },
      { name: "Annahstasia", weight: 0.46 },
    ],
  },
  {
    name: "Little Simz",
    genres: ["hip-hop/rap", "alternative", "soulful"],
    discoveryTags: ["precise", "regal", "expansive"],
    discoveryWeight: 1.66,
    similarArtists: [
      { name: "McKinley Dixon", weight: 0.76 },
      { name: "MIKE", weight: 0.62 },
      { name: "Kendrick Lamar", weight: 0.56 },
      { name: "Yussef Dayes", weight: 0.38 },
    ],
  },
  {
    name: "MIKE",
    genres: ["hip-hop/rap", "underground", "alternative"],
    discoveryTags: ["hazy", "interior", "loose"],
    discoveryWeight: 1.82,
    similarArtists: [
      { name: "Navy Blue", weight: 0.88 },
      { name: "McKinley Dixon", weight: 0.58 },
      { name: "Earl Sweatshirt", weight: 0.54 },
      { name: "Little Simz", weight: 0.42 },
    ],
  },
  {
    name: "Navy Blue",
    genres: ["hip-hop/rap", "underground", "soulful"],
    discoveryTags: ["hushed", "reflective", "dusty"],
    discoveryWeight: 1.86,
    similarArtists: [
      { name: "MIKE", weight: 0.88 },
      { name: "McKinley Dixon", weight: 0.54 },
      { name: "Earl Sweatshirt", weight: 0.52 },
      { name: "Little Simz", weight: 0.34 },
    ],
  },
  {
    name: "McKinley Dixon",
    genres: ["hip-hop/rap", "alternative", "jazz rap"],
    discoveryTags: ["cinematic", "bookish", "restless"],
    discoveryWeight: 1.78,
    similarArtists: [
      { name: "Little Simz", weight: 0.76 },
      { name: "MIKE", weight: 0.58 },
      { name: "Navy Blue", weight: 0.54 },
      { name: "Kendrick Lamar", weight: 0.38 },
    ],
  },
  {
    name: "Yussef Dayes",
    genres: ["jazz", "fusion", "electronic"],
    discoveryTags: ["nimble", "liquid", "percussive"],
    discoveryWeight: 1.62,
    similarArtists: [
      { name: "Nala Sinephro", weight: 0.72 },
      { name: "Floating Points", weight: 0.68 },
      { name: "Kamasi Washington", weight: 0.46 },
      { name: "Thundercat", weight: 0.44 },
    ],
  },
  {
    name: "Nala Sinephro",
    genres: ["jazz", "ambient", "electronic"],
    discoveryTags: ["cosmic", "hushed", "luminous"],
    discoveryWeight: 1.88,
    similarArtists: [
      { name: "Floating Points", weight: 0.76 },
      { name: "Yussef Dayes", weight: 0.72 },
      { name: "Kamasi Washington", weight: 0.46 },
      { name: "Bonobo", weight: 0.4 },
    ],
  },
  {
    name: "Floating Points",
    genres: ["electronic", "jazz", "house"],
    discoveryTags: ["euphoric", "detailed", "curious"],
    discoveryWeight: 1.58,
    similarArtists: [
      { name: "Nala Sinephro", weight: 0.76 },
      { name: "Yussef Dayes", weight: 0.68 },
      { name: "Four Tet", weight: 0.62 },
      { name: "Bonobo", weight: 0.56 },
    ],
  },
  {
    name: "ROSALIA",
    genres: ["pop", "alternative", "electronic"],
    discoveryTags: ["bold", "percussive", "shape-shifting"],
    discoveryWeight: 1.44,
    similarArtists: [
      { name: "Tirzah", weight: 0.58 },
      { name: "Erika de Casier", weight: 0.58 },
      { name: "Billie Eilish", weight: 0.68 },
      { name: "FKA Twigs", weight: 0.5 },
    ],
  },
  {
    name: "Nourished by Time",
    genres: ["alternative", "r&b", "indie pop"],
    discoveryTags: ["smeared", "hooky", "left-field"],
    discoveryWeight: 1.82,
    similarArtists: [
      { name: "Blood Orange", weight: 0.62 },
      { name: "Erika de Casier", weight: 0.54 },
      { name: "Orion Sun", weight: 0.48 },
      { name: "SAULT", weight: 0.4 },
    ],
  },
  {
    name: "Mk.gee",
    genres: ["alternative", "indie rock", "r&b"],
    discoveryTags: ["warped", "slinky", "guitar-blurred"],
    discoveryWeight: 1.84,
    similarArtists: [
      { name: "James Blake", weight: 0.72 },
      { name: "Nilufer Yanya", weight: 0.68 },
      { name: "Blood Orange", weight: 0.62 },
      { name: "Faye Webster", weight: 0.48 },
    ],
  },
  {
    name: "Magdalena Bay",
    genres: ["indie pop", "electronic", "synth-pop"],
    discoveryTags: ["maximal", "glossy", "playful"],
    discoveryWeight: 1.72,
    similarArtists: [
      { name: "The Marias", weight: 0.66 },
      { name: "Erika de Casier", weight: 0.58 },
      { name: "Men I Trust", weight: 0.54 },
      { name: "M83", weight: 0.48 },
    ],
  },
  {
    name: "Nilufer Yanya",
    genres: ["alternative", "indie rock", "art rock"],
    discoveryTags: ["oblique", "nimble", "guitar-skewed"],
    discoveryWeight: 1.8,
    similarArtists: [
      { name: "Wednesday", weight: 0.62 },
      { name: "Adrianne Lenker", weight: 0.58 },
      { name: "Mk.gee", weight: 0.68 },
      { name: "The Japanese House", weight: 0.5 },
    ],
  },
  {
    name: "Amaarae",
    genres: ["pop", "r&b", "alternative"],
    discoveryTags: ["airy", "mercurial", "club-curious"],
    discoveryWeight: 1.78,
    similarArtists: [
      { name: "Ravyn Lenae", weight: 0.72 },
      { name: "ROSALIA", weight: 0.62 },
      { name: "Erika de Casier", weight: 0.58 },
      { name: "KAYTRANADA", weight: 0.44 },
    ],
  },
  {
    name: "Jamila Woods",
    genres: ["r&b", "soul", "alternative"],
    discoveryTags: ["poetic", "warm", "grounded"],
    discoveryWeight: 1.74,
    similarArtists: [
      { name: "Noname", weight: 0.76 },
      { name: "Cleo Sol", weight: 0.62 },
      { name: "Moses Sumney", weight: 0.54 },
      { name: "Lianne La Havas", weight: 0.52 },
    ],
  },
  {
    name: "Noname",
    genres: ["hip-hop/rap", "soul", "alternative"],
    discoveryTags: ["lithe", "bookish", "jazz-touched"],
    discoveryWeight: 1.76,
    similarArtists: [
      { name: "Jamila Woods", weight: 0.76 },
      { name: "Little Simz", weight: 0.58 },
      { name: "McKinley Dixon", weight: 0.56 },
      { name: "SAULT", weight: 0.4 },
    ],
  },
  {
    name: "Moses Sumney",
    genres: ["alternative", "soul", "art pop"],
    discoveryTags: ["weightless", "dramatic", "shape-shifting"],
    discoveryWeight: 1.78,
    similarArtists: [
      { name: "Jamila Woods", weight: 0.54 },
      { name: "James Blake", weight: 0.58 },
      { name: "Sampha", weight: 0.56 },
      { name: "Nilufer Yanya", weight: 0.42 },
    ],
  },
  {
    name: "Jordan Rakei",
    genres: ["soul", "electronic", "jazz"],
    discoveryTags: ["silky", "elastic", "late-night"],
    discoveryWeight: 1.68,
    similarArtists: [
      { name: "Hiatus Kaiyote", weight: 0.68 },
      { name: "Sampha", weight: 0.58 },
      { name: "Lianne La Havas", weight: 0.52 },
      { name: "Floating Points", weight: 0.46 },
    ],
  },
  {
    name: "Lianne La Havas",
    genres: ["soul", "r&b", "singer-songwriter"],
    discoveryTags: ["nimble", "buttery", "intimate"],
    discoveryWeight: 1.58,
    similarArtists: [
      { name: "Cleo Sol", weight: 0.62 },
      { name: "Jordan Rakei", weight: 0.52 },
      { name: "Leon Bridges", weight: 0.48 },
      { name: "Charlotte Day Wilson", weight: 0.46 },
    ],
  },
  {
    name: "Hiatus Kaiyote",
    genres: ["neo-soul", "jazz", "electronic"],
    discoveryTags: ["intricate", "rubbery", "future-funk"],
    discoveryWeight: 1.74,
    similarArtists: [
      { name: "Jordan Rakei", weight: 0.68 },
      { name: "Little Dragon", weight: 0.58 },
      { name: "BadBadNotGood", weight: 0.52 },
      { name: "Yussef Dayes", weight: 0.48 },
    ],
  },
  {
    name: "BadBadNotGood",
    genres: ["jazz", "hip-hop/rap", "electronic"],
    discoveryTags: ["heady", "grooving", "restless"],
    discoveryWeight: 1.64,
    similarArtists: [
      { name: "Yussef Dayes", weight: 0.62 },
      { name: "Floating Points", weight: 0.54 },
      { name: "Hiatus Kaiyote", weight: 0.52 },
      { name: "Little Simz", weight: 0.34 },
    ],
  },
  {
    name: "Khruangbin",
    genres: ["psychedelic", "soul", "alternative"],
    discoveryTags: ["breezy", "dubby", "transportive"],
    discoveryWeight: 1.56,
    similarArtists: [
      { name: "Leon Bridges", weight: 0.58 },
      { name: "Jungle", weight: 0.56 },
      { name: "Little Dragon", weight: 0.46 },
      { name: "Men I Trust", weight: 0.4 },
    ],
  },
  {
    name: "The Marias",
    genres: ["indie pop", "alternative", "dream pop"],
    discoveryTags: ["silky", "romantic", "night-drive"],
    discoveryWeight: 1.7,
    similarArtists: [
      { name: "Men I Trust", weight: 0.72 },
      { name: "The Japanese House", weight: 0.62 },
      { name: "Faye Webster", weight: 0.48 },
      { name: "Magdalena Bay", weight: 0.66 },
    ],
  },
  {
    name: "Men I Trust",
    genres: ["dream pop", "indie pop", "alternative"],
    discoveryTags: ["cool-headed", "gliding", "soft-focus"],
    discoveryWeight: 1.68,
    similarArtists: [
      { name: "The Marias", weight: 0.72 },
      { name: "Alvvays", weight: 0.54 },
      { name: "Beach House", weight: 0.48 },
      { name: "The Japanese House", weight: 0.46 },
    ],
  },
  {
    name: "Arlo Parks",
    genres: ["indie pop", "alternative", "soul"],
    discoveryTags: ["gentle", "observant", "daylit"],
    discoveryWeight: 1.62,
    similarArtists: [
      { name: "Olivia Dean", weight: 0.58 },
      { name: "Cleo Sol", weight: 0.52 },
      { name: "Ravyn Lenae", weight: 0.5 },
      { name: "Faye Webster", weight: 0.4 },
    ],
  },
  {
    name: "Ravyn Lenae",
    genres: ["r&b", "alternative", "pop"],
    discoveryTags: ["blooming", "airy", "inventive"],
    discoveryWeight: 1.74,
    similarArtists: [
      { name: "Amaarae", weight: 0.72 },
      { name: "Arlo Parks", weight: 0.5 },
      { name: "Orion Sun", weight: 0.52 },
      { name: "KAYTRANADA", weight: 0.44 },
    ],
  },
  {
    name: "Charlotte Day Wilson",
    genres: ["soul", "r&b", "alternative"],
    discoveryTags: ["dusky", "slow-burn", "velvet"],
    discoveryWeight: 1.68,
    similarArtists: [
      { name: "Cleo Sol", weight: 0.58 },
      { name: "Lianne La Havas", weight: 0.46 },
      { name: "Sampha", weight: 0.42 },
      { name: "Ravyn Lenae", weight: 0.4 },
    ],
  },
  {
    name: "Jungle",
    genres: ["soul", "electronic", "dance"],
    discoveryTags: ["sunlit", "groove-heavy", "hook-forward"],
    discoveryWeight: 1.42,
    similarArtists: [
      { name: "Khruangbin", weight: 0.56 },
      { name: "Little Dragon", weight: 0.54 },
      { name: "KAYTRANADA", weight: 0.5 },
      { name: "SAULT", weight: 0.42 },
    ],
  },
  {
    name: "Suki Waterhouse",
    genres: ["indie pop", "alternative", "dream pop"],
    discoveryTags: ["wistful", "glam-haze", "midnight"],
    discoveryWeight: 1.5,
    similarArtists: [
      { name: "The Marias", weight: 0.54 },
      { name: "Men I Trust", weight: 0.5 },
      { name: "Alvvays", weight: 0.42 },
      { name: "The Japanese House", weight: 0.4 },
    ],
  },
  {
    name: "Kelela",
    genres: ["r&b", "electronic", "alternative"],
    discoveryTags: ["sleek", "futurist", "midnight"],
    discoveryWeight: 1.76,
    similarArtists: [
      { name: "Shygirl", weight: 0.72 },
      { name: "Yaeji", weight: 0.58 },
      { name: "James Blake", weight: 0.54 },
      { name: "Amaarae", weight: 0.48 },
    ],
  },
  {
    name: "Shygirl",
    genres: ["electronic", "pop", "alternative"],
    discoveryTags: ["club-lit", "brash", "mutating"],
    discoveryWeight: 1.8,
    similarArtists: [
      { name: "Kelela", weight: 0.72 },
      { name: "Yaeji", weight: 0.64 },
      { name: "ROSALIA", weight: 0.54 },
      { name: "Erika de Casier", weight: 0.46 },
    ],
  },
  {
    name: "Yaeji",
    genres: ["electronic", "house", "pop"],
    discoveryTags: ["misty", "grooving", "understated"],
    discoveryWeight: 1.72,
    similarArtists: [
      { name: "Shygirl", weight: 0.64 },
      { name: "Kelela", weight: 0.58 },
      { name: "KAYTRANADA", weight: 0.52 },
      { name: "Oklou", weight: 0.46 },
    ],
  },
  {
    name: "Oklou",
    genres: ["electronic", "indie pop", "alternative"],
    discoveryTags: ["weightless", "digital", "dream-lit"],
    discoveryWeight: 1.82,
    similarArtists: [
      { name: "Magdalena Bay", weight: 0.54 },
      { name: "Yaeji", weight: 0.46 },
      { name: "Erika de Casier", weight: 0.48 },
      { name: "Eartheater", weight: 0.42 },
    ],
  },
  {
    name: "Eartheater",
    genres: ["alternative", "electronic", "art pop"],
    discoveryTags: ["feral", "ornate", "shape-shifting"],
    discoveryWeight: 1.86,
    similarArtists: [
      { name: "Oklou", weight: 0.42 },
      { name: "Sevdaliza", weight: 0.54 },
      { name: "ROSALIA", weight: 0.48 },
      { name: "Kelela", weight: 0.42 },
    ],
  },
  {
    name: "Sevdaliza",
    genres: ["alternative", "electronic", "r&b"],
    discoveryTags: ["sculptural", "dark", "hypnotic"],
    discoveryWeight: 1.78,
    similarArtists: [
      { name: "Eartheater", weight: 0.54 },
      { name: "Kelela", weight: 0.44 },
      { name: "Shygirl", weight: 0.46 },
      { name: "ROSALIA", weight: 0.42 },
    ],
  },
  {
    name: "Yaya Bey",
    genres: ["r&b", "soul", "hip-hop/rap"],
    discoveryTags: ["earthy", "wry", "warm"],
    discoveryWeight: 1.8,
    similarArtists: [
      { name: "Jamila Woods", weight: 0.64 },
      { name: "Noname", weight: 0.58 },
      { name: "Mereba", weight: 0.54 },
      { name: "Ravyn Lenae", weight: 0.46 },
    ],
  },
  {
    name: "Mereba",
    genres: ["soul", "alternative", "r&b"],
    discoveryTags: ["sun-drenched", "gentle", "grounded"],
    discoveryWeight: 1.68,
    similarArtists: [
      { name: "Yaya Bey", weight: 0.54 },
      { name: "Leon Bridges", weight: 0.5 },
      { name: "Cleo Sol", weight: 0.48 },
      { name: "Arlo Parks", weight: 0.46 },
    ],
  },
  {
    name: "Arooj Aftab",
    genres: ["jazz", "folk", "ambient"],
    discoveryTags: ["luminous", "patient", "nocturnal"],
    discoveryWeight: 1.92,
    similarArtists: [
      { name: "Ichiko Aoba", weight: 0.62 },
      { name: "Nala Sinephro", weight: 0.58 },
      { name: "Floating Points", weight: 0.46 },
      { name: "Yussef Dayes", weight: 0.38 },
    ],
  },
  {
    name: "Ichiko Aoba",
    genres: ["folk", "ambient", "alternative"],
    discoveryTags: ["delicate", "aquatic", "miniature"],
    discoveryWeight: 1.9,
    similarArtists: [
      { name: "Arooj Aftab", weight: 0.62 },
      { name: "Jessica Pratt", weight: 0.56 },
      { name: "Adrianne Lenker", weight: 0.48 },
      { name: "Nala Sinephro", weight: 0.42 },
    ],
  },
  {
    name: "Helado Negro",
    genres: ["alternative", "electronic", "indie pop"],
    discoveryTags: ["humid", "soft-focus", "curious"],
    discoveryWeight: 1.74,
    similarArtists: [
      { name: "Nourished by Time", weight: 0.52 },
      { name: "Blood Orange", weight: 0.54 },
      { name: "Orion Sun", weight: 0.48 },
      { name: "Little Dragon", weight: 0.4 },
    ],
  },
  {
    name: "Kokoroko",
    genres: ["jazz", "afrobeat", "soul"],
    discoveryTags: ["sun-warm", "brassy", "communal"],
    discoveryWeight: 1.76,
    similarArtists: [
      { name: "Yussef Dayes", weight: 0.48 },
      { name: "BadBadNotGood", weight: 0.46 },
      { name: "Nala Sinephro", weight: 0.42 },
      { name: "Jungle", weight: 0.4 },
    ],
  },
  {
    name: "070 Shake",
    genres: ["hip-hop/rap", "alternative", "electronic"],
    discoveryTags: ["cinematic", "brooding", "skyline"],
    discoveryWeight: 1.64,
    similarArtists: [
      { name: "Sevdaliza", weight: 0.54 },
      { name: "James Blake", weight: 0.42 },
      { name: "Kelela", weight: 0.4 },
      { name: "ROSALIA", weight: 0.38 },
    ],
  },
];

const DISCOVERY_WEIGHT_OVERRIDES = Object.freeze({
  // --- Existing indie/alt that got mainstream ---
  "radiohead": 0.68,
  "interpol": 0.5,
  "the national": 0.58,
  "arcade fire": 0.48,
  "tame impala": 0.62,
  "beach house": 0.64,
  "mazzy star": 0.56,
  "phoebe bridgers": 0.56,
  "boygenius": 0.48,
  "bon iver": 0.52,
  "vampire weekend": 0.6,
  "the strokes": 0.58,
  "lorde": 0.62,

  // --- Global pop megastars ---
  "taylor swift": 0.22,
  "sabrina carpenter": 0.22,
  "ed sheeran": 0.25,
  "justin bieber": 0.25,
  "drake": 0.28,
  "the weeknd": 0.30,
  "post malone": 0.30,
  "beyoncé": 0.25,
  "beyonce": 0.25,
  "rihanna": 0.28,
  "adele": 0.28,
  "bruno mars": 0.30,
  "lady gaga": 0.28,
  "bad bunny": 0.28,
  "coldplay": 0.32,
  "harry styles": 0.32,
  "maroon 5": 0.28,
  "sam smith": 0.35,
  "lizzo": 0.35,
  "selena gomez": 0.30,
  "the chainsmokers": 0.28,
  "calvin harris": 0.30,
  "one direction": 0.28,
  "imagine dragons": 0.32,
  "twenty one pilots": 0.34,
  "fall out boy": 0.38,
  "paramore": 0.40,

  // --- Mainstream pop/R&B crossover ---
  "billie eilish": 0.38,
  "olivia rodrigo": 0.40,
  "dua lipa": 0.38,
  "ariana grande": 0.36,
  "sza": 0.58,
  "khalid": 0.46,
  "doja cat": 0.38,
  "h.e.r.": 0.56,
  "daniel caesar": 0.60,
  "jorja smith": 0.60,

  // --- Mainstream hip-hop ---
  "kanye west": 0.32,
  "jay-z": 0.35,
  "eminem": 0.32,
  "kendrick lamar": 0.58,
  "frank ocean": 0.42,
  "tyler, the creator": 0.60,
  "j. cole": 0.46,
  "travis scott": 0.36,
  "nicki minaj": 0.34,
  "cardi b": 0.34,
  "megan thee stallion": 0.36,
  "juice wrld": 0.34,
  "lil uzi vert": 0.36,
  "future": 0.36,
  "21 savage": 0.38,
  "chance the rapper": 0.52,
  "macklemore": 0.36,

  // --- Classic rock / legacy acts everyone knows ---
  "the beatles": 0.32,
  "led zeppelin": 0.35,
  "pink floyd": 0.38,
  "u2": 0.35,
  "nirvana": 0.40,
  "red hot chili peppers": 0.40,
  "foo fighters": 0.40,
  "green day": 0.38,
  "oasis": 0.40,
  "the killers": 0.42,
  "muse": 0.42,
  "pearl jam": 0.46,
  "queens of the stone age": 0.50,
  "gorillaz": 0.46,
  "maneskin": 0.30,

  // --- Mainstream alt/indie that crossed over ---
  "arctic monkeys": 0.42,
  "the 1975": 0.48,
  "florence + the machine": 0.48,
  "florence and the machine": 0.48,
  "alt-j": 0.52,
  "foals": 0.54,
  "glass animals": 0.48,
  "two door cinema club": 0.52,
  "mgmt": 0.52,
  "lcd soundsystem": 0.52,
  "disclosure": 0.52,
});

const RECOMMENDATION_BLOCKLIST = Object.freeze(new Set([
  "taylor swift",
  "sabrina carpenter",
]));

export function normalizeCatalogArtistName(name = "") {
  return name.trim().toLowerCase();
}

export function isBlockedRecommendationArtist(name = "") {
  return RECOMMENDATION_BLOCKLIST.has(normalizeCatalogArtistName(name));
}

function normalizeGenreName(genre = "") {
  return genre.trim().toLowerCase();
}

function resolveDiscoveryWeightForEntry(name = "", explicitWeight) {
  if (typeof explicitWeight === "number") return explicitWeight;
  const artistKey = normalizeCatalogArtistName(name);
  if (!artistKey) return 1;
  if (typeof DISCOVERY_WEIGHT_OVERRIDES[artistKey] === "number") {
    return DISCOVERY_WEIGHT_OVERRIDES[artistKey];
  }
  return 1;
}

export function getArtistDiscoveryWeight(name = "") {
  const artistKey = normalizeCatalogArtistName(name);
  if (!artistKey) return 1;
  const catalogWeight = LOCAL_ARTIST_CATALOG[artistKey]?.discoveryWeight;
  if (typeof catalogWeight === "number") return catalogWeight;
  if (typeof DISCOVERY_WEIGHT_OVERRIDES[artistKey] === "number") {
    return DISCOVERY_WEIGHT_OVERRIDES[artistKey];
  }
  return 1;
}

export const LOCAL_ARTIST_CATALOG = Object.freeze(
  Object.fromEntries(
    ARTIST_GRAPH.map((entry) => [
      normalizeCatalogArtistName(entry.name),
      {
        ...entry,
        discoveryWeight: resolveDiscoveryWeightForEntry(entry.name, entry.discoveryWeight),
        genres: entry.genres.map(normalizeGenreName),
        discoveryTags: [...entry.discoveryTags],
        similarArtists: entry.similarArtists.map((artist) => ({
          name: artist.name,
          weight: typeof artist.weight === "number" ? artist.weight : 1,
        })),
      },
    ]),
  ),
);

const CATALOG_ENTRIES = Object.freeze(Object.values(LOCAL_ARTIST_CATALOG));

export function getArtistCatalogEntry(name) {
  return LOCAL_ARTIST_CATALOG[normalizeCatalogArtistName(name)] || null;
}

export function getSimilarArtists(name, limit = 3) {
  const entry = getArtistCatalogEntry(name);
  if (!entry) return [];
  return [...entry.similarArtists]
    .filter((artist) => !isBlockedRecommendationArtist(artist.name))
    .sort((a, b) => {
      const delta =
        b.weight * getArtistDiscoveryWeight(b.name) - a.weight * getArtistDiscoveryWeight(a.name);
      if (delta !== 0) return delta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getCatalogArtistsForGenres(genres, { limit = 3, exclude = [] } = {}) {
  const queries = genres.map(normalizeGenreName).filter(Boolean);
  if (!queries.length) return [];

  const excluded = new Set(exclude.map(normalizeCatalogArtistName));
  const scored = CATALOG_ENTRIES.map((entry) => {
    let score = 0;
    entry.genres.forEach((genre, genreIndex) => {
      const isPrimary = genreIndex === 0;
      queries.forEach((query) => {
        if (genre === query) score += isPrimary ? 6 : 2;
        else if (genre.includes(query) || query.includes(genre)) score += isPrimary ? 3 : 1;
      });
    });
    score += Math.max(0.2, entry.discoveryWeight || 1) * 0.9;
    return { entry, score };
  })
    .filter(
      ({ entry, score }) =>
        score > 0 &&
        !excluded.has(normalizeCatalogArtistName(entry.name)) &&
        !isBlockedRecommendationArtist(entry.name),
    )
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));

  const seen = new Set();
  return scored
    .filter(({ entry }) => {
      const key = normalizeCatalogArtistName(entry.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function getClusterNeighbors(name, limit = 6) {
  const target = normalizeCatalogArtistName(name);
  if (!target) return [];

  const weights = new Map();
  const direct = getArtistCatalogEntry(name)?.similarArtists || [];

  direct.forEach((artist) => {
    const key = normalizeCatalogArtistName(artist.name);
    weights.set(key, Math.max(weights.get(key) || 0, artist.weight || 1));
  });

  CATALOG_ENTRIES.forEach((entry) => {
    entry.similarArtists.forEach((artist) => {
      if (normalizeCatalogArtistName(artist.name) === target) {
        const key = normalizeCatalogArtistName(entry.name);
        weights.set(key, Math.max(weights.get(key) || 0, (artist.weight || 1) * 0.75));
      }
    });
  });

  return Array.from(weights.entries())
    .filter(([key]) => !isBlockedRecommendationArtist(key))
    .map(([key, weight]) => ({
      name: LOCAL_ARTIST_CATALOG[key]?.name || key,
      weight: weight * getArtistDiscoveryWeight(key),
    }))
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name))
    .slice(0, limit);
}
