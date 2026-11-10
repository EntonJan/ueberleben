# Automatische Updates über GitHub (einmalig, ca. 10 Minuten)

Danach gilt: Jede Änderung, die im Repo auf `main` landet, wird automatisch auf Firebase veröffentlicht. Du musst nichts mehr herunterladen oder hochladen. Spieler bekommen im Spiel die Meldung „Neue Version verfügbar“.

## 1. Leeres Repo anlegen
1. <https://github.com/new>
2. Name: **`Ueberleben`** · Sichtbarkeit: **Private** (empfohlen)
3. **Keine** README, .gitignore oder Lizenz anhaken → **Create repository**

## 2. Zugangsschlüssel für Firebase erstellen (Google Cloud)
1. <https://console.cloud.google.com/iam-admin/serviceaccounts?project=azubi-survival> öffnen (oben muss **azubi-survival** ausgewählt sein).
2. **+ Create service account** (Dienstkonto erstellen)
   - Name: `github-deploy` → **Create and continue**
3. Bei „Grant this service account access to project“ diese Rollen hinzufügen (jeweils **+ Add another role**):
   | Rolle (englisch) | wofür |
   |---|---|
   | **Cloud Functions Admin** | Server-Funktionen hochladen |
   | **Service Account User** | Funktionen im Namen des Projekts ausführen |
   | **Cloud Run Admin** | 2. Generation der Funktionen läuft auf Cloud Run |
   | **Artifact Registry Administrator** | Bau-Pakete der Funktionen + Aufräum-Regel |
   | **Firebase Hosting Admin** | Website hochladen |
   | **Firebase Rules Admin** | Datenbank-Regeln hochladen |
   | **Cloud Datastore Index Admin** | Datenbank-Indizes |
   | **API Keys Viewer** | wird vom Firebase-Werkzeug geprüft |

   → **Continue** → **Done**
4. In der Liste auf **github-deploy@…** klicken → Reiter **Keys** → **Add key → Create new key → JSON → Create**.
   Eine `.json`-Datei wird heruntergeladen. **Diese Datei ist ein Passwort – nicht weitergeben, nicht ins Repo legen.**

## 3. Schlüssel bei GitHub hinterlegen
1. Im neuen Repo: **Settings → Secrets and variables → Actions → New repository secret**
2. Name: **`FIREBASE_SERVICE_ACCOUNT`**
3. Secret: die heruntergeladene `.json`-Datei mit dem Editor öffnen, **kompletten Inhalt** kopieren und einfügen → **Add secret**
4. Die `.json`-Datei danach von deinem PC löschen (sie liegt jetzt sicher bei GitHub).

## 4. Claude Bescheid geben
Schreib Claude „Repo ist angelegt“ – Claude lädt das Projekt hoch und der erste automatische Upload startet.

## Den Upload beobachten
Repo → Reiter **Actions** → „Auf Firebase veröffentlichen“. Grüner Haken = online. Roter Kreuz = Screenshot an Claude.
Mit **Run workflow** kannst du einen Upload auch von Hand starten.

## Wenn mal etwas schiefgeht
- **„Secret FIREBASE_SERVICE_ACCOUNT fehlt“** → Schritt 3 wiederholen (Name exakt so schreiben).
- **„Permission denied“ / „missing permission …“** → in Schritt 2.3 fehlt eine Rolle. Die Meldung nennt meist die Rolle.
- **Notfall ohne GitHub:** `hochladen.bat` funktioniert weiterhin.
