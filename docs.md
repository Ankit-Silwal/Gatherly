# Gatherly — Current Project Documentation

This document captures what has been built in the repository so far.

## 1) Monorepo Overview

Gatherly is a Turborepo/Bun monorepo with:

- `apps/api` — Express + PostgreSQL + Redis backend (main implementation)
- `apps/web` — Next.js frontend (currently starter UI)
- `packages/ui` — shared React UI components
- `packages/eslint-config` — shared lint rules
- `packages/typescript-config` — shared TypeScript configs

Root scripts (`package.json`):

- `build` → `turbo run build`
- `dev` → `bun run --workspaces --parallel --if-present dev`
- `lint` → `turbo run lint`
- `check-types` → `turbo run check-types`
- `format` → Prettier for `ts/tsx/md`

---

## 2) Backend (`apps/api`) Summary

### Runtime + Stack

- Runtime: Bun (`type: module`)
- Framework: Express 5
- DB: PostgreSQL (`pg`)
- Cache/session/OTP: Redis
- Auth: Cookie-based session (`sessionId` cookie)
- Email: Nodemailer (SMTP)

### Server Bootstrap

- `index.ts`: loads env with `dotenv`, starts HTTP server
- `app.ts`: configures middlewares (`express.json`, `cors`, `cookie-parser`), initializes DB/Redis, mounts routes, and exposes `/health`

### Mounted Route Prefixes

From `routes.ts`:

- `/auth` → auth routes
- `/server` → server routes
- `/servers/:serverId` → member routes
- `/server/:serverId/channels` → channel routes

---

## 3) Environment Variables (used currently)

Backend reads:

- `PORT`
- `POSTGRES_PASSWORD`
- `DATABASE_NAME`
- `REDIS_URL`
- `SMTP_USER`
- `SMTP_PASS`

---

## 4) Auth & Session System

### Session Flow

- On login, backend creates Redis session (`session:<sessionId>`) with metadata:
  - `userId`, `createdAt`, `expiresAt`, `ip`, `userAgent`
- Session IDs are tracked in Redis set: `user:sessions:<userId>`
- Cookie `sessionId` is set on successful login
- Middleware `requireSession`:
  - reads cookie
  - validates Redis session
  - attaches `req.userId`

### OTP Flow

- Registration OTP key: `verify:otp:<userId>`
- Forgot-password OTP key: `verify:forgotPasswordOtp:<userId>`
- OTP TTL: 300 seconds
- Forgot-password verification grants temporary reset permission in Redis key:
  - `security:changePassword:<userId>` (5-minute TTL)

### Password Policy

`checkStrongPassword` enforces:

- min length 8
- uppercase + lowercase
- number
- special character

---

## 5) Authorization Middlewares

`serverRoleAuth.ts` provides:

- `checkServerAdmin`
- `checkServerModerator`
- `checkServerAdminOrModerator`

All read `req.userId` + `req.params.serverId`, fetch role from `server_members`, and gate access accordingly.

---

## 6) API Endpoints Implemented

## Auth (`/auth`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/register` | No | Register user + send verification OTP |
| POST | `/verify` | No | Verify initial registration OTP |
| POST | `/resend-otp` | No | Resend verification OTP |
| POST | `/verify-resent-otp` | No | Verify resent registration OTP |
| POST | `/login` | No | Login + set `sessionId` cookie |
| GET | `/me` | Yes (`requireSession`) | Get current user profile |
| POST | `/forgot-password` | No | Send forgot-password OTP |
| POST | `/forgot-password/resend-otp` | No | Resend forgot-password OTP |
| POST | `/forgot-password/verify` | No | Verify forgot-password OTP |
| POST | `/forgot-password/verify-resent-otp` | No | Verify resent forgot-password OTP |
| PATCH | `/forgot-password/change` | No (OTP-gated) | Change password after OTP verify |
| PATCH | `/change-password` | Yes (`requireSession`) | Change password while logged in |
| GET | `/sessions` | Yes (`requireSession`) | List user sessions |
| DELETE | `/sessions/current` | Yes (`requireSession`) | Logout current session |
| DELETE | `/sessions` | Yes (`requireSession`) | Logout all sessions |
| DELETE | `/sessions/:sessionId` | Yes (`requireSession`) | Logout specific session |

## Server (`/server`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/create` | Yes (`requireSession`) | Create a server and owner membership |
| POST | `/join` | Yes (`requireSession`) | Join server by invite code |
| GET | `/` | Yes (`requireSession`) | Get all servers of current user |
| GET | `/:serverId` | Yes (`requireSession`) | Get server details (currently member count) |
| DELETE | `/:sessionId` | Yes (`requireSession`) | Delete server if requester is owner |

## Members (`/servers/:serverId`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/` | Yes (`requireSession`) | Get members in server |
| PATCH | `/:userId` | Yes + `checkServerAdmin` | Change member role |
| DELETE | `/:userId` | Yes + `checkServerAdminOrModerator` | Kick member |

## Channels (`/server/:serverId/channels`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/` | `checkServerAdminOrModerator` | Create a channel in server |

---

## 7) Database Interaction Areas

Current queries touch these logical tables:

- `users`
- `servers`
- `server_members`
- `channels`

No Prisma or ORM is used currently; queries are written directly with `pg`.

---

## 8) Frontend (`apps/web`) Current State

- Next.js app scaffold is present
- Home page is default starter-style page
- Imports and uses shared `@repo/ui/button`
- No Gatherly-specific API integration implemented yet

Scripts:

- `dev` → `next dev --port 3000`
- `build` → `next build`
- `start` → `next start`
- `lint` / `check-types`

---

## 9) Shared UI Package (`packages/ui`)

Current exported components:

- `button.tsx`
- `card.tsx`
- `code.tsx`

`button.tsx` is client-side and currently shows a demo alert (`Hello from your <appName> app!`).

---

## 10) Recent Fixes Applied

- Fixed `apps/api/src/modules/channel/channel.controller.ts` type errors by:
  - importing Express `Request/Response` types
  - normalizing `serverId` param to string
  - removing invalid direct call to role middleware inside controller

Channel role check is now correctly handled at route level in `channel.routes.ts`.

---

## 11) Current Status Snapshot

What is working conceptually now:

- Auth with verification OTP and login sessions
- Session-protected user endpoints
- Server creation/join/list/details/delete
- Member listing/role-change/kick flows
- Channel creation endpoint with role guard

What is still early-stage:

- Frontend product UI and API wiring
- Tests and formal API docs (OpenAPI/Swagger)
- Migration/schema management docs

---

## 12) Quick Start (current)

From repo root:

1. Install dependencies
   - `bun install`
2. Ensure PostgreSQL + Redis are running
3. Set required env variables
4. Start all workspaces
   - `bun run dev`

Or API only:

- `cd apps/api && bun run dev`

Or Web only:

- `cd apps/web && bun run dev`
