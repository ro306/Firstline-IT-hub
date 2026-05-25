# Firstline IT Hub — Asset Management

Asset Management module for the Firstline IT Hub platform.

## Architecture

| Layer    | Tech                                     | Location  |
| -------- | ---------------------------------------- | --------- |
| Backend  | C# / ASP.NET Core (.NET 9) Web API       | `api/`    |
| Frontend | React 19 + Vite + Tailwind CSS v4 (TS)   | `web/`    |
| Database | PostgreSQL                               | container |
| Auth     | Logto (delivered by the platform team)   | external  |
| Hosting  | Docker — one container per app           | -         |

The Asset Management module integrates with sibling modules owned by the
platform team (tenant management, permission management, IAM, integration
hub, external integrations).

## Status

- [x] Frontend shell scaffolded (`web/`)
- [ ] Backend API (`api/`) — .NET 9 Web API
- [ ] PostgreSQL schema and EF Core migrations
- [ ] Logto auth wiring (frontend + API)
- [ ] Docker / docker-compose orchestration

See `web/README.md` for frontend-specific instructions.
