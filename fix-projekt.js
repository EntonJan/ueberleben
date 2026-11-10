// Entfernt falsch gemerkte Projekt-Zuordnungen des Firebase-Werkzeugs (z. B. "cd functions").
const fs = require('fs'), path = require('path'), os = require('os');
const files = [
  path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
  path.join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json'),
];
for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (d.activeProjects) {
      const bad = Object.entries(d.activeProjects).filter(([, v]) => !/^[a-z0-9-]{4,30}$/.test(v));
      for (const [k] of bad) delete d.activeProjects[k];
      if (bad.length) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); console.log('      bereinigt: ' + bad.map(b => b[1]).join(', ')); }
    }
  } catch (e) {}
}
