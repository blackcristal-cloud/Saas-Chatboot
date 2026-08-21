# plan.md — SaaS Chatbot Management (React + FastAPI + MongoDB)

## 1) Objectives
- **Deliver a complete SaaS chatbot management MVP** with:
  - **Client Panel**: Login (mock via seletor de empresa), **Dashboard**, **Treinamento**, **Canais**.
  - **Admin Panel**: `/admin` login (mock), **Empresas**, **Empresa (detalhe)**, **Licenças**.
- **Port faithfully** the provided `license.js` + `seed.js` logic to FastAPI + MongoDB:
  - Collections: `companies`, `licenses`, `channels_config`, `sync_logs`, plus `bot_config` and `dashboard_metrics`.
- **UX requirements**:
  - **PT-BR + English** language toggle.
  - **Dark (default) + Light** theme toggle.
  - Shadcn/UI + Tailwind, premium B2B dashboard style.
  - `data-testid` on interactive/critical elements.
- Provide backend API under `/api/*`.
- Ensure quality with E2E verification using `testing_agent_v3`.

**Current status**: Phase 1 + Phase 2 **completed**, E2E **31/31 passed**, demo reseeded to pristine state.

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation): License + Seed + Minimal API verification ✅ (COMPLETED)
**User stories**
1. As a developer, I want to seed the database idempotently so I can reset the environment quickly.
2. As a developer, I want to issue a license token that expires correctly so billing behavior is reliable.
3. As a developer, I want to renew a license from the later of (now, expiration) so renewals never shorten access.
4. As a developer, I want to verify tokens and return clear errors so the UI can show correct banners.
5. As an admin, I want company c2 to be expired by default so I can validate the “license expired” banner.

**Steps implemented**
- Implemented `backend/license_utils.py` (PyJWT) mirroring JS semantics:
  - `issue_license(company_id, plan, days)`
  - `renew_license(existing_license, plan)` extending from `max(expirationDate, now)`
  - `verify_license(token)` -> `{valid, payload|error}`
  - `get_license_status(license_doc)` -> `expired|active|<license.status>`
- Implemented `backend/seed_service.py` to mirror JS seed:
  - 3 mock companies: c1/c2/c3 with deployment types.
  - Licenses seeded with **c2 forced expired (-5 days)**.
  - Channels seeded for 5 types; **TikTok always `pending_approval`**.
  - `sync_logs` seeded for c3 (on_premise) with heartbeat (2h ago), version `v1.2.0`, aggregated metrics.
  - Idempotent: clears and repopulates collections.
- Wrote and ran `backend/scripts/poc_license_seed_test.py`.

**Deliverables / Results**
- POC script passed **18/18** checks (seed idempotent, JWT behaviors, c2 expired, TikTok pending).

---

### Phase 2 — V1 App Development (Client + Admin) + 1st E2E test ✅ (COMPLETED)
**User stories**
1. As a client user, I want to choose my company on a login screen so I can access my panel without real auth.
2. As a client user, I want to see a persistent “license expired” banner so I know service is limited.
3. As a client user, I want to connect channels via modals (QR/token/OAuth/embed) so I can activate integrations.
4. As a client user, I want to edit Treinamento (persona/instructions/FAQ) so my bot behavior is configurable.
5. As an admin, I want to view companies with license status badges so I can spot expired accounts quickly.
6. As an admin, I want to renew a license after payment confirmation so access is restored immediately.

**Backend (FastAPI) — Implemented**
- Collections:
  - `companies`, `licenses`, `channels_config`, `sync_logs`, `bot_config`, `dashboard_metrics`
- Routes implemented:
  - `POST /api/seed`
  - `POST /api/admin/login` (mock fixed credentials)
  - `GET /api/companies`, `GET /api/companies/{id}` (includes license join + computed status + channels + syncLog)
  - `GET /api/licenses`, `POST /api/licenses` (issue), `POST /api/licenses/{id}/renew`
  - `GET /api/license/status?companyId=` (JWT verify + computed status)
  - `GET /api/channels/{companyId}`, `PUT /api/channels/{companyId}/{channelType}` (TikTok blocked)
  - `GET/PUT /api/bot-config/{companyId}`
  - `GET /api/dashboard/{companyId}`
- Auto-seed on backend startup if DB empty.
- Fixed `.env` formatting and set `LICENSE_SECRET` (note: changing secret requires reseeding to re-sign tokens).

**Frontend (React) — Implemented**
- Client routes:
  - `/login`, `/app/dashboard`, `/app/treinamento`, `/app/canais`
- Admin routes:
  - `/admin` (login), `/admin/empresas`, `/admin/empresas/:id`, `/admin/licencas`
- Shells:
  - `AppShell` (client) + `AdminShell` (admin) with sidebar navigation.
- Features:
  - i18n toggle **PT-BR / EN**.
  - theme toggle **dark / light** (dark default).
  - Client:
    - Dashboard: metric cards + weekly chart (Recharts)
    - Treinamento: persona/tone/instructions + dynamic FAQ list persisted to backend
    - Canais: 5 channel cards with toggles and modals:
      - WhatsApp QR (simulated)
      - Telegram token input
      - Instagram simulated OAuth (loading -> linked handle)
      - Webchat embed code + copy
      - TikTok disabled: “Em breve / Sujeito a aprovação”
    - `LicenseBanner`: shown when license expired; dismissible but reappears on reload; CTA “Falar com o suporte”.
  - Admin:
    - Empresas table with status badges
    - Company detail shows deployment + sync logs for on-premise
    - Licenças issue + renew (“Confirmar Pagamento e Renovar”)
- `data-testid` coverage added across interactive elements.

**Testing (E2E) — Completed**
- `testing_agent_v3` ran and passed **31/31** tests:
  - Backend: **13/13 passed**
  - Frontend: **18/18 passed**
- Demo data reseeded to pristine state after testing.

---

### Phase 3 — Hardening, UX polish, edge cases + 2nd E2E test ✅ (MOSTLY COMPLETED)
**User stories**
1. As a user, I want to see loading/empty/error states so the app feels reliable.
2. As a user, I want language and theme preferences to persist so I don’t need to reconfigure.
3. As an admin, I want safe renew/issue validations so I don’t create broken licenses.
4. As a client user, I want channel status to reflect backend truth after refresh so I trust the UI.
5. As a developer, I want clear logs and consistent API error shapes so debugging is fast.

**Status / What is already covered**
- Loading states via Skeletons on main screens.
- Persistence via `localStorage`: theme, language, selected company, admin token.
- Backend validation for plan/channelType/status and TikTok blocked.
- User feedback via toasts.
- E2E verification already passed.

**Remaining optional polish (if desired)**
- Standardize API error envelopes across all endpoints (today mostly uses `HTTPException.detail`).
- Add lightweight unit tests for `license_utils.py` (beyond POC script).
- Add monitoring-friendly structured logs + request IDs.

---

### Phase 4 — Optional production-oriented improvements (only after approval) ⏳ (PENDING)
**User stories**
1. As an admin, I want real authentication/authorization so the admin area is protected.
2. As a client, I want per-user accounts so multiple staff can manage one company.
3. As an operator, I want audit logs so changes are traceable.
4. As a client, I want role-based permissions so only managers can edit channels.
5. As a developer, I want pagination/search so large datasets remain fast.

**Potential steps**
- Real auth (JWT sessions, refresh tokens), RBAC.
- Pagination/search/filtering on Admin tables.
- Audit log collection for changes (licenses, channels, training).
- Rate limiting + basic abuse protection.

**Additional optional deliverables (not implemented yet; available on request)**
- Generate **docker-compose “Enterprise package”** for on-premise deployments.
- Scaffold **sync-agent** skeleton for on-premise heartbeat + metrics sync.

---

## 3) Next Actions
1. **Optional**: implement any remaining Phase 3 polish items (standard error envelopes, unit tests, logging).
2. **If approved**: start Phase 4 production improvements (real auth, RBAC, audit logs, pagination).
3. **If requested**: generate downloadable artifacts for docker-compose enterprise package + sync-agent skeleton.

---

## 4) Success Criteria
✅ Completed (current)
- `POST /api/seed` reliably repopulates DB; c2 is expired by default.
- License issue/renew/verify matches JS behavior (dates, token expiry, status).
- Client panel: Dashboard/Treinamento/Canais fully functional; channel configs persist.
- License expired banner appears for expired company and reappears after reload; disappears after admin issue/renew.
- Admin panel: companies table + detail + licenses issue/renew work.
- i18n (PT-BR/EN) + theme (dark/light) toggles work and persist.
- `testing_agent_v3` E2E passes for core flows without manual fixes (**31/31**).

⏳ Optional (future)
- Production-grade auth/RBAC, audit logs, pagination/search.
- On-premise enterprise packaging + sync-agent deliverables.