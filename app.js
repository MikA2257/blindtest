'use strict';

/* ============================================================
 * Blindtest — extraits Apple Music via l'API iTunes Search
 * ============================================================ */

const THEMES = [
  { id: 'now', label: '🔥 Hits du moment', artists: ['Aya Nakamura', 'Tiakola', 'Gims', 'Ninho', 'Jul', 'SDM', 'Dua Lipa', 'Taylor Swift', 'The Weeknd', 'Billie Eilish', 'Sabrina Carpenter', 'Theodora', 'Gazo', 'Chappell Roan', 'Bad Bunny', 'Werenoi'] },
  { id: '80s', label: '📼 Années 80', artists: ['Michael Jackson', 'Madonna', 'Queen', 'a-ha', 'Cyndi Lauper', 'Daniel Balavoine', 'Indochine', 'Jean-Jacques Goldman', 'Téléphone', 'Desireless', 'Wham!', 'Toto', 'Eurythmics', 'Rick Astley', 'Kim Wilde', 'Dire Straits', 'Étienne Daho', 'Whitney Houston'] },
  { id: '90s', label: '💿 Années 90', artists: ['Spice Girls', 'Backstreet Boys', 'Nirvana', 'Oasis', 'Britney Spears', 'Mylène Farmer', 'Ace of Base', 'Haddaway', 'Céline Dion', 'MC Solaar', 'IAM', 'Alliage', 'Larusso', 'TLC', 'Shania Twain', 'Eagle-Eye Cherry', 'Lou Bega', 'Las Ketchup'] },
  { id: '00s', label: '📱 Années 2000', artists: ['Eminem', 'Beyoncé', 'Rihanna', 'Black Eyed Peas', 'Lady Gaga', 'Shakira', 'Amy Winehouse', 'Coldplay', 'Linkin Park', 'Diam\'s', 'Corneille', 'Christophe Maé', 'Kylie Minogue', 'Outkast', 'Usher', 'Nelly Furtado', 'Sean Paul', 'Tragédie'] },
  { id: '10s', label: '🎧 Années 2010', artists: ['Stromae', 'Adele', 'Bruno Mars', 'Ed Sheeran', 'Pharrell Williams', 'Avicii', 'David Guetta', 'Katy Perry', 'Louane', 'Kendji Girac', 'Indila', 'Major Lazer', 'Justin Bieber', 'Calvin Harris', 'Angèle', 'Black M', 'Imagine Dragons'] },
  { id: 'rapfr', label: '🎤 Rap FR', artists: ['Booba', 'Ninho', 'PNL', 'Jul', 'Nekfeu', 'Orelsan', 'SCH', 'Damso', 'Niska', 'MHD', 'Soprano', 'IAM', 'Suprême NTM', 'Gazo', 'Lomepal', 'Bigflo & Oli', 'Vald', 'Sexion d\'Assaut'] },
  { id: 'varfr', label: '🇫🇷 Variété française', artists: ['Johnny Hallyday', 'Michel Sardou', 'Francis Cabrel', 'Renaud', 'Claude François', 'Joe Dassin', 'Michel Polnareff', 'France Gall', 'Michel Berger', 'Dalida', 'Patrick Bruel', 'Zazie', 'Calogero', 'Vianney', 'Julien Doré', 'Charles Aznavour', 'Jacques Dutronc', 'Céline Dion'] },
  { id: 'pop', label: '✨ Pop internationale', artists: ['Taylor Swift', 'Dua Lipa', 'The Weeknd', 'Harry Styles', 'Billie Eilish', 'Ariana Grande', 'Ed Sheeran', 'Bruno Mars', 'Lady Gaga', 'Rihanna', 'Katy Perry', 'Miley Cyrus', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Justin Bieber', 'Adele'] },
  { id: 'rock', label: '🎸 Rock', artists: ['Queen', 'AC/DC', 'Nirvana', 'Guns N\' Roses', 'The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Red Hot Chili Peppers', 'Foo Fighters', 'Muse', 'Arctic Monkeys', 'The White Stripes', 'Bon Jovi', 'Metallica', 'U2', 'The Killers', 'Green Day', 'Noir Désir'] },
  { id: 'electro', label: '🪩 Électro & dance', artists: ['Daft Punk', 'David Guetta', 'Avicii', 'Calvin Harris', 'Bob Sinclar', 'Martin Solveig', 'Swedish House Mafia', 'Kygo', 'The Chainsmokers', 'Justice', 'Modjo', 'Eiffel 65', 'Benny Benassi', 'Moby', 'Gala', 'Cassius'] },
  { id: 'disney', label: '🏰 Disney', titleOnly: true, albums: ['Le Roi Lion', 'La Reine des Neiges', 'Aladdin', 'La Petite Sirène', 'Encanto', 'Vaiana', 'Mulan', 'Le Livre de la jungle', 'Les Aristochats', 'Le Bossu de Notre-Dame', 'La Belle et la Bête', 'Hercule', 'Coco', 'Tarzan', 'Pocahontas'] },
  { id: 'custom', label: '✏️ Mes artistes' },
];

const DEFAULTS = {
  mode: 'solo', answer: 'free', rounds: '10', duration: '30', country: 'fr',
  themes: ['now', '00s'], custom: '', players: [],
};

/* ---------- utilitaires ---------- */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const store = {
  get(k, d) {
    try { const v = localStorage.getItem('bt:' + k); return v == null ? d : JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('bt:' + k, JSON.stringify(v)); } catch { /* stockage indisponible */ }
  },
};

function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

function show(id) {
  $$('.screen').forEach((s) => { s.hidden = s.id !== id; });
  window.scrollTo(0, 0);
}

/* ---------- comparaison des réponses ---------- */

function norm(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(the|le|la|les|l) /, '')
    .trim();
}

// « Get Lucky (feat. Pharrell) [Radio Edit] - Remastered 2011 » → « Get Lucky »
function cleanTitle(t) {
  const c = String(t)
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();
  return c || t;
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let prev2 = prev;
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      // lettres inversées (« stromea ») = une seule faute
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    prev2 = prev;
    prev = cur;
  }
  return prev[n];
}

function close(guess, target) {
  const g = norm(guess), t = norm(target);
  if (!g || !t) return false;
  if (g === t) return true;
  if (g.replace(/ /g, '') === t.replace(/ /g, '')) return true;
  const tol = t.length <= 3 ? 0 : t.length <= 6 ? 1 : Math.floor(t.length * 0.2);
  if (lev(g, t) <= tol) return true;
  // réponse partielle mais suffisante : « lucky » pour « get lucky » non, « bohemian rhapsody » pour « bohemian rhapsody remastered » oui
  return g.length >= 5 && g.length >= t.length * 0.6 && (` ${t} `).includes(` ${g} `);
}

function artistCandidates(name) {
  const parts = String(name).split(/\s*(?:,|&|\bfeat\.?|\bft\.?|\bx\b|\bet\b|\band\b|\bwith\b|\bvs\.?)\s*/i);
  return [name, ...parts].map((s) => s.trim()).filter(Boolean);
}

function matchArtist(guess, track) {
  return artistCandidates(track.artist).some((c) => close(guess, c));
}

function matchTitle(guess, track) {
  return close(guess, track.cleanTitle) || close(guess, track.title);
}

/* ---------- API iTunes ---------- */

const cache = new Map();

function itunes(params) {
  const qs = new URLSearchParams({
    // pas de « media=music » : avec un User-Agent iPhone, Apple redirige alors vers musics://
    entity: 'song', limit: '40', country: settings.country, ...params,
  }).toString();
  if (cache.has(qs)) return cache.get(qs);
  const p = fetch('https://itunes.apple.com/search?' + qs)
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then((j) => j.results || []);
  cache.set(qs, p);
  p.catch(() => cache.delete(qs));
  return p;
}

async function mapLimit(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const k = i++;
      try { out[k] = await fn(items[k]); } catch { out[k] = null; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

const JUNK = /karaok|instrumental|playback|made famous|tribute|originally performed|in the style of|8-bit|lullaby|berceuse/i;

function toTrack(r, titleOnly) {
  return {
    id: r.trackId,
    title: r.trackName,
    cleanTitle: cleanTitle(r.trackName),
    artist: r.artistName,
    album: (r.collectionName || '').replace(/\s+-\s+(Single|EP)$/i, ''),
    year: (r.releaseDate || '').slice(0, 4),
    artwork: (r.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
    thumb: r.artworkUrl100 || '',
    preview: r.previewUrl,
    url: r.trackViewUrl,
    titleOnly: !!titleOnly,
  };
}

// résultats gardés quelques jours : l'API iTunes limite à ~20 requêtes/minute
const SOURCE_TTL = 3 * 24 * 3600 * 1000;

async function fetchSource(src) {
  const key = `src:${settings.country}:${src.album ? 'al' : 'ar'}:${norm(src.album || src.artist)}`;
  const hit = store.get(key, null);
  if (hit && Date.now() - hit.at < SOURCE_TTL && hit.tracks.length) return hit.tracks;
  let tracks;
  try {
    tracks = await searchSource(src);
  } catch (err) {
    if (hit && hit.tracks.length) return hit.tracks; // limite atteinte : on ressert l'ancien résultat
    throw err;
  }
  store.set(key, { at: Date.now(), tracks });
  return tracks;
}

async function searchSource(src) {
  const results = src.album
    ? await itunes({ term: src.album, attribute: 'albumTerm' })
    : await itunes({ term: src.artist, attribute: 'artistTerm' });
  const want = norm(src.album || src.artist);
  const seen = new Set();
  const out = [];
  for (const r of results) {
    if (r.kind !== 'song' || !r.previewUrl || !r.trackName) continue;
    if (JUNK.test(`${r.trackName} ${r.artistName} ${r.collectionName}`)) continue;
    const field = src.album ? r.collectionName : r.artistName;
    if (!norm(field).includes(want)) continue;
    if (src.album && (!/bande originale|soundtrack|disney/i.test(r.collectionName) || /score|suite\b|medley/i.test(r.trackName))) continue;
    const t = toTrack(r, src.titleOnly);
    const key = norm(t.cleanTitle);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= 8) break; // les résultats iTunes sont triés par popularité
  }
  return out;
}

async function buildPlaylist(rounds) {
  const sources = [];
  for (const id of settings.themes) {
    const th = THEMES.find((t) => t.id === id);
    if (!th) continue;
    if (id === 'custom') {
      settings.custom.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
        .forEach((artist) => sources.push({ artist }));
    }
    (th.artists || []).forEach((artist) => sources.push({ artist }));
    (th.albums || []).forEach((album) => sources.push({ album, titleOnly: th.titleOnly }));
  }
  // dédoublonne (un même artiste peut être dans deux thèmes)
  const uniq = [...new Map(sources.map((s) => [norm(s.artist || s.album), s])).values()];
  if (!uniq.length) throw new Error('Choisis au moins un thème.');

  // au plus ~2 titres par artiste, sans dépasser la limite de requêtes de l'API
  const count = Math.min(uniq.length, 16, Math.max(8, rounds));
  const picked = shuffle(uniq).slice(0, count);
  const lists = (await mapLimit(picked, 5, fetchSource)).filter((l) => l && l.length);
  if (!lists.length) throw new Error('Aucun extrait trouvé. Vérifie ta connexion ou tes artistes.');

  // évite de reproposer les titres des dernières parties
  const recent = new Set(store.get('recent', []));
  const queues = shuffle(lists).map((l) => {
    // les 5 premiers résultats sont les plus connus : on les sert en priorité
    const s = [...shuffle(l.slice(0, 5)), ...shuffle(l.slice(5))];
    return [...s.filter((t) => !recent.has(t.id)), ...s.filter((t) => recent.has(t.id))];
  });

  const tracks = [];
  const used = new Set();
  let guard = 0;
  while (tracks.length < rounds && queues.some((q) => q.length) && guard++ < 1000) {
    for (const q of queues) {
      if (tracks.length >= rounds) break;
      while (q.length) {
        const t = q.shift();
        const key = norm(t.cleanTitle);
        if (used.has(key)) continue;
        used.add(key);
        tracks.push(t);
        break;
      }
    }
  }
  const pool = lists.flat();
  return { tracks: shuffle(tracks), pool };
}

/* ---------- audio (iOS) ---------- */

const audio = new Audio();
audio.preload = 'auto';
audio.setAttribute('playsinline', '');

// iOS n'autorise le son qu'après un geste : on « débloque » l'élément audio au premier tap
function silentWav() {
  const n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  let s = '';
  new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); });
  return 'data:audio/wav;base64,' + btoa(s);
}

let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  audio.src = silentWav();
  const p = audio.play();
  if (p) p.catch(() => {});
}

/* ---------- réglages / accueil ---------- */

const settings = { ...DEFAULTS, ...store.get('settings', {}) };
const saveSettings = () => store.set('settings', settings);

function renderHome() {
  $$('.seg[data-setting]').forEach((seg) => {
    const key = seg.dataset.setting;
    seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.value === String(settings[key])));
  });
  $$('[data-show]').forEach((el) => {
    const [k, v] = el.dataset.show.split(':');
    el.hidden = String(settings[k]) !== v;
  });
  $('#theme-chips').innerHTML = THEMES.map((t) =>
    `<button class="chip ${settings.themes.includes(t.id) ? 'on' : ''}" data-theme="${t.id}">${esc(t.label)}</button>`).join('');
  $('#custom-artists').hidden = !settings.themes.includes('custom');
  $('#custom-artists').value = settings.custom;
  $('#country').value = settings.country;
  $('#player-list').innerHTML = settings.players.map((p, i) =>
    `<li>${esc(p)}<button data-remove="${i}" aria-label="Retirer ${esc(p)}">✕</button></li>`).join('');
  $('#home-error').hidden = true;
}

function initHome() {
  $$('.seg[data-setting]').forEach((seg) => {
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      settings[seg.dataset.setting] = b.dataset.value;
      saveSettings();
      renderHome();
    });
  });
  $('#theme-chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme]');
    if (!b) return;
    const id = b.dataset.theme;
    settings.themes = settings.themes.includes(id)
      ? settings.themes.filter((t) => t !== id)
      : [...settings.themes, id];
    saveSettings();
    renderHome();
    if (id === 'custom' && settings.themes.includes('custom')) $('#custom-artists').focus();
  });
  $('#custom-artists').addEventListener('input', (e) => { settings.custom = e.target.value; saveSettings(); });
  $('#country').addEventListener('change', (e) => { settings.country = e.target.value; saveSettings(); });
  $('#player-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#player-input').value.trim();
    if (!name) return;
    if (settings.players.some((p) => p.toLowerCase() === name.toLowerCase())) { toast('Ce joueur existe déjà'); return; }
    settings.players.push(name);
    $('#player-input').value = '';
    saveSettings();
    renderHome();
    $('#player-input').focus();
  });
  $('#player-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    settings.players.splice(Number(b.dataset.remove), 1);
    saveSettings();
    renderHome();
  });
  $('#start-btn').addEventListener('click', startGame);
}

function homeError(msg) {
  show('screen-home');
  const el = $('#home-error');
  el.textContent = msg;
  el.hidden = false;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

/* ---------- partie ---------- */

let game = null;
let raf = 0;

async function startGame() {
  unlockAudio();
  const party = settings.mode === 'party';
  if (party && settings.players.length < 2) { homeError('Ajoute au moins 2 joueurs pour le mode Soirée.'); return; }
  if (settings.themes.includes('custom') && settings.themes.length === 1 && !settings.custom.trim()) {
    homeError('Écris au moins un artiste dans « Mes artistes ».');
    return;
  }
  show('screen-loading');
  const rounds = Number(settings.rounds);
  let playlist;
  try {
    playlist = await buildPlaylist(rounds);
  } catch (err) {
    homeError(err.message || 'Impossible de charger les extraits.');
    return;
  }
  if (playlist.tracks.length < rounds) toast(`Seulement ${playlist.tracks.length} extraits trouvés`);

  game = {
    party,
    answer: party ? 'party' : settings.answer,
    duration: Number(settings.duration),
    tracks: playlist.tracks,
    pool: playlist.pool,
    idx: 0,
    players: party ? settings.players.map((name) => ({ name, score: 0 })) : [{ name: 'Toi', score: 0 }],
    history: [],
    round: null,
  };
  show('screen-game');
  startRound();
}

function current() { return game.tracks[game.idx]; }

function startRound() {
  const track = current();
  const r = game.round = {
    found: { artist: false, title: false },
    points: 0,
    revealed: false,
    awards: { artist: null, title: null },
    retried: false,
  };

  $('#round-label').textContent = `Manche ${game.idx + 1}/${game.tracks.length}`;
  updateScore();

  const stage = $('#stage');
  stage.classList.remove('revealed');
  stage.classList.toggle('compact', game.answer === 'free');
  $('#cover').removeAttribute('src');
  $('#vinyl').classList.add('spin', 'paused');
  $('#play-btn').hidden = true;
  setRing(1, game.duration);

  $('#reveal').hidden = true;
  $('#free-form').hidden = game.answer !== 'free';
  $('#choices').hidden = game.answer !== 'choice';
  $('#party-controls').hidden = game.answer !== 'party';

  if (game.answer === 'free') {
    for (const k of ['artist', 'title']) {
      const f = $(`#${k}-field`);
      f.classList.remove('ok', 'shake');
      const inp = f.querySelector('input');
      inp.value = '';
      inp.readOnly = false;
    }
    $('#artist-field').hidden = track.titleOnly;
    (track.titleOnly ? $('#title-input') : $('#artist-input')).focus({ preventScroll: true });
  } else if (game.answer === 'choice') {
    renderChoices(track);
  } else {
    $('#pause-btn').textContent = '⏸ Pause';
  }

  playTrack(track);
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}

function playTrack(track) {
  audio.src = track.preview;
  audio.currentTime = 0;
  const p = audio.play();
  if (p) {
    p.then(() => { $('#play-btn').hidden = true; })
      .catch((err) => { if (err && err.name !== 'AbortError') $('#play-btn').hidden = false; });
  }
}

function limit() {
  const d = audio.duration;
  return Number.isFinite(d) && d > 1 ? Math.min(game.duration, d - 0.3) : game.duration;
}

function setRing(ratio, secondsLeft) {
  const fg = $('#ring-fg');
  fg.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, ratio)) * 100);
  fg.classList.toggle('low', secondsLeft <= 5);
  $('#countdown').textContent = Math.max(0, Math.ceil(secondsLeft));
}

function tick() {
  if (!game || game.round.revealed || game.round.answered) return;
  const lim = limit();
  const t = audio.currentTime || 0;
  setRing(1 - t / lim, lim - t);
  $('#vinyl').classList.toggle('paused', audio.paused);
  if (t >= lim) { reveal(); return; }
  raf = requestAnimationFrame(tick);
}

audio.addEventListener('ended', () => { if (game && game.round && !game.round.revealed && audio.src === current().preview) reveal(); });
audio.addEventListener('error', () => {
  if (!game || !game.round || game.round.revealed || !audio.src.startsWith('http')) return;
  // extrait cassé : on le remplace par un autre titre du même lot
  const usedTitles = new Set(game.tracks.map((t) => norm(t.cleanTitle)));
  const spare = game.pool.find((t) => !usedTitles.has(norm(t.cleanTitle)));
  if (spare && !game.round.retried) {
    game.tracks[game.idx] = spare;
    toast('Extrait indisponible, on change de titre');
    startRound();
    game.round.retried = true;
  } else {
    toast('Extrait indisponible');
    reveal();
  }
});

function elapsed() { return audio.currentTime || 0; }

/* --- solo : saisie libre --- */

function submitFree(e) {
  e.preventDefault();
  if (!game || game.round.revealed) return;
  const track = current();
  const r = game.round;
  const fields = track.titleOnly ? ['title'] : ['artist', 'title'];
  let anyWrong = false;
  let anyNew = false;
  for (const k of fields) {
    if (r.found[k]) continue;
    const f = $(`#${k}-field`);
    const inp = f.querySelector('input');
    const v = inp.value.trim();
    if (!v) continue;
    const ok = k === 'artist' ? matchArtist(v, track) : matchTitle(v, track);
    if (ok) {
      r.found[k] = true;
      anyNew = true;
      r.points += track.titleOnly ? 2 : 1;
      f.classList.add('ok');
      inp.readOnly = true;
      inp.value = k === 'artist' ? track.artist : track.cleanTitle;
    } else {
      anyWrong = true;
      f.classList.remove('shake');
      void f.offsetWidth;
      f.classList.add('shake');
    }
  }
  if (fields.every((k) => r.found[k])) {
    if (!track.titleOnly) r.points += 1; // bonus « les deux »
    reveal();
    return;
  }
  // garde le clavier ouvert sur le champ restant
  const next = fields.find((k) => !r.found[k]);
  if (next && (anyNew || anyWrong)) $(`#${next}-input`).focus();
}

/* --- solo : 4 choix --- */

function renderChoices(track) {
  const taken = new Set([norm(track.cleanTitle)]);
  const others = [];
  for (const t of shuffle(game.pool.concat(game.tracks))) {
    const k = norm(t.cleanTitle);
    if (taken.has(k) || t.titleOnly !== track.titleOnly) continue;
    taken.add(k);
    others.push(t);
    if (others.length === 3) break;
  }
  const opts = shuffle([track, ...others]);
  $('#choices').innerHTML = opts.map((t) =>
    `<button class="choice" data-ok="${t === track}"><b>${esc(t.cleanTitle)}</b>${t.titleOnly ? '' : `<span>${esc(t.artist)}</span>`}</button>`).join('');
}

function onChoice(e) {
  const b = e.target.closest('.choice');
  if (!b || !game || game.round.revealed || game.round.answered) return;
  game.round.answered = true;
  cancelAnimationFrame(raf);
  const ok = b.dataset.ok === 'true';
  $$('#choices .choice').forEach((c) => {
    c.disabled = true;
    if (c.dataset.ok === 'true') c.classList.add('good');
  });
  if (ok) {
    game.round.points = elapsed() < 10 ? 3 : 2;
    game.round.found = { artist: true, title: true };
  } else {
    b.classList.add('bad');
  }
  const r = game.round;
  setTimeout(() => { if (game && game.round === r) reveal(); }, 650);
}

/* --- révélation --- */

function reveal() {
  if (!game || game.round.revealed) return;
  const r = game.round;
  r.revealed = true;
  cancelAnimationFrame(raf);
  const track = current();

  // l'extrait continue pendant la révélation, c'est plus sympa
  if (audio.paused && audio.currentTime < (audio.duration || 30) - 0.5) audio.play().catch(() => {});

  const stage = $('#stage');
  stage.classList.remove('compact');
  if (track.artwork) $('#cover').src = track.artwork;
  stage.classList.add('revealed');
  $('#play-btn').hidden = true;

  $('#free-form').hidden = true;
  $('#party-controls').hidden = true;
  $('#choices').hidden = true;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

  $('#reveal-title').textContent = track.cleanTitle;
  $('#reveal-artist').textContent = track.artist;
  $('#reveal-meta').textContent = [track.album !== track.cleanTitle ? track.album : '', track.year].filter(Boolean).join(' · ');
  $('#am-link').href = track.url;

  const gain = $('#gain');
  if (game.party) {
    gain.textContent = 'Qui a trouvé ?';
    gain.className = 'gain';
    renderAwards();
  } else {
    gain.textContent = r.points ? `+${r.points} pt${r.points > 1 ? 's' : ''}` : 'Raté !';
    gain.className = 'gain' + (r.points ? ' plus' : '');
    game.players[0].score += r.points;
    $('#awards').hidden = true;
    updateScore();
  }
  $('#next-btn').textContent = game.idx + 1 >= game.tracks.length ? 'Résultats' : 'Suivant';
  $('#reveal').hidden = false;

  const recent = store.get('recent', []);
  store.set('recent', [track.id, ...recent.filter((id) => id !== track.id)].slice(0, 400));
}

function renderAwards() {
  const track = current();
  const a = game.round.awards;
  const rows = track.titleOnly ? [['title', 'Titre · 2 pts']] : [['artist', 'Artiste · 1 pt'], ['title', 'Titre · 1 pt']];
  $('#awards').innerHTML = rows.map(([k, lbl]) => `
    <div class="award-row">
      <p>${lbl}</p>
      <div class="chips">${game.players.map((p, i) =>
        `<button class="chip ${a[k] === i ? 'on' : ''}" data-award="${k}" data-player="${i}">${esc(p.name)}<small>${p.score}</small></button>`).join('')}
      </div>
    </div>`).join('');
  $('#awards').hidden = false;
}

function onAward(e) {
  const b = e.target.closest('[data-award]');
  if (!b) return;
  const k = b.dataset.award;
  const i = Number(b.dataset.player);
  game.round.awards[k] = game.round.awards[k] === i ? null : i;
  renderAwards();
}

function nextRound() {
  const r = game.round;
  const track = current();
  let pts = r.points;
  if (game.party) {
    pts = 0;
    const per = track.titleOnly ? 2 : 1;
    for (const k of ['artist', 'title']) {
      const i = r.awards[k];
      if (i != null) { game.players[i].score += per; pts += per; }
    }
  }
  game.history.push({
    track,
    points: pts,
    who: game.party ? ['artist', 'title'].map((k) => r.awards[k]).filter((i) => i != null).map((i) => game.players[i].name) : [],
  });
  game.idx++;
  if (game.idx >= game.tracks.length) { endGame(); return; }
  startRound();
}

function updateScore() {
  $('#score-label').textContent = game.party ? '' : `${game.players[0].score} pt${game.players[0].score > 1 ? 's' : ''}`;
}

/* ---------- résultats ---------- */

function endGame() {
  audio.pause();
  cancelAnimationFrame(raf);
  const ranking = [...game.players].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];

  if (game.party) {
    const top = ranking[0];
    const tie = ranking.filter((p) => p.score === top.score).length > 1;
    $('#results-title').textContent = tie ? 'Égalité !' : `${top.name} gagne !`;
    $('#results-sub').textContent = `${game.tracks.length} extraits joués`;
    $('#ranking').hidden = false;
    $('#ranking').innerHTML = ranking.map((p, i) =>
      `<li><span class="pos">${medals[i] || i + 1}</span><span class="name">${esc(p.name)}</span><span class="pts">${p.score} pt${p.score > 1 ? 's' : ''}</span></li>`).join('');
  } else {
    const score = game.players[0].score;
    const max = game.tracks.length * 3;
    const key = `best:${game.answer}:${game.tracks.length}`;
    const best = store.get(key, 0);
    const record = score > best;
    if (record) store.set(key, score);
    const ratio = score / max;
    $('#results-title').textContent = ratio >= 0.75 ? 'Incroyable !' : ratio >= 0.5 ? 'Bien joué !' : ratio >= 0.25 ? 'Pas mal !' : 'On s\'entraîne ?';
    $('#results-sub').textContent = `${score} / ${max} pts` + (record ? ' · nouveau record 🎉' : best ? ` · record : ${best}` : '');
    $('#ranking').hidden = true;
  }

  $('#tracklist').innerHTML = game.history.map((h) => `
    <li><a href="${esc(h.track.url)}" target="_blank" rel="noopener">
      <img src="${esc(h.track.thumb)}" alt="" loading="lazy">
      <div class="t"><b>${esc(h.track.cleanTitle)}</b><span>${esc(h.track.artist)}</span></div>
      <span class="p ${h.points ? 'plus' : ''}">${game.party ? esc(h.who.join(', ') || '—') : (h.points ? '+' + h.points : '0')}</span>
    </a></li>`).join('');

  show('screen-results');
}

function quitGame() {
  if (!confirm('Quitter la partie en cours ?')) return;
  audio.pause();
  cancelAnimationFrame(raf);
  game = null;
  renderHome();
  show('screen-home');
}

/* ---------- branchements ---------- */

function init() {
  initHome();
  renderHome();

  $('#free-form').addEventListener('submit', submitFree);
  $('#artist-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !current().titleOnly && !game.round.found.title && !$('#title-input').value.trim()) {
      e.preventDefault();
      $('#title-input').focus();
    }
  });
  $('#skip-btn').addEventListener('click', reveal);
  $('#choices').addEventListener('click', onChoice);
  $('#awards').addEventListener('click', onAward);
  $('#reveal-btn').addEventListener('click', reveal);
  $('#pause-btn').addEventListener('click', () => {
    if (audio.paused) { audio.play().catch(() => {}); $('#pause-btn').textContent = '⏸ Pause'; }
    else { audio.pause(); $('#pause-btn').textContent = '▶︎ Reprendre'; }
  });
  $('#play-btn').addEventListener('click', () => {
    audio.play().then(() => { $('#play-btn').hidden = true; }).catch(() => toast('Lecture impossible'));
  });
  $('#next-btn').addEventListener('click', nextRound);
  $('#quit-btn').addEventListener('click', quitGame);
  $('#home-btn').addEventListener('click', () => { game = null; renderHome(); show('screen-home'); });
  $('#replay-btn').addEventListener('click', startGame);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
