/* Rumble ID: accounts with email + password, two-step codes by email, cloud saves and parent controls.
   Storage: Postgres when DATABASE_URL is set, otherwise a JSON file (fine for testing, wiped on redeploy).
   Email: Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) or Resend (RESEND_API_KEY + MAIL_FROM). With neither,
   two-step is switched off and accounts are created without a code. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CODE_TTL = 10 * 60 * 1000, CODE_TRIES = 5, MAX_SAVE = 400 * 1024;
const now = () => Date.now();
const lower = s => String(s || '').trim().toLowerCase().slice(0, 120);
const EMAIL_RE = /^[^\s@<>()]{1,64}@[^\s@<>()]{1,180}\.[a-z]{2,24}$/i;

/* ---------- storage ---------- */
function fileStore(file) {
  let db = { accounts: {}, sessions: {} };
  try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
  let t = null; const save = () => { clearTimeout(t); t = setTimeout(() => { try { fs.writeFileSync(file, JSON.stringify(db)); } catch (e) {} }, 300); };
  return {
    kind: 'file',
    async init() {},
    async byEmail(email) { return Object.values(db.accounts).find(a => a.email === email) || null; },
    async byId(id) { return db.accounts[id] || null; },
    async create(a) { db.accounts[a.id] = a; save(); },
    async update(id, f) { const a = db.accounts[id]; if (a) { Object.assign(a, f); save(); } },
    async sessionAdd(token, id) { db.sessions[token] = { id, created: now() }; save(); },
    async sessionGet(token) { const s = db.sessions[token]; return s ? s.id : null; },
    async sessionDel(token) { delete db.sessions[token]; save(); },
  };
}
function pgStore(url) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url, ssl: (() => { let h = ''; try { h = new URL(url).hostname; } catch (e) {} return /^(localhost|127\.0\.0\.1)$|^dpg-[a-z0-9]+-a$/.test(h) || process.env.PGSSL === 'off' ? false : { rejectUnauthorized: false }; })(), max: 4 });
  const row = r => r ? { id: r.id, email: r.email, hash: r.hash, created: +r.created, gift: !!r.gift, save: r.save, saveT: +(r.save_t || 0), pc: r.pc, parent: !!r.parent } : null;
  return {
    kind: 'postgres',
    async init() {
      await pool.query(`CREATE TABLE IF NOT EXISTS rid_accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, hash TEXT NOT NULL, created BIGINT NOT NULL, gift BOOLEAN DEFAULT FALSE, save TEXT, save_t BIGINT DEFAULT 0, pc TEXT, parent BOOLEAN DEFAULT FALSE)`);
      await pool.query(`CREATE TABLE IF NOT EXISTS rid_sessions (token TEXT PRIMARY KEY, id TEXT NOT NULL, created BIGINT NOT NULL)`);
    },
    async byEmail(email) { const r = await pool.query('SELECT * FROM rid_accounts WHERE email=$1', [email]); return row(r.rows[0]); },
    async byId(id) { const r = await pool.query('SELECT * FROM rid_accounts WHERE id=$1', [id]); return row(r.rows[0]); },
    async create(a) { await pool.query('INSERT INTO rid_accounts (id,email,hash,created,gift,save,save_t,pc,parent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [a.id, a.email, a.hash, a.created, !!a.gift, a.save || null, a.saveT || 0, a.pc || null, !!a.parent]); },
    async update(id, f) { const map = { hash: 'hash', gift: 'gift', save: 'save', saveT: 'save_t', pc: 'pc' }, sets = [], vals = [];
      for (const k in f) if (map[k]) { vals.push(f[k]); sets.push(map[k] + '=$' + vals.length); } if (!sets.length) return; vals.push(id);
      await pool.query('UPDATE rid_accounts SET ' + sets.join(',') + ' WHERE id=$' + vals.length, vals); },
    async sessionAdd(token, id) { await pool.query('INSERT INTO rid_sessions (token,id,created) VALUES ($1,$2,$3)', [token, id, now()]); },
    async sessionGet(token) { const r = await pool.query('SELECT id FROM rid_sessions WHERE token=$1', [token]); return r.rows[0] ? r.rows[0].id : null; },
    async sessionDel(token) { await pool.query('DELETE FROM rid_sessions WHERE token=$1', [token]); },
  };
}

/* ---------- email ---------- */
function makeMailer() {
  const from = process.env.MAIL_FROM || (process.env.GMAIL_USER ? 'Rooftop Rumble <' + process.env.GMAIL_USER + '>' : 'Rooftop Rumble <onboarding@resend.dev>');
  if (process.env.RID_FAKE_MAIL) return async (to, subject, text) => { console.log('FAKEMAIL', to, text); };   // local testing only
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    let tr = null; try { tr = require('nodemailer').createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') } }); } catch (e) { console.log('nodemailer missing', e.message); }
    if (tr) return async (to, subject, text, html) => { await tr.sendMail({ from, to, subject, text, html }); };
  }
  if (process.env.RESEND_API_KEY) return async (to, subject, text, html) => {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject, text, html }) });
    if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()).slice(0, 200)); };
  return null;
}
const codeMail = (code, why) => {
  const what = why === 'pin' ? 'reset the Parent controls PIN' : 'sign in to your Rumble ID';
  return ['Your Rooftop Rumble code: ' + code,
    'Your code to ' + what + ' is ' + code + '. It works for 10 minutes. If you didn’t ask for this, you can ignore this email.',
    '<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border-radius:16px;background:#241a63;color:#fff;text-align:center"><h2 style="margin:0 0 8px">Rooftop Rumble</h2><p>Your code to ' + what + ':</p><p style="font-size:36px;letter-spacing:8px;font-weight:bold;color:#ffd23f;margin:12px 0">' + code + '</p><p style="color:#c9c3ff;font-size:13px">It works for 10 minutes. If you didn’t ask for this, you can ignore this email.</p></div>'];
};

/* ---------- passwords ---------- */
function hashPass(pass) { const salt = crypto.randomBytes(16); const h = crypto.scryptSync(String(pass), salt, 32); return 's1$' + salt.toString('hex') + '$' + h.toString('hex'); }
function checkPass(pass, stored) { try { const [, s, h] = String(stored).split('$'); const a = crypto.scryptSync(String(pass), Buffer.from(s, 'hex'), 32), b = Buffer.from(h, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); } catch (e) { return false; } }
const newId = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; const b = crypto.randomBytes(8); for (const x of b) s += A[x % A.length]; return 'RID-' + s.slice(0, 4) + '-' + s.slice(4); };
const maskEmail = e => { const [u, d] = e.split('@'); return u.slice(0, 2) + '•••@' + d; };

function createAccounts() {
  const store = process.env.DATABASE_URL ? pgStore(process.env.DATABASE_URL) : fileStore(path.join(process.env.RID_FILE_DIR || __dirname, 'rid-accounts.json'));
  const mail = makeMailer();
  const pending = new Map();   // email -> {code, exp, tries, kind:'signup'|'login'|'pin', data}
  const limits = new Map();    // key -> [timestamps]
  let ready = store.init().then(() => console.log('Rumble ID storage: ' + store.kind + (mail ? ', email codes on' : ', email codes OFF (no mail settings)'))).catch(e => { console.log('Rumble ID storage error', e.message); });
  const hit = (key, max, win) => { const t = now(), l = (limits.get(key) || []).filter(x => t - x < win); l.push(t); limits.set(key, l); return l.length > max; };
  const pub = (a, token) => ({ op: 'ok', id: a.id, email: maskEmail(a.email), token, gift: a.gift, saveT: a.saveT || 0, pc: a.pc ? safeJSON(a.pc) : null, twoStep: !!mail, parent: a.parent });
  const safeJSON = s => { try { return JSON.parse(s); } catch (e) { return null; } };
  async function sendCode(email, kind, data) {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    pending.set(email + '|' + kind, { code, exp: now() + CODE_TTL, tries: 0, kind, data });
    const [subj, text, html] = codeMail(code, kind === 'pin' ? 'pin' : 'login');
    await mail(email, subj, text, html);
  }
  async function finish(a) { const token = crypto.randomBytes(24).toString('hex'); await store.sessionAdd(token, a.id); return pub(a, token); }
  async function who(token) { if (typeof token !== 'string' || token.length > 80) return null; const id = await store.sessionGet(token); return id ? store.byId(id) : null; }

  async function handle(m, ip) {
    await ready;
    const op = m.op, email = lower(m.email);
    if (op === 'status') return { op: 'status', twoStep: !!mail, google: false };
    if (store.kind === 'file' && process.env.RENDER) return { op: 'err', msg: 'Rumble ID isn\u2019t switched on yet. It will work soon!' };
    if (op === 'signup' || op === 'login') {
      if (!EMAIL_RE.test(email)) return { op: 'err', msg: 'That doesn’t look like an email address.' };
      const pass = String(m.pass || '');
      if (hit('a|' + email, 12, 15 * 60e3) || hit('ip|' + ip, 40, 15 * 60e3)) return { op: 'err', msg: 'Too many tries. Wait 15 minutes and try again.' };
      if (op === 'signup') {
        if (pass.length < 8 || pass.length > 100) return { op: 'err', msg: 'Your password needs at least 8 characters.' };
        if (await store.byEmail(email)) return { op: 'err', msg: 'That email already has a Rumble ID. Tap “Sign in” instead.' };
        const data = { hash: hashPass(pass), parent: !!m.parent };
        if (!mail) { const a = { id: newId(), email, hash: data.hash, created: now(), gift: false, parent: data.parent }; await store.create(a); return finish(a); }
        if (hit('c|' + email, 5, 60 * 60e3)) return { op: 'err', msg: 'Too many codes sent. Try again in an hour.' };
        try { await sendCode(email, 'signup', data); } catch (e) { console.log('mail error', e.message); return { op: 'err', msg: 'We couldn’t send the email. Check the address and try again.' }; }
        return { op: 'code', email, kind: 'signup' };
      }
      const a = await store.byEmail(email);
      if (!a || !checkPass(pass, a.hash)) return { op: 'err', msg: 'Wrong email or password.' };
      if (!mail) return finish(a);
      if (hit('c|' + email, 5, 60 * 60e3)) return { op: 'err', msg: 'Too many codes sent. Try again in an hour.' };
      try { await sendCode(email, 'login', { id: a.id }); } catch (e) { console.log('mail error', e.message); return { op: 'err', msg: 'We couldn’t send the email right now. Try again soon.' }; }
      return { op: 'code', email, kind: 'login' };
    }
    if (op === 'verify') {
      const kind = m.kind === 'signup' ? 'signup' : 'login', key = email + '|' + kind, p = pending.get(key);
      if (!p || p.exp < now()) { pending.delete(key); return { op: 'err', msg: 'That code ran out. Go back and get a new one.' }; }
      if (++p.tries > CODE_TRIES) { pending.delete(key); return { op: 'err', msg: 'Too many wrong codes. Go back and get a new one.' }; }
      if (String(m.code || '').replace(/\D/g, '') !== p.code) return { op: 'err', msg: 'That code isn’t right. ' + (CODE_TRIES - p.tries) + ' tries left.' };
      pending.delete(key);
      if (kind === 'signup') {
        if (await store.byEmail(email)) return { op: 'err', msg: 'That email already has a Rumble ID.' };
        const a = { id: newId(), email, hash: p.data.hash, created: now(), gift: false, parent: p.data.parent }; await store.create(a); return finish(a);
      }
      const a = await store.byId(p.data.id); if (!a) return { op: 'err', msg: 'Account not found.' }; return finish(a);
    }
    if (op === 'resend') {
      const kind = m.kind === 'signup' ? 'signup' : 'login', p = pending.get(email + '|' + kind);
      if (!p || !mail) return { op: 'err', msg: 'Go back and start again.' };
      if (hit('c|' + email, 5, 60 * 60e3)) return { op: 'err', msg: 'Too many codes sent. Try again in an hour.' };
      try { await sendCode(email, kind, p.data); } catch (e) { return { op: 'err', msg: 'We couldn’t send the email.' }; }
      return { op: 'sent' };
    }
    /* everything below needs you signed in */
    const a = await who(m.token);
    if (!a) return { op: 'signedout' };
    if (op === 'resume') return pub(a, m.token);
    if (op === 'logout') { await store.sessionDel(m.token); return { op: 'signedout' }; }
    if (op === 'gift') { if (a.gift) return { op: 'gift', ok: false }; await store.update(a.id, { gift: true }); return { op: 'gift', ok: true }; }
    if (op === 'save') { const s = typeof m.save === 'string' ? m.save : ''; if (!s || s.length > MAX_SAVE) return { op: 'err', msg: 'Save too big.' }; const t = now(); await store.update(a.id, { save: s, saveT: t }); return { op: 'saved', saveT: t }; }
    if (op === 'load') return { op: 'load', save: a.save || null, saveT: a.saveT || 0 };
    if (op === 'pc') { const pc = m.pc && typeof m.pc === 'object' ? JSON.stringify(m.pc).slice(0, 2000) : null; await store.update(a.id, { pc }); return { op: 'pcSaved' }; }
    if (op === 'pinCode') { if (!mail) return { op: 'err', msg: 'Email codes aren’t switched on yet.' }; if (hit('c|' + a.email, 5, 60 * 60e3)) return { op: 'err', msg: 'Too many codes sent. Try again in an hour.' };
      try { await sendCode(a.email, 'pin', { id: a.id }); } catch (e) { return { op: 'err', msg: 'We couldn’t send the email.' }; } return { op: 'code', kind: 'pin', email: maskEmail(a.email) }; }
    if (op === 'pinVerify') { const key = a.email + '|pin', p = pending.get(key);
      if (!p || p.exp < now()) return { op: 'err', msg: 'That code ran out. Get a new one.' };
      if (++p.tries > CODE_TRIES) { pending.delete(key); return { op: 'err', msg: 'Too many wrong codes.' }; }
      if (String(m.code || '').replace(/\D/g, '') !== p.code) return { op: 'err', msg: 'That code isn’t right.' };
      pending.delete(key); return { op: 'pinOk' }; }
    return { op: 'err', msg: 'Unknown request.' };
  }
  return { handle, kind: () => store.kind, mailOn: () => !!mail };
}
module.exports = { createAccounts };
