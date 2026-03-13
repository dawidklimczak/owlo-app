# PulseFeed App (Frontend)

Frontend aplikacji PulseFeed — SvelteKit PWA do śledzenia rozwoju newsów i tematów w czasie.

## Opis

Aplikacja webowa (PWA) komunikująca się z PulseFeed Backend API. Użytkownik loguje się, dodaje artykuły przez wklejenie URL-a lub udostępnienie linku z telefonu (Web Share Target), a aplikacja śledzi rozwój tematów i powiadamia o nowych informacjach.

## Backend API (już działa)

Backend jest wdrożony i dostępny pod adresem `https://pulseapi.nightowls.cc`. Dokumentacja API (Swagger UI) dostępna pod `https://pulseapi.nightowls.cc/docs`.

### Dostępne endpointy

**Auth:**
```
POST   /auth/google          # Google OAuth callback → ustawia httpOnly cookie (jeszcze nie skonfigurowany)
POST   /auth/magic-link      # Wysyła magic link na email { "email": "user@example.com" }
POST   /auth/verify           # Weryfikuje magic link token { "token": "xxx" } → ustawia httpOnly cookie
GET    /auth/me               # Aktualny user (wymaga cookie)
POST   /auth/logout           # Unieważnienie sesji
```

**Topics:**
```
POST   /topics                # Dodaj temat z URL-a { "url": "https://..." } → zwraca propozycje tematów
POST   /topics/confirm        # Potwierdź wybrany temat
GET    /topics                # Lista tematów usera (z flagą has_update)
GET    /topics/:id            # Szczegóły tematu (z faktami i historią sprawdzeń)
PATCH  /topics/:id            # Zmiana ustawień tematu (częstotliwość, status)
DELETE /topics/:id            # Usunięcie tematu
POST   /topics/:id/check     # Wymuś sprawdzenie teraz (kosztuje kredyt)
POST   /topics/:id/mark-read # Oznacz aktualizacje jako przeczytane
```

**User:**
```
GET    /users/settings        # Pobierz ustawienia
PATCH  /users/settings        # Zmień ustawienia (język, domyślna częstotliwość)
GET    /users/credits         # Stan kredytów i historia użycia
```

**Notifications:**
```
GET    /notifications         # Lista powiadomień usera
POST   /notifications/mark-read  # Oznacz jako przeczytane
```

Auth działa przez httpOnly cookies. Po wywołaniu `/auth/verify` lub `/auth/google` backend ustawia cookie z JWT. Wszystkie kolejne requesty automatycznie wysyłają cookie — frontend musi używać `credentials: 'include'` w fetch.

## Stack technologiczny

- **SvelteKit** — framework
- **TypeScript**
- **TailwindCSS** — stylowanie
- **Vite PWA Plugin** (`@vite-pwa/sveltekit`) — PWA, service worker, Web Share Target
- **Brak dodatkowych bibliotek UI** — custom komponenty, minimalistyczny design

## Zmienne środowiskowe

```env
PUBLIC_API_URL=https://pulseapi.nightowls.cc
PUBLIC_APP_URL=https://pulseapp.nightowls.cc
PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

## Struktura projektu

```
app/
├── src/
│   ├── lib/
│   │   ├── api/                    # Klient API
│   │   │   ├── client.ts           # Fetch wrapper z auth, error handling
│   │   │   ├── topics.ts           # Endpointy topics
│   │   │   ├── auth.ts             # Endpointy auth
│   │   │   └── users.ts            # Endpointy users
│   │   │
│   │   ├── components/             # Komponenty UI
│   │   │   ├── TopicCard.svelte    # Karta tematu na dashboardzie
│   │   │   ├── TopicTimeline.svelte # Timeline faktów w widoku szczegółów
│   │   │   ├── FactItem.svelte     # Pojedynczy fakt ze źródłem
│   │   │   ├── AddTopicModal.svelte # Modal dodawania tematu
│   │   │   ├── TopicChoiceStep.svelte # Wybór tematu z propozycji AI
│   │   │   ├── Navbar.svelte
│   │   │   ├── CreditsDisplay.svelte # Wyświetlanie stanu kredytów
│   │   │   └── NotificationBadge.svelte
│   │   │
│   │   ├── stores/                 # Svelte stores
│   │   │   ├── auth.ts             # Stan auth (user, token)
│   │   │   ├── topics.ts           # Lista tematów
│   │   │   └── notifications.ts    # Powiadomienia
│   │   │
│   │   ├── i18n/                   # Tłumaczenia
│   │   │   ├── index.ts            # Logika i18n
│   │   │   ├── en.json
│   │   │   └── pl.json
│   │   │
│   │   └── utils/
│   │       ├── dates.ts            # Formatowanie dat
│   │       └── share-target.ts     # Obsługa Web Share Target
│   │
│   ├── routes/
│   │   ├── +layout.svelte          # Główny layout (navbar, auth guard)
│   │   ├── +layout.ts              # Load: sprawdzenie auth
│   │   ├── +page.svelte            # Dashboard — lista tematów
│   │   │
│   │   ├── login/
│   │   │   └── +page.svelte        # Strona logowania (Google + magic link)
│   │   │
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── +page.svelte    # Google OAuth callback
│   │   │   └── verify/
│   │   │       └── +page.svelte    # Weryfikacja magic link
│   │   │
│   │   ├── topic/
│   │   │   └── [id]/
│   │   │       └── +page.svelte    # Widok szczegółów tematu
│   │   │
│   │   ├── settings/
│   │   │   └── +page.svelte        # Ustawienia użytkownika
│   │   │
│   │   └── share-target/
│   │       └── +page.svelte        # Obsługa Web Share Target (PWA)
│   │
│   ├── app.html
│   ├── app.css                     # Globalne style + Tailwind
│   └── service-worker.ts
│
├── static/
│   ├── manifest.webmanifest
│   ├── icons/                      # Ikony PWA (192x192, 512x512)
│   └── favicon.ico
│
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── Dockerfile
├── package.json
└── .env.example
```

## Widoki aplikacji

### 1. Strona logowania (`/login`)

Prosty, czysty ekran z dwoma opcjami:
- Przycisk "Zaloguj przez Google" (OAuth 2.0)
- Pole email + przycisk "Wyślij magic link"

Po wysłaniu magic linka — komunikat "Sprawdź swoją skrzynkę email".

### 2. Dashboard (`/` — strona główna po zalogowaniu)

Lista śledzonych tematów w formie kart. Każda karta zawiera:
- Tytuł tematu
- Data ostatniego sprawdzenia
- Liczba odkrytych faktów (nowe od ostatniej wizyty wyróżnione)
- Wskaźnik częstotliwości sprawdzania
- Status (active/paused)

Sortowanie: tematy z nowymi informacjami na górze (analogicznie do nieprzeczytanych emaili).

Przycisk dodawania nowego tematu (floating action button lub w navbarze).

Stan pustego dashboardu (onboarding): gdy użytkownik nie ma jeszcze tematów, wyświetl krótką instrukcję i zachętę do dodania pierwszego tematu.

### 3. Dodawanie tematu (modal lub osobna strona)

Flow w krokach:
1. **Wklejenie URL** — pole input z przyciskiem. Po wklejeniu → loading spinner.
2. **Wybór tematu** — AI zwraca 1-3 propozycje tematów. Jeśli jedna → od razu potwierdzenie. Jeśli więcej → user wybiera klikając w preferowaną opcję. Każda propozycja to tytuł + krótki opis (1-2 zdania).
3. **Potwierdzenie** — "Temat dodany. Sprawdzimy aktualizacje za X dni." z przyciskiem powrotu do dashboardu.

### 4. Widok szczegółów tematu (`/topic/[id]`)

- Tytuł tematu na górze
- Opis kontekstu
- Link do oryginalnego artykułu
- **Timeline faktów** — chronologiczna lista odkrytych faktów:
  - Każdy fakt z datą odkrycia i źródłem (klikalny link)
  - Fakty z oryginalnego artykułu (is_initial) oznaczone inaczej niż odkryte później
  - Nowe fakty (od ostatniej wizyty) wyróżnione wizualnie
- Ustawienia tematu: częstotliwość sprawdzania, pauza/wznowienie, archiwizacja
- Przycisk "Sprawdź teraz" (zużywa kredyt)
- Historia sprawdzeń (opcjonalnie, np. w sekcji zwijanej)

### 5. Ustawienia (`/settings`)

- Język interfejsu (wybór z listy)
- Domyślna częstotliwość sprawdzania nowych tematów (dropdown: co 3 dni, co tydzień, co 2 tygodnie, co miesiąc)
- Stan kredytów i historia użycia
- Zarządzanie kontem (zmiana emaila, usunięcie konta)

## PWA i Web Share Target

### Konfiguracja PWA

Aplikacja musi działać jako Progressive Web App, aby:
- Można ją było zainstalować na telefonie (Add to Home Screen)
- Obsługiwała Web Share Target (udostępnianie linków z przeglądarki/innych aplikacji)
- Przygotowana była pod Bubblewrap (opakowanie w APK na Google Play — przyszły etap)

### Web Share Target

Kluczowa funkcja UX — użytkownik na telefonie czyta artykuł, klika "Udostępnij" i wybiera PulseFeed z listy aplikacji.

W `manifest.webmanifest`:
```json
{
  "share_target": {
    "action": "/share-target",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title",
      "text": "text"
    }
  }
}
```

Strona `/share-target` odczytuje parametry z URL query string, wyciąga URL artykułu (z parametru `url` lub parsując `text`), i uruchamia flow dodawania tematu.

Jeśli użytkownik nie jest zalogowany — zapisz URL w sessionStorage, przekieruj na logowanie, po zalogowaniu kontynuuj dodawanie.

### Manifest

```json
{
  "name": "PulseFeed",
  "short_name": "PulseFeed",
  "description": "Track news stories as they develop",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "share_target": { "..." : "jak wyżej" }
}
```

## Internacjonalizacja (i18n)

Prosty system oparty na plikach JSON z tłumaczeniami. Na start polski i angielski.

Logika wyboru języka:
1. Ustawienie użytkownika (z profilu, zapisane w API)
2. Język przeglądarki (navigator.language)
3. Fallback: angielski

Struktura pliku tłumaczeń:
```json
{
  "dashboard": {
    "title": "Your Topics",
    "empty": "You're not tracking any topics yet. Add your first one!",
    "add_topic": "Add Topic",
    "last_checked": "Last checked",
    "new_facts": "new facts"
  },
  "topic": {
    "check_now": "Check Now",
    "original_article": "Original article",
    "facts_timeline": "Facts Timeline",
    "initial_facts": "Known at start",
    "discovered": "Discovered"
  }
}
```

WAŻNE: Tłumaczenia dotyczą UI aplikacji. Treści generowane przez AI (tytuły tematów, fakty) są w języku oryginalnego artykułu — nie tłumaczymy ich.

## Komunikacja z API

### Klient API

Centralny moduł `lib/api/client.ts` obsługujący:
- Base URL z `PUBLIC_API_URL` (`https://pulseapi.nightowls.cc`)
- Automatyczne dołączanie credentials: `credentials: 'include'` w każdym fetch (cookies z JWT)
- Obsługa błędów: 401 → przekierowanie na login, 403 → brak kredytów, 429 → rate limit
- Typowane response'y (TypeScript generics)

### Auth flow

1. **Magic link**: User wpisuje email → `POST /auth/magic-link` → mail z linkiem → user klika → trafia na `/auth/verify?token=xxx` → frontend wywołuje `POST /auth/verify` z tokenem → backend ustawia httpOnly cookie → redirect na dashboard
2. **Google OAuth**: User klika przycisk → redirect do Google → Google wraca na `/auth/callback` → frontend wysyła code do `POST /auth/google` → backend ustawia httpOnly cookie → redirect na dashboard

### Obsługa stanów ładowania

Każdy widok powinien obsługiwać trzy stany:
- **Loading** — skeleton/spinner podczas ładowania danych
- **Dane** — normalny widok
- **Błąd** — komunikat z opcją ponowienia
- **Pusty stan** — informacja i CTA (szczególnie na dashboardzie)

## Wytyczne designu

### Ogólne zasady
- Minimalistyczny, czysty design
- Brak emoji w interfejsie
- Czytelna typografia, dużo białej przestrzeni
- Mobile-first — aplikacja musi wyglądać dobrze przede wszystkim na telefonie
- Maksymalnie 2-3 kolory akcentowe
- Ciemny motyw (dark mode) jako domyślny — opcjonalnie przełącznik light/dark

### Interakcje
- Natychmiastowy feedback na akcje użytkownika (optimistic updates gdzie możliwe)
- Animacje: subtilne i funkcjonalne, nie dekoracyjne
- Pull-to-refresh na dashboardzie (mobilnie)

## Deploy (Dokku)

### Dockerfile

SvelteKit budowany z adapterem Node (`@sveltejs/adapter-node`). Dockerfile powinien:
1. Zainstalować zależności (`npm ci`)
2. Zbudować aplikację (`npm run build`)
3. Uruchomić serwer Node (`node build`)

### Konfiguracja Dokku

Serwer: `46.62.251.108`, port SSH: `47832`. Deploy przez git push (SSH config `dokku-hetzner` jest już skonfigurowany).

```bash
# Stworzenie aplikacji
dokku apps:create pulsefeed-app

# Zmienne środowiskowe
dokku config:set pulsefeed-app \
  PUBLIC_API_URL=https://pulseapi.nightowls.cc \
  PUBLIC_APP_URL=https://pulseapp.nightowls.cc \
  PUBLIC_GOOGLE_CLIENT_ID=placeholder

# Domena
dokku domains:set pulsefeed-app pulseapp.nightowls.cc

# Porty
dokku ports:set pulsefeed-app http:80:3000 https:443:3000

# SSL (rekord DNS A dla pulseapp.nightowls.cc → 46.62.251.108 musi istnieć w Cloudflare)
dokku letsencrypt:enable pulsefeed-app
```

### Deploy

```bash
# Lokalnie, w katalogu projektu
git remote add dokku dokku-hetzner:pulsefeed-app
git push dokku main
```

## Uruchomienie lokalne

```bash
# Klonowanie
git clone <repo-url>
cd app

# Zależności
npm install

# Zmienne środowiskowe
cp .env.example .env
# Uzupełnij .env

# Uruchomienie dev
npm run dev

# Build
npm run build

# Preview buildu
npm run preview
```

## Wytyczne dla AI (Claude Code)

### Styl kodu
- TypeScript strict mode
- Svelte 5 (runes syntax: $state, $derived, $effect)
- Komponenty: jeden komponent = jeden plik .svelte
- Logika biznesowa w lib/, nie w komponentach
- Nazewnictwo: PascalCase dla komponentów, camelCase dla funkcji/zmiennych

### Dostępność (a11y)
- Semantic HTML (nav, main, article, button — nie div z onClick)
- ARIA labels na interaktywnych elementach
- Obsługa klawiatury (tab, enter, escape)
- Odpowiedni kontrast kolorów

### Responsywność
- Mobile-first: projektuj najpierw na 375px, potem rozszerzaj
- Breakpointy Tailwind: sm (640px), md (768px), lg (1024px)
- Dashboard: 1 kolumna na mobile, 2 na tablet, 3 na desktop
- Nawigacja: bottom bar na mobile, sidebar lub top bar na desktop

### Estetyka
- Zen design: minimalizm, czystość, dobra typografia, minimalny dodatkowy element
- Ciemny motyw: #1a1a2e jako domyślny, przełącznik light/dark
- Typografia: czytelna, dużo białej przestrzeni
- Kolory: maksymalnie 2-3 akcenty
- Animacje: subtilne i funkcjonalne, nie dekoracyjne
- Responsywność: mobile-first, breakpointy Tailwind
