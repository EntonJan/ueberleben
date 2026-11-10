#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "=== Überleben! – Hochladen zu Firebase ==="
command -v node >/dev/null || { echo "Node.js fehlt: bitte von https://nodejs.org installieren (Version 22)"; exit 1; }
if grep -q "DEIN_API_KEY" public/firebase-config.js; then echo 'Zuerst "node einrichten.js" ausführen!'; exit 1; fi
command -v firebase >/dev/null || npm install -g firebase-tools
firebase login
node tools/version.js
(cd functions && npm install --no-audit --no-fund)
firebase deploy --project azubi-survival
echo; echo 'Fertig! Die Adresse deines Spiels steht oben bei "Hosting URL".'
