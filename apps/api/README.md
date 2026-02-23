# API Service (`apps/api`)

Express + PostgreSQL + Redis backend for Gatherly.

## Install

```bash
bun install
```

## Run (dev)

```bash
bun run dev
```

## Key Features

- Cookie session auth (`sessionId`) + Redis-backed session validation
- Server/channel/member/message APIs
- Socket.IO messaging (send/edit/delete/typing/presence/read)
- Rate limit for socket `send_message` via Redis (`INCR` + `EXPIRE`)
- Audit logs for message delete events (`server_audit_logs`)

## Logging

- Logger utility: `src/utils/logger.ts`
- Structured JSON logs written to:
	- `logs/combined.log`
	- `logs/error.log`
- Global Express error middleware logs path, method, and error
- Socket connect/disconnect lifecycle is logged

## Environment Variables

- `PORT`
- `POSTGRES_PASSWORD`
- `DATABASE_NAME`
- `REDIS_URL`
- `SMTP_USER`
- `SMTP_PASS`
