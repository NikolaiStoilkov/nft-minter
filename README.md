# NFT Trader — Mint, Collect & Trade NFTs

A complete NFT marketplace built with **Next.js 16**, **Firebase**, **thirdweb**, **shadcn/ui**, **Zustand**, and **TanStack Query**. Uses **hexagonal architecture** throughout — both frontend and backend. **Functions only, no classes.**

## Architecture (Hexagonal)

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│                                                         │
│  Pages ──► Hooks (TanStack Query) ──► Stores (Zustand)  │
│                      │                                  │
│              domain/ports.ts  (interfaces)               │
│                      │                                  │
│              adapters/*-adapter.ts  (Firebase impls)     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              BACKEND (Firebase Functions)                │
│                                                         │
│  index.ts (entry) ──► domain/ports.ts (interfaces)      │
│                              │                          │
│                   adapters/firestore-adapter.ts          │
└─────────────────────────────────────────────────────────┘
```

### Frontend Layers
- **`src/domain/`** — Pure types & port interfaces (no framework code)
- **`src/adapters/`** — Firebase implementations of ports
- **`src/stores/`** — Zustand state management
- **`src/hooks/`** — TanStack Query hooks (connect UI ↔ domain)
- **`src/components/ui/`** — shadcn/ui primitives
- **`src/components/`** — Feature components (Header, NFTCard)
- **`src/app/`** — Next.js pages & layouts

### Backend Layers
- **`functions/src/domain/`** — Types & port interfaces
- **`functions/src/adapters/`** — Firestore implementations
- **`functions/src/index.ts`** — Cloud Functions entry (4 microservices)

## Features

| Feature | Description |
|---------|-------------|
| 🎨 **Theme Toggle** | Light/dark mode with persisted preference |
| 🔐 **Google Auth** | Sign in with Google via Firebase Auth |
| 💎 **Mint NFTs** | 5 rarity tiers (Common → Legendary) with random generation |
| 📦 **Inventory** | View, filter by rarity, select for trading |
| 🔄 **P2P Trading** | Create/accept/reject/cancel trade offers |
| 📜 **Trade History** | Full audit trail of all completed trades |
| 👥 **User Discovery** | Search & browse other collectors |
| ☁️ **Firebase Functions** | 4 secure microservices for trade operations |

## Tech Stack

- **Next.js 16** — React framework
- **Firebase** — Auth, Firestore, Functions, Hosting
- **thirdweb** — Wallet connection infrastructure
- **shadcn/ui** — Radix + Tailwind component library
- **Zustand** — State management
- **TanStack Query** — Async data fetching & caching
- **Tailwind CSS 4** — Styling
- **Lucide React** — Icons
- **TypeScript** — Full type safety

## Pages

| Route | Description |
|-------|-------------|
| `/` | Fancy landing page with hero, rarity showcase, features |
| `/dashboard` | Overview with stats, mint button, recent NFTs |
| `/dashboard/inventory` | Full inventory with rarity filtering |
| `/dashboard/trade` | Find users, create trades, manage offers |
| `/dashboard/history` | Complete trade history log |

## Firebase Functions (Microservices)

| Function | Description |
|----------|-------------|
| `createTrade` | Validates ownership, creates pending trade |
| `acceptTrade` | Re-verifies ownership, executes NFT swap |
| `rejectTrade` | Marks trade as rejected, records history |
| `cancelTrade` | Marks trade as cancelled, records history |

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

2. **Environment variables** (`.env.local`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...
   ```

3. **Enable Google Auth** in Firebase Console → Authentication → Sign-in method → Google

4. **Run locally:**
   ```bash
   npm run dev
   ```

## Deploy

```bash
# Deploy everything (functions + hosting + rules)
npm run deploy

# Deploy only functions
npm run deploy:functions

# Deploy only hosting
npm run deploy:hosting

# Deploy only Firestore rules
npm run deploy:rules
```
