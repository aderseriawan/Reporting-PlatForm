# PRD - VAPT Reporting Platform

## 1. Product Vision
Build a secure, audit-friendly VAPT reporting platform that helps pentest teams produce high quality vulnerability reports faster, with controlled AI refinement.

## 2. Personas
- Security Manager: oversees project progress and report quality.
- Lead Pentester: assigns work, reviews findings, publishes reports.
- Pentester: creates and updates vulnerability cases.
- Client Stakeholder: consumes final reports.

## 3. Core User Flows
1. Login and open dashboard.
2. Create client and project.
3. Add case with CVSS v4 scoring and rich text evidence.
4. Run AI Refine on selected sections.
5. Review and apply refined content.
6. Generate report version and publish.
7. Track notifications for updates.

## 4. Functional Requirements

### Authentication
- Username/password login.
- Profile endpoint and server-side role validation.

### Clients
- List, create, update, delete clients.
- Search, sort, pagination.

### Projects
- List, create, update, delete projects.
- Associate with client, lead pentester, pentesters, assets.

### Cases
- Create and edit case metadata.
- CVSS v4 metric selection and computed score/vector.
- Rich text sections:
  - Description
  - Threat and Risk
  - Recommendation
  - Reference
  - Steps to Reproduce
  - Retest Result

### AI Refine
- Available in section editor.
- UX state: `Refining...` -> preview -> `Cancel` / `Apply`.
- Preserve factual data and exploit evidence.

### Notifications
- Unread counter.
- Notification list by category.

### Reports
- Create report snapshots by project.
- Keep version history and status.

## 5. Non-Functional Requirements
- Strict schema validation for API input/output.
- Audit logs on critical actions.
- HTML sanitization for rich text.
- Server-side RBAC checks.
- Responsive UI for desktop and mobile.

## 6. Success Metrics
- 50% reduction in manual editing time for report narrative sections.
- <2 seconds median response on core list pages.
- 99.9% successful save operations for case updates.
- Zero unauthorized access incidents.

## 7. Out of Scope (Phase 1)
- Multi-tenant billing.
- Public report sharing portal.
- Native mobile app.
