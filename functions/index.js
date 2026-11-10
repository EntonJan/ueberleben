const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { replay, elo, GAME_VER } = require('./arena-core');

initializeApp();
const db = getFirestore();
setGlobalOptions({ region: 'europe-west3', maxInstances: 5, memory: '512MiB', timeoutSeconds: 60 });

const LIMIT_PER_DAY = 5;
const CUR_MULT = 0.25; // muss zu CUR_MULT im Spiel passen
const MATCH_TTL_MS = 60 * 60 * 1000; // ein Kampf muss innerhalb 1 Stunde abgeschlossen werden
const today = () => new Date().toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
const need = (cond, code, msg) => { if (!cond) throw new HttpsError(code, msg); };

// 1) Kampf anfordern: Server würfelt den Zufalls-Startwert und friert beide Champions ein.
exports.arenaStart = onCall(async (req) => {
  const uid = req.auth && req.auth.uid;
  need(uid, 'unauthenticated', 'Bitte anmelden.');
  const { opId, ver } = req.data || {};
  need(ver === GAME_VER, 'failed-precondition', 'Deine Spielversion ist veraltet – bitte Seite neu laden.');
  need(typeof opId === 'string' && opId && opId !== uid, 'invalid-argument', 'Ungültiger Gegner.');

  const [me, op] = await Promise.all([db.doc(`arena/${uid}`).get(), db.doc(`arena/${opId}`).get()]);
  need(me.exists && me.data().snap, 'failed-precondition', 'Veröffentliche zuerst deinen Champion.');
  need(op.exists && op.data().snap, 'not-found', 'Gegner nicht gefunden.');

  const seed = Math.floor(Math.random() * 2147483647);
  const limRef = db.doc(`limits/${uid}`);
  const mRef = db.collection('matches').doc();
  await db.runTransaction(async (t) => {
    const l = await t.get(limRef);
    const d = l.exists ? l.data() : {};
    const cnt = d.day === today() ? d.count || 0 : 0;
    need(cnt < LIMIT_PER_DAY, 'resource-exhausted', `Heute keine Angriffe mehr übrig (${LIMIT_PER_DAY} pro Tag).`);
    t.set(limRef, { day: today(), count: cnt + 1 });
    t.set(mRef, {
      attacker: uid, opponent: opId, seed,
      meSnap: me.data().snap, opSnap: op.data().snap,
      meName: me.data().name, opName: op.data().name,
      status: 'open', created: Date.now(), ver: GAME_VER,
    });
  });
  return { matchId: mRef.id, seed, meSnap: me.data().snap, opSnap: op.data().snap, opName: op.data().name, opRating: op.data().rating || 1000 };
});

// 2) Kampf abgeben: Server spielt ihn mit denselben Aktionen nach und wertet ihn.
exports.arenaFinish = onCall(async (req) => {
  const uid = req.auth && req.auth.uid;
  need(uid, 'unauthenticated', 'Bitte anmelden.');
  const { matchId, acts } = req.data || {};
  need(typeof matchId === 'string' && Array.isArray(acts) && acts.length <= 3000, 'invalid-argument', 'Ungültige Daten.');

  const mRef = db.doc(`matches/${matchId}`);
  const m = await mRef.get();
  need(m.exists, 'not-found', 'Kampf nicht gefunden.');
  const md = m.data();
  need(md.attacker === uid, 'permission-denied', 'Das ist nicht dein Kampf.');
  need(md.status === 'open', 'failed-precondition', 'Dieser Kampf wurde bereits gewertet.');
  need(Date.now() - md.created < MATCH_TTL_MS, 'deadline-exceeded', 'Der Kampf ist abgelaufen.');

  const r = replay(md.meSnap, md.opSnap, md.opName, md.seed, acts) || {};
  const won = !!r.win;
  const meRef = db.doc(`arena/${uid}`);
  const opRef = db.doc(`arena/${md.opponent}`);
  let out = null;
  await db.runTransaction(async (t) => {
    const [a, b] = await Promise.all([t.get(meRef), t.get(opRef)]);
    const A = a.data() || {};
    const B = b.exists ? b.data() : null;
    const ra = A.rating || 1000, rb = B ? B.rating || 1000 : 1000;
    const dA = elo(ra, rb, won);
    t.update(meRef, { rating: ra + dA, w: (A.w || 0) + (won ? 1 : 0), l: (A.l || 0) + (won ? 0 : 1) });
    if (B) {
      const entry = { t: Date.now(), by: A.name || '?', cls: A.icon || '', won: !won, d: -dA };
      t.update(opRef, { rating: rb - dA, w: (B.w || 0) + (won ? 0 : 1), l: (B.l || 0) + (won ? 1 : 0), log: [entry, ...(B.log || [])].slice(0, 15) });
    }
    t.update(mRef, { status: 'done', won, dA, nActs: acts.length, finished: Date.now(), check: r });
    out = { win: won, dA, rating: ra + dA, reward: won ? Math.max(2, Math.round((10 + dA) * CUR_MULT)) : 1, verified: true };
  });
  return out;
});
