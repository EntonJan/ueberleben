// Schreibt public/version.json aus GAME_VER der Spieldatei und kopiert die Spieldatei für die Server-Prüfung.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const v = (html.match(/const GAME_VER='([^']+)'/) || [])[1];
if (!v) { console.error('GAME_VER nicht gefunden'); process.exit(1); }
fs.writeFileSync(path.join(root, 'public', 'version.json'), JSON.stringify({ v, built: new Date().toISOString() }) + '\n');
fs.copyFileSync(path.join(root, 'public', 'index.html'), path.join(root, 'functions', 'game.html'));
console.log('Version ' + v + ' vorbereitet');
