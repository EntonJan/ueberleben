// Spiel-Engine auf dem Server: lädt exakt dieselbe Spieldatei wie der Browser und spielt Kämpfe nach.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML = fs.readFileSync(path.join(__dirname, 'game.html'), 'utf8');
const GAME_VER = (HTML.match(/const GAME_VER='([^']+)'/) || [])[1] || 'unbekannt';
let win = null;

function engine() {
  if (win) return win;
  const dom = new JSDOM(HTML, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(w) {
      w.SERVER_MODE = true;
      w.HTMLCanvasElement.prototype.getContext = () => null;
      w.console.error = () => {};
      w.console.warn = () => {};
    },
  });
  win = dom.window;
  return win;
}

function replay(meSnap, opSnap, opName, seed, acts) {
  return engine().arenaReplay(meSnap, opSnap, opName, seed, acts);
}

function elo(ra, rb, won, k = 32) {
  const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  return Math.round(k * ((won ? 1 : 0) - ea));
}

module.exports = { replay, elo, GAME_VER };
