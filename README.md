# Überleben! – Das Roguelike · Eigenständige Version (Firebase)

Diese Version läuft **ohne Claude-Konto**. Spieler öffnen einfach einen Link, legen einen Account an und können das Spiel wie ein Programm installieren.

| Teil | Was es macht |
|---|---|
| `public/index.html` | Das komplette Spiel |
| `public/firebase-config.js` | **Hier trägst du deine Firebase-Daten ein** |
| `public/manifest.webmanifest`, `sw.js`, Icons | Installierbar als App (PWA), startet auch offline |
| `functions/` | Server-Prüfung der Arena: spielt jeden Kampf nach und rechnet die Wertung |
| `firestore.rules` | Schutzregeln der Datenbank |
| `firebase.json`, `.firebaserc` | Projekt-Einstellungen für den Upload |

---

> **Automatische Updates:** siehe `GITHUB-EINRICHTUNG.md` – danach wird jede Änderung im GitHub-Repo automatisch veröffentlicht.

> **Kurzfassung:** `CHECKLISTE.md` abhaken – Konsole klicken, dann `node einrichten.js` und `hochladen.bat`.

## Einrichtung (einmalig, ca. 20 Minuten)

### 1. Firebase-Projekt anlegen
1. Öffne <https://console.firebase.google.com> → **Projekt hinzufügen** → Namen vergeben (z. B. `ueberleben-spiel`).
2. Google Analytics kannst du ausschalten.
3. Merke dir die **Projekt-ID** (steht unter dem Projektnamen, z. B. `ueberleben-spiel-4a2f1`).

### 2. Anmeldung aktivieren
**Build → Authentication → Jetzt starten → Anmeldemethode → E-Mail/Passwort → Aktivieren → Speichern.**
(Die Spieler sehen keine E-Mail – das Spiel macht aus dem Spielernamen intern eine Adresse.)

### 3. Datenbank anlegen
**Build → Firestore Database → Datenbank erstellen** → Standort **`europe-west3 (Frankfurt)`** → **Produktionsmodus**.

### 4. Tarif „Blaze“ aktivieren (für die Arena-Prüfung)
Cloud Functions brauchen den Tarif **Blaze (Pay as you go)**: unten links **Upgrade**.
- Die kostenlosen Kontingente (2 Mio. Funktionsaufrufe/Monat) reichen für ein Hobbyspiel locker – realistisch **0 €**.
- Lege direkt ein **Budget mit Warnung** an (z. B. 5 €), dann bekommst du eine Mail, bevor etwas passiert.

### 5. Web-App registrieren und Zugangsdaten eintragen
1. **Projekteinstellungen (Zahnrad) → Allgemein → Meine Apps → Web (`</>`)** → Namen vergeben → Registrieren (Hosting-Haken nicht nötig).
2. Es erscheint ein Block `const firebaseConfig = { … }`.
3. Öffne `public/firebase-config.js` und ersetze die Platzhalter durch diese Werte. `region` bleibt `europe-west3`.
4. Öffne `.firebaserc` und ersetze `DEINE-PROJEKT-ID` durch deine Projekt-ID.

> Die Werte in `firebase-config.js` sind **kein Geheimnis** – sie sind bei jeder Firebase-Web-App öffentlich sichtbar. Geschützt wird alles über die Regeln in `firestore.rules` und die Server-Prüfung.

### 6. Werkzeug installieren und hochladen
Voraussetzung: **Node.js 22** (<https://nodejs.org>). Dann im Ordner dieses Pakets im Terminal:

```bash
npm install -g firebase-tools
firebase login
cd functions && npm install && cd ..
copy /y public\index.html functions\game.html   (Windows)  bzw.  cp public/index.html functions/game.html
firebase deploy
```

Am Ende zeigt dir der Befehl die Adresse an, z. B. **`https://ueberleben-spiel-4a2f1.web.app`** – das ist dein Spiel. Diesen Link kannst du an alle weitergeben.

> Beim ersten `firebase deploy` fragt Google evtl., ob APIs aktiviert werden sollen (Cloud Build, Artifact Registry) – mit **Ja** bestätigen. Dauert beim ersten Mal ein paar Minuten.

---

## Als App installieren (für Spieler)
- **PC (Chrome/Edge):** Link öffnen → in der Adressleiste rechts das Symbol **„App installieren“** → danach Startmenü-/Desktop-Verknüpfung, eigenes Fenster.
- **Android (Chrome):** Menü ⋮ → **App installieren** / „Zum Startbildschirm hinzufügen“.
- **iPhone (Safari):** Teilen-Symbol → **Zum Home-Bildschirm**.

Das Spiel startet dann auch ohne Internet (Gast-Spielstand auf dem Gerät). Cloud-Speicher und Arena brauchen Internet.

---

## Was wo gespeichert wird
| Firestore-Sammlung | Inhalt | Wer darf schreiben |
|---|---|---|
| `users/{uid}` | Spielstand | nur der Spieler selbst |
| `arena/{uid}` | Champion + Wertung | Spieler: nur Champion/Ausrüstung · Wertung, Siege, Log: **nur der Server** |
| `matches/{id}` | Arena-Kämpfe (Startwert, beide Champions, Ergebnis) | nur der Server |
| `limits/{uid}` | Tageslimit (5 Angriffe) | nur der Server |

## So funktioniert der Schutz der Arena
1. Spieler klickt „Angreifen“ → Server (`arenaStart`) prüft Tageslimit, friert beide Champions ein und würfelt den Zufalls-Startwert.
2. Der Kampf läuft im Browser mit genau diesem Startwert; gespeichert werden nur die **gewählten Aktionen**.
3. Am Ende schickt der Browser die Aktionen an `arenaFinish`. Der Server lädt **dieselbe Spieldatei**, spielt den Kampf exakt nach und entscheidet Sieg/Niederlage und Wertung (Elo).
4. Manipulierte Werte, ein erfundener Sieg oder eine doppelte Abgabe bringen also nichts – es zählt nur das Server-Ergebnis.

## Updates einspielen
Neue `index.html` nach `public/` legen → `firebase deploy`.
Die Server-Prüfung nutzt automatisch die neue Datei. Spieler mit veralteter Version bekommen beim Angreifen den Hinweis „Seite neu laden“.

## Gut zu wissen
- **Passwort vergessen:** Es gibt keine E-Mail, daher kein Zurücksetzen per Mail. Du kannst als Admin in **Authentication → Nutzer** einem Account ein neues Passwort setzen oder ihn löschen.
- **Spieler sperren:** In **Authentication** den Nutzer deaktivieren und in **Firestore** seinen `arena`-Eintrag löschen.
- **Kosten im Blick:** Konsole → Nutzung und Abrechnung.
- **Ohne eingetragene Firebase-Daten** läuft das Spiel trotzdem – dann nur als Gast mit Speicherstand im Browser, ohne Arena.
