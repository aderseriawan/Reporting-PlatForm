# AGENTS.md

This file defines implementation instructions for agents building the VAPT reporting platform.

## Objective
- Build a production-ready VAPT reporting system similar to `vapt.dsg.id`.
- Use Next.js (React) for frontend and FastAPI (Python) for backend.
- Include AI-assisted refinement for vulnerability report content.

## Product Requirements
- Authentication + profile session
- Client and project management
- Vulnerability case lifecycle and CVSS v4 scoring
- Rich text report sections
- AI Refine with `Cancel` and `Apply` workflow
- Notifications and report versioning

## Non-Negotiable Engineering Rules
- Keep type safety strict; do not bypass typing.
- Validate request and response schemas for all APIs.
- Persist audit logs for critical state/content changes.
- Sanitize rich text input and output.
- Keep role-based access checks server-side.

## AI Refine Rules
- Do not alter factual evidence (payloads, IOC, endpoint, CVSS values).
- Improve clarity, structure, and grammar only.
- Return `changes_summary` and `risk_flags` with result.
- If source content is weak, return a structured template without fabrication.

## API Baseline
- `POST /auth/login`
- `GET /auth/my-profile`
- `GET /dashboard/getSidebarItems`
- `GET /clients`, `POST /clients`
- `GET /projects`, `POST /projects`
- `GET /cases/{id}`, `POST /cases`, `PATCH /cases/{id}`
- `POST /cases/refine`
- `GET /notifications`, `GET /notifications/unread/count`

## Delivery Milestones
1. Foundation: auth, shell layout, navigation
2. Data management: clients/projects CRUD + tables
3. Case workflow: CVSS + rich text editor
4. AI Refine: endpoint + UX integration
5. Reports + notifications
6. Hardening: tests, security, observability
