# AGENT.md - VAPT Reporting Platform + AI Refine

Dokumen ini adalah instruction set untuk membangun platform pelaporan VAPT seperti `vapt.dsg.id`.

Stack final yang dipakai:
- Frontend: Next.js (React + TypeScript)
- Backend: Python (FastAPI)
- DB: PostgreSQL
- Queue/Cache: Redis
- AI: LLM service untuk fitur Refine

Catatan:
- NuxtJS berbasis Vue, bukan React.
- Karena requirement React, gunakan Next.js.

## 1. Scope Produk

Platform harus menyediakan:
- Login dan role-based access
- Manajemen Clients dan Projects
- Manajemen Vulnerability Cases
- CVSS v4 scoring
- Rich text report sections
- AI Refine untuk peningkatan kualitas isi laporan
- Report versioning
- Notification center

## 2. Pola UI/UX yang Ditiru

- Login page: centered auth card, branding jelas, username/password, CTA tunggal.
- Main app: fixed left sidebar + topbar + card-based content.
- List pages (clients/projects): search, filter, create button, sortable table, pagination, row actions.
- Project detail: metadata project + case list + report versions.
- Case form: metadata + CVSS matrix + rich text editors + AI Refine per section.

## 3. Frontend Architecture (Next.js)

## 3.1 Tech
- Next.js App Router
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- TinyMCE atau TipTap untuk rich text

## 3.2 Route Map

```text
/(auth)/login
/(dashboard)/dashboard
/(dashboard)/clients
/(dashboard)/clients/create
/(dashboard)/clients/[id]
/(dashboard)/projects
/(dashboard)/projects/create
/(dashboard)/projects/[id]
/(dashboard)/cases/create
/(dashboard)/cases/[id]/edit
/(dashboard)/notifications
```

## 3.3 Component Rules
- Sidebar, Topbar, Table, Badge, Dialog, FormField reusable.
- Gunakan status badge konsisten: `On Progress`, `Fixing`, `Done`, `Submitted`.
- Pastikan responsive desktop/mobile.
- Semua control harus accessible (label, focus state, keyboard-friendly).

## 4. Backend Architecture (Python)

## 4.1 Tech
- FastAPI + Pydantic v2
- SQLAlchemy 2 + Alembic
- PostgreSQL
- Redis
- Celery/RQ untuk background job

## 4.2 Module Layout

```text
app/
  core/
  modules/
    auth/
    users/
    clients/
    projects/
    cases/
    reports/
    notifications/
    ai/
  models/
  schemas/
  services/
  repositories/
  tasks/
```

## 4.3 Minimal API Contract

- Auth:
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `GET /auth/my-profile`
- Dashboard:
  - `GET /dashboard/getSidebarItems`
- Clients:
  - `GET /clients`
  - `POST /clients`
  - `GET /clients/{id}`
  - `PATCH /clients/{id}`
  - `DELETE /clients/{id}`
- Projects:
  - `GET /projects`
  - `POST /projects`
  - `GET /projects/{id}`
  - `PATCH /projects/{id}`
  - `DELETE /projects/{id}`
- Cases:
  - `GET /cases/{id}`
  - `POST /cases`
  - `PATCH /cases/{id}`
  - `DELETE /cases/{id}`
  - `POST /cases/refine`
- Notifications:
  - `GET /notifications`
  - `GET /notifications/unread/count`
  - `POST /notifications/mark-all-read`
- Reports:
  - `GET /projects/{id}/reports`
  - `POST /projects/{id}/reports`
  - `POST /reports/{id}/publish`

## 5. Data Model (Ringkas)

Minimal table:
- `users`, `roles`, `user_roles`
- `clients`
- `projects`, `project_members`, `project_assets`
- `cases`, `case_cvss`, `case_contents`
- `reports`, `report_versions`
- `notifications`
- `audit_logs`

Semua entity penting wajib punya `created_at`, `updated_at`, `created_by`, `updated_by`.

## 6. AI Refine Spec (Wajib)

## 6.1 Tujuan
AI Refine harus meningkatkan kejelasan tulisan, struktur, dan konsistensi report tanpa mengubah fakta teknis.

## 6.2 Input `POST /cases/refine`
- `case_id`
- `section`: `description | threat_risk | recommendation | reference | retest_result`
- `raw_content_html`
- `context`: judul case, CWE, asset, CVSS score/severity/vector, nama project

## 6.3 Output
- `refined_content_html`
- `changes_summary`
- `risk_flags`
- `model_info`

## 6.4 UI Behavior
- Klik AI Refine -> tombol jadi loading (`Refining...`).
- Setelah respons -> tampilkan preview refine + tombol `Cancel` dan `Apply`.
- `Cancel` mengembalikan konten lama.
- `Apply` mengganti konten editor dengan hasil refine.

## 6.5 Prompt Guardrails
- Dilarang mengarang fakta.
- Dilarang mengubah data CVSS dan detail bukti.
- Wajib mempertahankan payload, IOC, endpoint, dan referensi.
- Gunakan bahasa profesional audit-ready.
- Jika input minim, keluarkan struktur/template, bukan halusinasi.

## 7. Security Checklist

- JWT access + refresh token rotation
- RBAC per endpoint
- Sanitasi HTML rich text (backend + frontend)
- CSP, secure cookie, HSTS
- Audit log untuk perubahan critical
- Rate limit endpoint AI
- Secret redaction sebelum kirim ke LLM

## 8. Milestone Delivery

1. Foundation: auth + app layout + navigation
2. Master Data: clients + projects + table UX lengkap
3. Cases: form metadata + CVSS + editor
4. AI Refine: endpoint + UX apply/cancel
5. Reports + Notifications
6. Hardening: tests, perf, security validation

## 9. Definition of Done

Selesai jika:
- Unit test lulus
- API integration test lulus
- E2E Playwright lulus untuk flow utama:
  - login
  - create project
  - create case
  - refine content
  - generate report
- Tidak ada high severity finding pada security check internal

## 10. Agent Working Rules

Saat agent implementasi:
- Ikuti pola komponen dan naming yang sudah ada
- Tidak boleh bypass type safety
- Endpoint baru wajib schema request/response
- Perubahan data case wajib tercatat di audit log
- Fitur AI wajib punya fallback jika provider gagal
