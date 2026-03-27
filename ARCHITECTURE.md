# Architecture - Next.js + FastAPI VAPT Platform

## 1. System Context
- Frontend SPA/SSR hybrid: Next.js App Router (`apps/web`).
- Backend API: FastAPI (`apps/api`).
- Data: PostgreSQL.
- Async/queue: Redis + worker.
- AI provider adapter service for content refinement.

## 2. High-Level Components
- `web`: UI routes, forms, tables, rich text editor, auth session handling.
- `api`: REST endpoints, validation, RBAC, business rules.
- `db`: persistent entities (clients, projects, cases, reports, notifications).
- `worker`: background jobs (AI refine, report generation if needed).
- `audit`: immutable audit log for critical changes.

## 3. Frontend Layering
- Route layer (`app/`): pages and layouts.
- Feature UI (`components/`): table, form, sidebar, editor, cvss matrix.
- Data layer (`lib/`): typed API client + shared DTOs.
- State layer: TanStack Query for server state.

## 4. Backend Layering
- Router: request entrypoint and response models.
- Service: domain logic and orchestration.
- Repository: DB access abstraction.
- Schema: strict request/response contracts.

## 5. AI Refine Sequence
1. User clicks `AI Refine` in section editor.
2. Frontend sends `POST /cases/refine` with `case_id`, `section`, and `raw_content_html`.
3. API validates payload, checks RBAC, logs request context.
4. AI adapter sends constrained prompt to model.
5. API returns:
   - `refined_content_html`
   - `changes_summary`
   - `risk_flags`
6. Frontend renders preview and asks user to `Cancel` or `Apply`.

## 6. Security Controls
- JWT auth with short-lived access token.
- Role checks at endpoint level.
- Rich text sanitize before persistence and before render.
- Audit log on case status/content/CVSS changes.
- Rate limit `POST /cases/refine`.

## 7. Data Entities (Core)
- `users`, `roles`, `user_roles`
- `clients`
- `projects`, `project_members`, `project_assets`
- `cases`, `case_cvss`, `case_contents`
- `reports`, `report_versions`
- `notifications`
- `audit_logs`

## 8. Deployment Model
- Frontend on Vercel or containerized Node runtime.
- API on container platform (K8s, ECS, or VM with Gunicorn/Uvicorn).
- Managed PostgreSQL and Redis.
- Observability: OpenTelemetry + centralized logs.
