# Checkliste für zu Hause (ca. 15 Minuten)

Voraussetzung: **Node.js 22** installiert (<https://nodejs.org> → „LTS“).

## A. In der Firebase-Konsole (<https://console.firebase.google.com>)
- [ ] **Projekt hinzufügen** → Name z. B. `ueberleben-spiel` → Google Analytics aus
- [ ] **Build → Authentication → Jetzt starten → E-Mail/Passwort → Aktivieren** (nur den ersten Schalter)
- [ ] **Build → Firestore Database → Datenbank erstellen** → Standort **europe-west3 (Frankfurt)** → **Produktionsmodus**
- [ ] Unten links **Upgrade → Blaze** → Zahlungsmittel hinterlegen → **Budget-Warnung 5 €** setzen
- [ ] **Zahnrad → Projekteinstellungen → Meine Apps → `</>` (Web)** → Name `Spiel` → Registrieren
- [ ] Den angezeigten Block `const firebaseConfig = { … };` **kopieren**

## B. Auf deinem PC im entpackten Ordner `ueberleben`
- [ ] Terminal im Ordner öffnen (Windows: im Explorer in die Adressleiste `cmd` tippen → Enter)
- [ ] `node einrichten.js` → Block einfügen → **leere Zeile mit Enter**
- [ ] **`hochladen.bat`** doppelklicken (Mac/Linux: `./hochladen.sh`)
  - Browser öffnet sich für den Google-Login → mit dem Konto des Firebase-Projekts anmelden
  - Fragen zu APIs (Cloud Build, Artifact Registry …) mit **Y / Ja** bestätigen
  - Erster Upload dauert 3–5 Minuten

## C. Fertig
- [ ] Adresse bei **„Hosting URL“** öffnen (z. B. `https://ueberleben-spiel-xxxx.web.app`)
- [ ] Account anlegen, einen Run spielen, Champion in der Arena veröffentlichen
- [ ] Link an Freunde schicken – installieren über „App installieren“ im Browser

## Falls etwas hakt
| Meldung | Lösung |
|---|---|
| `Billing account not configured` | Schritt „Upgrade → Blaze“ fehlt |
| `Permission denied` beim Deploy | Bei `firebase login` mit dem falschen Google-Konto angemeldet → `firebase logout`, nochmal |
| Spiel zeigt „Gast: Spielstand wird lokal …“ | `node einrichten.js` wurde nicht ausgeführt oder danach nicht hochgeladen |
| Login: „Operation not allowed“ | E-Mail/Passwort in Authentication nicht aktiviert |
| Arena: „Spielversion veraltet“ | Seite neu laden (Strg+F5) |
