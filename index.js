/* Rooftop Rumble game server
   - keeps track of who is online (search + invites + parties)
   - matchmaking for every mode (empty spots are filled with bots)
   - runs every match itself, using the real game code (game.js), and streams it to the phones */
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const WAIT = +(process.env.WAIT_SECONDS || 2);   // seconds to wait for more players before bots fill in
const TICK = 30;                                    // simulation steps per second
const SNAP_EVERY = 2;                               // send a snapshot every N steps (15 per second)
const CODE = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

/* ---------- a tiny fake browser so the game code can run on the server ---------- */
function makeWorld() {
  const noop = () => {}; const grad = { addColorStop: noop };
  const fakeCtx = () => new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'createRadialGradient' || k === 'createLinearGradient') ? () => grad : k === 'measureText' ? () => ({ width: 10 }) : noop, set: (t, k, v) => { t[k] = v; return true; } });
  const els = {};
  const el = id => { if (id && els[id]) return els[id]; const e = { id, hidden: false, style: { setProperty: noop, cssText: '' }, dataset: {}, children: [], textContent: '', innerHTML: '', value: '', className: '', disabled: false, clientHeight: 700, isConnected: false,
    classList: { toggle: noop, add: noop, remove: noop, contains: () => false }, addEventListener: noop, setAttribute: noop, removeAttribute: noop, append: noop, prepend: noop, insertAdjacentHTML: noop, remove: noop, querySelectorAll: () => [], querySelector: () => el(null), setPointerCapture: noop,
    getContext: () => fakeCtx(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 760 }), width: 0, height: 0, scrollTop: 0, lastChild: { remove: noop }, focus: noop, closest: () => null };
    if (id) els[id] = e; return e; };
  const store = {};
  const ctx = {
    __rrServer: true, console, Math, JSON, Date,
    devicePixelRatio: 1, navigator: { maxTouchPoints: 0 }, matchMedia: () => ({ matches: false }),
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } },
    requestAnimationFrame: noop, performance: { now: () => Date.now() },
    setTimeout: (f, ms) => setTimeout(() => { try { f(); } catch (e) {} }, ms), clearTimeout, setInterval: () => 0, clearInterval: noop,
    document: { querySelector: s => el(String(s).replace('#', '')), querySelectorAll: () => [], getElementById: id => el(id), createElement: () => el(null), addEventListener: noop, hidden: false, body: null, activeElement: null },
    addEventListener: noop, removeEventListener: noop, location: { reload: noop }, MutationObserver: undefined, WebSocket: undefined, fetch: undefined
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx, { filename: 'game.js' });
  return ctx.__rrNet;
}

/* ---------- how many players each mode holds, per team ---------- */
const boot = makeWorld();
const VER = boot.ver();
const MODES = ['ring', 'battery', 'core', 'crown', 'stand', 'bounty', 'boss', 'chaos', 'duel', 'rush', 'showdown', 'duo', 'trio', 'frenzy'];
const CAPS = {};
for (const m of MODES) { try { CAPS[m] = boot.caps(m); } catch (e) { console.log('mode', m, 'not available:', e.message); } }
console.log('Modes ready:', Object.entries(CAPS).map(([m, c]) => m + '=' + c.join('/')).join(' '));

/* ---------- players, parties, queues, matches ---------- */
const players = new Map();   // pid -> player
const parties = new Map();   // id -> { id, leader, members: [pid] }
const queues = new Map();    // mode -> [ { pids, since } ]
const matches = new Map();   // id -> match
let nextId = 1;

const send = (p, o) => { if (p && p.ws && p.ws.readyState === 1) p.ws.send(JSON.stringify(o)); };
/* Party chat filter (server side too, so nobody can skip it): 15+ only, no links, emails, phone numbers or rude words */
const CHAT_BAD = ['sex','fuck','fuk','fck','shit','bitch','btch','cunt','dick','cock','pussy','asshole','dumbass','bastard','slut','whore','nigg','niga','fag','retard','rape','rapist','penis','vagina','porn','sexy','nude','boob','tits','nazi','hitler','twat','wank','piss','kys','killyourself','suicide','jizz','cum','dildo','anal','pedo','molest','kkk'];
const CHAT_OK = ['essex','sussex','wessex','middlesex','sextant','sexton','sextet','scum','cumber','cucumber','document','circum','peacock','hancock','hitchcock','dickens','analys','canal','banal','grape','drape','scrape','therapist','skyscraper','cockpit','shitake','shiitake','cumul','accum'];
function chatBadWord(w) { let t = String(w).toLowerCase(); for (const ok of CHAT_OK) t = t.split(ok).join('_'); t = t.replace(/[0@4]/g, m => m === '0' ? 'o' : 'a').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/[^a-z_]/g, '').replace(/(.)\1{2,}/g, '$1$1'); const tc = t.replace(/(.)\1+/g, '$1'); return CHAT_BAD.some(b => t.includes(b) || tc.includes(b)); }
function chatClean(s) { s = String(s || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  s = s.replace(/(https?:\/\/|www\.)\S*/gi, '***').replace(/\S+\.(com|net|org|gg|io|co|uk|ie|me|tv|app|xyz|ly|be|link)\b\S*/gi, '***').replace(/\S+@\S+/g, '***').replace(/\d[\d ().+-]{5,}\d/g, '***');
  const w = s.split(' '); for (let i = 0; i < w.length;) { if (w[i].length === 1) { let j = i, acc = ''; while (j < w.length && w[j].length === 1) { acc += w[j]; j++; } if (acc.length >= 3 && chatBadWord(acc)) for (let k = i; k < j; k++) w[k] = '*'; i = j; } else i++; }
  return w.map(x => x !== '*' && x !== '***' && chatBadWord(x) ? '*'.repeat(Math.min(6, x.length)) : x).join(' '); }
const clean = (s, n) => String(s == null ? '' : s).replace(/[<>]/g, '').slice(0, n);
const partyOf = p => p && p.party ? parties.get(p.party) : null;
function partyInfo(pt) { return { t: 'party', leader: pt ? pt.leader : null, members: pt ? pt.members.map(id => players.get(id)).filter(Boolean).map(q => ({ pid: q.pid, name: q.name, rumbler: q.rumbler, skin: q.skin, icon: q.icon, profile: q.profile || null })) : [] }; }
function sendParty(pt) { if (!pt) return; const info = partyInfo(pt); for (const id of pt.members) send(players.get(id), info); }
function addToParty(host, p) { if (p.match || host.match) return send(p, { t: 'toast', msg: 'They are in a match right now, try again soon' });
  let pt = partyOf(host); if (!pt) { pt = { id: 'pt' + (nextId++), leader: host.pid, members: [host.pid] }; parties.set(pt.id, pt); host.party = pt.id; }
  if (pt.members.length >= 3) return send(p, { t: 'toast', msg: 'That party is full' });
  if (p.party !== pt.id) { leaveParty(p); unqueue(p); unqueue(host); pt.members.push(p.pid); p.party = pt.id; }
  sendParty(pt); send(host, { t: 'toast', msg: p.name + ' joined your party!' }); }
function leaveParty(p) { const pt = partyOf(p); if (!pt) return; pt.members = pt.members.filter(x => x !== p.pid); p.party = null; send(p, partyInfo(null));
  if (pt.members.length <= 1) { for (const id of pt.members) { const q = players.get(id); if (q) { q.party = null; send(q, partyInfo(null)); } } parties.delete(pt.id); }
  else { if (pt.leader === p.pid) pt.leader = pt.members[0]; sendParty(pt); } }
function unqueue(p) { for (const [mode, list] of queues) { const i = list.findIndex(e => e.pids.includes(p.pid)); if (i >= 0) { const e = list[i]; list.splice(i, 1); for (const id of e.pids) { const q = players.get(id); if (q) { q.queued = null; if (q !== p) send(q, { t: 'queue', mode, n: 0, need: 0, cancel: true }); } } } } }

function onMessage(ws, m) {
  let p = ws.player;
  if (m.t === 'hello') {
    const pid = clean(m.pid, 40); if (!pid) return;
    if (m.v !== VER) { ws.send(JSON.stringify({ t: 'toast', msg: 'Your game and the server are different versions. Upload the newest game.js to your server.' })); }
    if (!p) { const old = players.get(pid); if (old && old.ws !== ws) { try { old.ws.close(); } catch (e) {} } p = old || { pid, party: null, match: null, queued: null, invitesSent: 0 }; p.ws = ws; ws.player = p; players.set(pid, p); }
    p.name = clean(m.name, 14) || 'Player'; p.lower = p.name.toLowerCase(); p.rumbler = clean(m.rumbler, 20); p.skin = clean(m.skin, 30); p.trophies = Math.max(0, m.trophies | 0); p.invites = m.invites !== false;
    if (m.load) p.load = m.load;
    p.ageBand = ['u7', 'kid', 'teen'].includes(m.ageBand) ? m.ageBand : 'kid'; p.code = clean(m.code, 8).toUpperCase(); p.findByName = !!m.findByName; p.icon = clean(m.icon, 40);
    if (m.profile && typeof m.profile === 'object') { const q = m.profile; p.profile = { name: p.name, icon: p.icon, code: p.code, trophies: q.trophies | 0, best: q.best | 0, coins: q.coins | 0, pp: q.pp | 0, wins: q.wins | 0, rank: clean(q.rank, 20), rumblers: q.rumblers | 0, pres: Array.isArray(q.pres) ? q.pres.slice(0, 8).map(x => [clean(x && x[0], 20), (x && x[1]) | 0]) : [] }; }
    const pt = partyOf(p); if (pt) sendParty(pt); else send(p, partyInfo(null));
    return;
  }
  if (!p) return;
  if (m.t === 'search') { const q = clean(m.q, 20).toLowerCase(); if (q.length < 2) return send(p, { t: 'search', list: [] });
    const list = []; for (const o of players.values()) { if (o === p || !o.ws || o.ws.readyState !== 1) continue; const byCode = !!o.code && o.code.toLowerCase() === q, byName = o.findByName && o.lower.includes(q); if (!byCode && !byName) continue; list.push({ pid: o.pid, name: o.name, rumbler: o.rumbler, skin: o.skin, trophies: o.trophies, invites: o.invites, icon: o.icon }); if (list.length >= 20) break; }
    return send(p, { t: 'search', list }); }
  if (m.t === 'invite') { const o = players.get(clean(m.to, 40)); if (!o || o === p || !o.invites) return; const now = Date.now(); if (now - (p.lastInvite || 0) < 1500) return; p.lastInvite = now;
    const pt = partyOf(p); if (pt && pt.members.length >= 3) return send(p, { t: 'toast', msg: 'Your party is full (3 players)' });
    send(o, { t: 'invite', from: p.pid, name: p.name, rumbler: p.rumbler, skin: p.skin }); return send(p, { t: 'toast', msg: 'Invite sent to ' + o.name }); }
  if (m.t === 'accept') { const host = players.get(clean(m.from, 40)); if (!host || host === p) return; return addToParty(host, p); }
  if (m.t === 'letin') { const j2 = players.get(clean(m.who, 40)); if (!j2 || j2 === p) return; return addToParty(p, j2); }
  if (m.t === 'joinreq') { const o = players.get(clean(m.to, 40)); if (!o || o === p || !o.invites || !o.ws || o.ws.readyState !== 1) return send(p, { t: 'toast', msg: 'They are not online right now' }); const now = Date.now(); if (now - (p.lastInvite || 0) < 1500) return; p.lastInvite = now;
    if (o.match) return send(p, { t: 'toast', msg: o.name + ' is in a match, try again soon' });
    send(o, { t: 'joinreq', from: p.pid, name: p.name, rumbler: p.rumbler, skin: p.skin, icon: p.icon }); return send(p, { t: 'toast', msg: 'Asked ' + o.name + ' to let you in' }); }
  if (m.t === 'presence') { const ids = Array.isArray(m.pids) ? m.pids.slice(0, 30) : []; const list = []; for (const id of ids) { const o = players.get(clean(id, 40)); if (o && o.ws && o.ws.readyState === 1) list.push({ pid: o.pid, name: o.name, icon: o.icon, trophies: o.trophies, invites: o.invites, inMatch: !!o.match }); } return send(p, { t: 'presence', list }); }
  if (m.t === 'leaveParty') { leaveParty(p); return; }
  if (m.t === 'pchat') { const now = Date.now(); if (now - (p.lastChat || 0) < 1100) return; const pt = partyOf(p); if (!pt) return;
    if (typeof m.txt === 'string') { if (p.ageBand !== 'teen') return; const txt = chatClean(m.txt); if (!txt.replace(/[\s*]/g, '')) return; p.lastChat = now; for (const id of pt.members) { if (id === p.pid) continue; const q = players.get(id); if (q && q.ageBand === 'teen') send(q, { t: 'pchat', pid: p.pid, name: p.name, txt }); } return; }
    const i = m.i | 0; if (i < 0 || i > 40) return; p.lastChat = now; for (const id of pt.members) if (id !== p.pid) send(players.get(id), { t: 'pchat', pid: p.pid, name: p.name, i }); return; }
  if (m.t === 'queue') { const mode = clean(m.mode, 20); if (!CAPS[mode] || p.match) return; const pt = partyOf(p);
    if (pt && pt.leader !== p.pid) return send(p, { t: 'toast', msg: 'Only your party leader can start a match' }) || send(p, { t: 'queue', mode, n: 0, need: 0, cancel: true });
    if (m.load) p.load = m.load; unqueue(p);
    const teamCap = Math.max(...CAPS[mode]);
    if (pt && pt.members.length > teamCap) return send(p, { t: 'toast', msg: 'TOO MANY PEOPLE IN PARTY!' }) || send(p, { t: 'queue', mode, n: 0, need: 0, cancel: true });
    const pids = pt ? pt.members.filter(id => { const q = players.get(id); return q && q.ws && q.ws.readyState === 1 && !q.match; }) : [p.pid];
    for (const id of pids) { const q = players.get(id); if (q !== p) unqueue(q); q.queued = mode; }
    if (!queues.has(mode)) queues.set(mode, []); queues.get(mode).push({ pids, since: Date.now() }); return; }
  if (m.t === 'cancel') { unqueue(p); return; }
  if (m.t === 'in') { const mt = p.match && matches.get(p.match); if (mt) mt.inputs.push([p.pid, m]); return; }
  if (m.t === 'leave') { const mt = p.match && matches.get(p.match); if (mt) { try { mt.world.leave(p.pid); } catch (e) {} } p.match = null; return; }
}

/* ---------- matchmaking ---------- */
function tryMatch(mode) {
  const list = queues.get(mode); if (!list || !list.length) return;
  const caps = CAPS[mode], free = caps.slice(), need = caps.reduce((a, b) => a + b, 0), solo = caps.every(c => c <= 1), seats = [];
  const used = [];
  for (const e of list) {
    const live = e.pids.filter(id => { const q = players.get(id); return q && q.ws && q.ws.readyState === 1; }); if (!live.length) continue;
    if (solo) { const open = []; free.forEach((c, i) => { if (c > 0) open.push(i); }); if (open.length < live.length) continue; live.forEach((id, j) => { seats.push([id, open[j]]); free[open[j]]--; }); }
    else { let best = -1; free.forEach((c, i) => { if (c >= live.length && (best < 0 || c > free[best])) best = i; }); if (best < 0) continue; for (const id of live) seats.push([id, best]); free[best] -= live.length; }
    used.push(e);
    if (free.every(c => c === 0)) break;
  }
  const waited = (Date.now() - list[0].since) / 1000, full = seats.length >= need;
  if (!full && waited < WAIT) {
    for (const e of list) for (const id of e.pids) send(players.get(id), { t: 'queue', mode, n: Math.min(need, seats.length), need, left: WAIT - waited, players: seats.map(([sid]) => { const q = players.get(sid); return q ? { name: q.name, rumbler: q.rumbler, skin: q.skin, icon: q.icon } : null; }).filter(Boolean) });
    return;
  }
  if (!seats.length) { queues.set(mode, list.filter(e => !used.includes(e) && e.pids.some(id => players.has(id)))); return; }
  queues.set(mode, list.filter(e => !used.includes(e)));
  startMatch(mode, seats);
}

function startMatch(mode, seats) {
  const id = 'm' + (nextId++);
  let world; try { world = makeWorld(); } catch (e) { console.log('could not make world', e); return; }
  const humans = seats.map(([pid, team]) => { const q = players.get(pid), l = q.load || {}; return { key: pid, team, rumbler: clean(l.rumbler || q.rumbler, 20), skin: clean(l.skin || q.skin, 30), lvl: Math.max(1, Math.min(11, l.lvl | 0 || 1)), gadget: clean(l.gadget, 30), star: clean(l.star, 30), name: q.name }; });
  const avgT = Math.round(seats.reduce((n, [pid]) => n + (players.get(pid).trophies || 0), 0) / seats.length);
  let info; try { info = world.start({ id, mode, humans, trophies: avgT, time: +process.env.TEST_TIME || 0 }); } catch (e) { console.log('start failed', e); for (const [pid] of seats) send(players.get(pid), { t: 'toast', msg: 'Could not start the match' }); return; }
  const mt = { id, mode, world, seats, inputs: [], tick: 0, born: Date.now(), done: false, emptyT: 0 };
  matches.set(id, mt);
  const full = world.snap(true);
  for (const [pid, team] of seats) { const q = players.get(pid); q.match = id; q.queued = null; send(q, { t: 'queue', mode, n: seats.length, need: seats.length, found: true }); send(q, { t: 'start', id, mode, team, unit: info.map[pid], s: full }); }
  console.log('match', id, mode, 'players', seats.length);
  mt.timer = setInterval(() => stepMatch(mt), 1000 / TICK);
}

function stepMatch(mt) {
  try {
    for (const [pid, m] of mt.inputs.splice(0)) mt.world.input(pid, m);
    const t0 = Date.now(); mt.world.step(1 / TICK); mt.tick++; if (process.env.DEBUG && mt.tick % 90 === 0) console.log('step ms', Date.now() - t0, 'time left', mt.world.timeLeft && mt.world.timeLeft());
    const watchers = mt.seats.map(([pid]) => players.get(pid)).filter(q => q && q.match === mt.id && q.ws && q.ws.readyState === 1);
    if (mt.tick % SNAP_EVERY === 0 && watchers.length) { const msg = JSON.stringify({ t: 'snap', s: mt.world.snap(false) }); for (const q of watchers) q.ws.send(msg); if (process.env.DEBUG && mt.tick % 60 === 0) console.log('snapshot bytes', msg.length); }
    mt.emptyT = watchers.length ? 0 : mt.emptyT + 1 / TICK;
    const st = mt.world.state();
    if (st === 'ended' && mt.world.endT() > 1.2 && !mt.done) { mt.done = true; const res = mt.world.results();
      for (const r of res) { const q = players.get(r.key); if (q && q.match === mt.id) { send(q, { t: 'end', r }); q.match = null; } }
      return stopMatch(mt); }
    if (mt.emptyT > 15 || Date.now() - mt.born > 8 * 60 * 1000) stopMatch(mt);
  } catch (e) { console.log('match error', mt.id, e); for (const [pid] of mt.seats) { const q = players.get(pid); if (q && q.match === mt.id) { send(q, { t: 'toast', msg: 'The match hit a problem and ended' }); send(q, { t: 'end', r: { w: -1, place: 0, kills: 0 } }); q.match = null; } } stopMatch(mt); }
}
function stopMatch(mt) { clearInterval(mt.timer); matches.delete(mt.id); }

setInterval(() => { for (const mode of queues.keys()) tryMatch(mode); }, 500);

/* ---------- web server ---------- */
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
  res.end('Rooftop Rumble server is running. Players online: ' + [...players.values()].filter(p => p.ws && p.ws.readyState === 1).length + ', matches: ' + matches.size + '\n');
});
const wss = new WebSocketServer({ server, maxPayload: 16 * 1024, perMessageDeflate: { threshold: 512, zlibDeflateOptions: { level: 3 } } });
wss.on('connection', ws => {
  ws.isAlive = true; ws.on('pong', () => { ws.isAlive = true; });
  let count = 0, since = Date.now();
  ws.on('message', data => {
    if (Date.now() - since > 1000) { since = Date.now(); count = 0; } if (++count > 80) return;
    let m; try { m = JSON.parse(data); } catch (e) { return; } if (!m || typeof m !== 'object') return;
    try { onMessage(ws, m); } catch (e) { console.log('message error', e); }
  });
  ws.on('close', () => { const p = ws.player; if (!p || p.ws !== ws) return; unqueue(p);
    const mt = p.match && matches.get(p.match); if (mt) { try { mt.world.leave(p.pid); } catch (e) {} } p.match = null; leaveParty(p); p.ws = null;
    setTimeout(() => { if (!p.ws) players.delete(p.pid); }, 60000); });
});
setInterval(() => { for (const ws of wss.clients) { if (!ws.isAlive) { ws.terminate(); continue; } ws.isAlive = false; try { ws.ping(); } catch (e) {} } }, 8000);
server.listen(PORT, () => console.log('Rooftop Rumble server listening on port ' + PORT));
