// Einrichtungs-Helfer: Firebase-Konfiguration einfügen → trägt alles automatisch ein.
// Start: node einrichten.js
const fs = require('fs');
const path = require('path');
const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });

console.log('\n=== Überleben! – Firebase einrichten ===\n');
console.log('Füge jetzt den Block "const firebaseConfig = { ... };" aus der Firebase-Konsole ein.');
console.log('Danach eine LEERE Zeile mit Enter abschicken.\n');

let buf = '';
rl.on('line', (line) => {
  buf += line + '\n';
  if (pick('apiKey') && pick('appId') && /\}\s*;?\s*$/.test(line.trim()) ) return finish();
  if (line.trim() === '' && pick('apiKey') && pick('appId')) return finish();
});

function pick(key) {
  const m = buf.match(new RegExp(key + '\\s*:\\s*["\']([^"\']+)["\']'));
  return m ? m[1] : '';
}

function finish() {
  rl.close();
  const cfg = {
    apiKey: pick('apiKey'),
    authDomain: pick('authDomain'),
    projectId: pick('projectId'),
    storageBucket: pick('storageBucket'),
    messagingSenderId: pick('messagingSenderId'),
    appId: pick('appId'),
  };
  const missing = ['apiKey', 'authDomain', 'projectId', 'appId'].filter((k) => !cfg[k]);
  if (missing.length) {
    console.error('\n✘ Folgende Werte fehlen: ' + missing.join(', ') + '\n  Bitte den kompletten Block kopieren und erneut starten.');
    process.exit(1);
  }
  const js =
    '// Automatisch erstellt von einrichten.js\n' +
    'window.FB_CONFIG = ' + JSON.stringify(Object.assign(cfg, { region: 'europe-west3' }), null, 2) + ';\n';
  fs.writeFileSync(path.join(__dirname, 'public', 'firebase-config.js'), js);
  fs.writeFileSync(path.join(__dirname, '.firebaserc'), JSON.stringify({ projects: { default: cfg.projectId } }, null, 2) + '\n');
  console.log('\n✔ public/firebase-config.js eingetragen');
  console.log('✔ .firebaserc → Projekt "' + cfg.projectId + '"');
  console.log('\nWeiter mit: hochladen.bat (Windows) bzw. ./hochladen.sh (Mac/Linux)\n');
}
