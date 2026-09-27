# Owlo App

> **Work in progress.** This is a personal side project, not a finished or maintained product — expect rough edges and missing pieces.

SvelteKit PWA frontend for Owlo — a service that tracks how a specific news story develops over time. See [owlo-api](https://github.com/dawidklimczak/owlo-api) for the backend and the product idea in more detail.

## What it does

You log in, paste in an article URL (or, on a phone, just tap "Share" on any article and pick Owlo from the share sheet), and the app tracks that story going forward. The dashboard shows tracked topics as cards, newest-updates-first, and each topic's detail page is a chronological timeline of the facts discovered about it — the facts from the original article are visually distinguished from ones discovered later.

## Notable pieces

- **Web Share Target** — installed as a PWA, Owlo registers as a share target, so "add this article" is a native OS share action on mobile rather than a copy-paste-into-the-app flow. Handled in `routes/share-target/+page.svelte`; if the user isn't logged in yet, the shared URL is stashed in `sessionStorage` and picked up again after login.
- **Auth** — Google OAuth or a passwordless magic link; either way the backend sets an httpOnly cookie, so the API client always sends `credentials: 'include'` and there's no token handling in the frontend at all.
- **i18n** — UI strings are translated (starting with English and Polish), but AI-generated content (topic titles, extracted facts) is deliberately **not** translated — it stays in the source article's language, since translating it would misrepresent what was actually reported.
- **Guided topic-add flow** — paste a URL, wait for the AI's 1–3 topic proposals, pick one (or auto-confirm if there's only one candidate), done. See `AddTopicModal.svelte` / `TopicChoiceStep.svelte`.

## Stack

- **SvelteKit** + TypeScript, Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Tailwind CSS**, mobile-first, dark theme by default
- **`@vite-pwa/sveltekit`** for the service worker, installability, and Web Share Target manifest entry
- No component library — everything under `lib/components/` is custom, kept deliberately minimal

## Running locally

```bash
npm install
cp .env.example .env    # fill in the values below
npm run dev              # http://localhost:5173

npm run build && npm run preview   # production build
```

### Environment variables

```env
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_URL=https://app.example.com
PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

The app expects the [owlo-api](https://github.com/dawidklimczak/owlo-api) backend to be running and reachable at `PUBLIC_API_URL`.

## Project layout

```
src/
├── lib/
│   ├── api/            fetch client + typed endpoints (auth, topics, users)
│   ├── components/      TopicCard, TopicTimeline, FactItem, AddTopicModal, ...
│   ├── stores/          auth, topics, notifications
│   ├── i18n/            en.json / pl.json + language-selection logic
│   └── utils/           date formatting, Web Share Target parsing
├── routes/
│   ├── +page.svelte             dashboard — tracked topics
│   ├── login/                    Google OAuth + magic link
│   ├── auth/callback|verify/     OAuth / magic-link landing pages
│   ├── topic/[id]/               topic detail + fact timeline
│   ├── settings/
│   └── share-target/             Web Share Target handler
└── service-worker.ts
```

## Deployment

Built with `@sveltejs/adapter-node` and served with `node build`; ships as a single Dokku app behind Let's Encrypt.
