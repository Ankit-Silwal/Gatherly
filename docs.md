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
- Logging: Winston (`logs/combined.log`, `logs/error.log`)

### Server Bootstrap

- `index.ts`: loads env with `dotenv`, starts HTTP server
- `app.ts`: configures middlewares (`express.json`, `cors`, `cookie-parser`), initializes DB/Redis, mounts routes, exposes `/health`, and includes global error logging middleware

### Mounted Route Prefixes

From `routes.ts`:

- `/auth` → auth routes
- `/server` → server routes
- `/servers/:serverId` → member routes
- `/server/:serverId/channels` → channel routes
- `/server/:serverId/channels/:channelId/messages` → message routes

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
| POST | `/server/:serverId/channels` | `checkServerAdminOrModerator` | Create a channel in server |
| GET | `/server/:serverId/channels` | Member | Get all channels in server |
| PATCH | `/server/:serverId/channels/:channelId` | `checkServerAdminOrModerator` | Rename a channel |
| DELETE | `/server/:serverId/channels/:channelId` | `checkServerAdminOrModerator` (Owner only for delete) | Delete a channel |

## Messages (`/server/:serverId/channels/:channelId/messages`)

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/` | Yes (`requireSession`) | Create message in channel |
| GET | `/` | Yes (`requireSession`) | List channel messages (cursor + limit supported) |
| PATCH | `/:messageId` | Yes (`requireSession`) | Edit own message |
| DELETE | `/:messageId` | Yes (`requireSession`) | Delete message (sender/admin/moderator/owner logic via service) |

---

## 7) Real-time Messaging (Socket.IO)

`message.socket.ts` currently handles:

- Presence tracking with Redis + in-memory socket map
  - emits `user-online` and `user_offline`
  - logs `Socket connected` and `Socket disconnected`
- Channel room operations
  - `join_channel`, `leave_channel`
- Message events
  - `send_message` → emits `receive_message`
  - `edit_message` → emits `message_updated`
  - `delete_message` → emits `message_deleted`
- Typing indicators
  - `start_typing` → emits `user_typing`
  - `stop_typing` → emits `user_stop_typing`
- Read receipts
  - `mark_read` updates `channel_reads`

### Send-message rate limiting

- Redis key format: `rate:<userId>`
- Counter increments with `INCR`
- TTL set to 5 seconds on first increment
- If count exceeds 10 in window, socket emits `Rate limit exceeded`

---

## 8) Logging & Error Handling

- Logger: `apps/api/src/utils/logger.ts` (Winston JSON logs)
- Global Express error middleware logs unhandled errors with:
  - request path
  - HTTP method
  - error message
- Message service logs include:
  - `Message created` (`userId`, `channelId`, `messageId`)
  - `Unauthorized attempt` for invalid delete actions
  - `Message deleted` with server context
  - `Database transaction failed` for transaction errors

---

## 9) Database Interaction Areas

Current queries touch these logical tables:

- `users`
- `servers`
- `server_members`
- `channels`
- `messages`
- `channel_reads`
- `server_audit_logs`

No Prisma or ORM is used currently; queries are written directly with `pg`.

---

## 10) Frontend (`apps/web`) Current State

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

## 11) Shared UI Package (`packages/ui`)

Current exported components:

- `button.tsx`
- `card.tsx`
- `code.tsx`

`button.tsx` is client-side and currently shows a demo alert (`Hello from your <appName> app!`).

---

## 12) Recent Fixes Applied

- Fixed session/auth typing and import issues in middleware and session utilities.
- Moved `handleEditMessage` to `messages/message.controller.ts` (controller layer), while keeping DB logic in `messages/message.services.ts`.
- Fixed socket handler compile/runtime issues:
  - corrected map value usage for multiple sockets per user
  - fixed broken event handler structure/braces
  - fixed disconnect cleanup key (`userId` instead of `socket.id`)
- Added socket send-message rate limiting via Redis (`INCR` + `EXPIRE`).
- Updated message delete flow to return payload (`messageId`, `channel_id`) for socket broadcasts.
- Added `server_audit_logs` insert for `message_delete` actions.
- Added global Express unhandled error logging middleware.
- Added socket connect/disconnect logging.
- Added unauthorized/delete and transaction-failure logs for message delete flow.

---

## 13) Current Status Snapshot

What is working conceptually now:

- Auth with verification OTP and login sessions
- Session-protected user endpoints
- Server creation/join/list/details/delete
- Member listing/role-change/kick flows
- Channel creation endpoint with role guard
- Message create/list/edit/delete endpoints
- Real-time messaging events (send/edit/delete/typing/presence/read)
- Structured JSON logging for app/socket/message lifecycle and failures

What is still early-stage:

- Frontend product UI and API wiring
- Tests and formal API docs (OpenAPI/Swagger)
- Migration/schema management docs

---

## 14) Quick Start (current)

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
