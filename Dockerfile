FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# PUBLIC_* env vars are inlined at build time by Vite — set them in Dokku config:
# dokku config:set pulsefeed-app PUBLIC_API_URL=https://pulseapi.nightowls.cc ...
ARG PUBLIC_API_URL
ARG PUBLIC_APP_URL
ARG PUBLIC_GOOGLE_CLIENT_ID

RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim

WORKDIR /app

# adapter-node produces a self-contained build directory
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "build/index.js"]
