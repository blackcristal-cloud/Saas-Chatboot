# PRD — SaaS Chatboot (Multi-channel Chatbot Management)

## Stack
- Frontend: React 19 (CRA + craco), Tailwind, shadcn/ui, Recharts, dark mode default + light, i18n PT-BR (default) / EN
- Backend: FastAPI + Motor (MongoDB), PyJWT for signed licenses
- Collections: companies, licenses, channels_config, sync_logs, bot_config, dashboard_metrics

## Core Logic (ported from user's license.js / seed.js)
- /app/backend/license_utils.py: issue_license, renew_license, verify_license, get_license_status (JWT HS256, env LICENSE_SECRET)
- /app/backend/seed_service.py: 3 mock companies (c1 Studio Bella Estetica/starter, c2 Pousada Vista Mar/pro FORCED EXPIRED -5d, c3 Grupo Imobiliario Prime/enterprise on_premise with sync_log v1.2.0)
- Auto-seed on backend startup if companies empty; POST /api/seed to reset anytime

## Features Delivered (Phase 2 complete, tested 31/31)
1. Client panel: /login (company selector mock login), /app/dashboard (4 metric cards + weekly Recharts chart), /app/treinamento (persona/tone/instructions/FAQs persisted), /app/canais (5 channel cards: WhatsApp QR modal simulated, Telegram token modal, Instagram simulated OAuth, WebChat copy embed, TikTok disabled 'Em breve / Sujeito a aprovacao'; toggles persist in channels_config)
2. License expired banner (LicenseBanner) via GET /api/license/status (verifyLicense), dismissible, reappears on reload, 'Falar com o suporte' opens WhatsApp
3. Admin panel /admin (mock login admin@saas.com/admin123): Empresas table (companies+licenses join, badges), company detail (channels, Cloud/On-Premise, sync logs), Licencas (issueLicense form + renewLicense 'Confirmar Pagamento e Renovar')

## API Routes (/api prefix)
seed(POST), admin/login(POST), companies(GET), companies/{id}(GET), licenses(GET/POST), licenses/{id}/renew(POST), license/status?companyId=(GET), channels/{companyId}(GET), channels/{companyId}/{type}(PUT, tiktok=400), bot-config/{companyId}(GET/PUT), dashboard/{companyId}(GET)

## Notes
- LICENSE_SECRET set in backend/.env; changing it invalidates seeded tokens (re-run /api/seed)
- Admin auth is MOCKED (fixed creds + localStorage token) — remind user before production deploy
- Not yet built (from user's original spec, out of web-app scope): docker-compose Enterprise package, sync-agent skeleton — can be generated as downloadable artifacts if requested
