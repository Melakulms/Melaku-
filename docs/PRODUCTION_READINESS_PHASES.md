# Mela v37 — Five-Phase Production Readiness Plan

This document is the execution gate for the remaining production work. A phase is not considered complete merely because the UI renders; the connected Supabase backend, authorization, QA evidence, and deployment environment must agree.

## Phase 1 — Baseline, QA and integration

### Automated gates
- `npm run build` succeeds.
- `npm run qa:public` runs both the legacy public smoke suite and `tests/e2e/mela-prelaunch.spec.ts`.
- Public shell remains usable when `/functions/v1/mela-web/api/health` is delayed or unavailable.
- Live question inventory is greater than 100,000.
- Verified work domains are at least 1,000.
- Verified education domains are at least 1,000.
- Language selectors and login entry remain accessible after language cycling.

### Current evidence
The synchronized backend reports 142,396 active questions, 1,022 verified work domains and 1,167 verified education domains. These satisfy the numerical thresholds in the Playwright acceptance test.

### Required implementation gate
The six-language test currently requires English, Amharic, Afaan Oromo, Tigrinya, Somali and Afar. The repository public shell currently exposes five selectors; Afar (`aa` / `aa-ET`) must be implemented in the frontend before Phase 1 can be marked green.

## Phase 2 — Backend, security and authorization

- Verify authentication, email confirmation, password recovery and role/profile creation end-to-end.
- Verify student, parent, teacher and company data isolation with RLS and direct-request abuse tests.
- Verify premium/free entitlements server-side; never rely on hidden frontend buttons for authorization.
- Verify payment status from the provider before granting premium entitlements.
- Review all protected RPCs and Edge Functions for anonymous execution.
- Remove redundant permissive RLS policies where safe without weakening access controls.
- Enable Supabase leaked-password protection before production.

### Current blockers
Supabase Security Advisor reports leaked-password protection disabled. Required launch inventory also records the leaked-password requirement as blocked. There are multiple permissive SELECT policies on lesson progress, student lesson progress and student module progress; these require policy consolidation after regression tests.

## Phase 3 — Complete application integration

Every production feature must use the same authenticated user/profile and backend source of truth.

Required flows:
1. Registration → verification → role → profile → plan selection.
2. Login → session restoration → correct role workspace.
3. Free/premium entitlement enforcement.
4. Student practice → attempts → mastery/progress.
5. Parent → verified child relationship → progress visibility only for linked children.
6. Teacher → educator workflow → review/approval permissions.
7. Company → approval → vacancy publishing → limited company data access.
8. Jobs/scholarships → verified source catalog → application tracking.
9. Payments → checkout → callback/verification → idempotent entitlement.
10. Password recovery → email → hosted redirect → password update.

No production gate should be closed using mock data, local-only state or a client-side authorization check.

## Phase 4 — Full QA, accessibility, safety and scale

Automated testing must cover:
- Desktop Chromium/Firefox/WebKit.
- Android and iPhone emulation.
- Slow backend and offline health behavior.
- Registration and recovery.
- RLS/data-isolation abuse cases.
- Role escalation attempts.
- Premium entitlement tampering.
- Payment replay/idempotency.
- Child/guardian safety gates.
- Keyboard navigation, focus order, reduced motion and screen-reader labels.

Manual gates still required by the launch registry:
- Human assistive-technology/disabled-learner review.
- Physical-device testing.
- Slow Ethiopian mobile-network testing on hosted staging.
- Hosted authenticated child/guardian abuse testing.
- Production-class mixed-workload load/soak testing.
- One-million-user capacity evidence on paid infrastructure.

## Phase 5 — Staging, deployment and launch

Before production:
- Provision independent hosted staging/custom domain.
- Run the complete browser/device matrix against staging, not a local static server.
- Configure and test production custom SMTP.
- Complete real confirmation and password-recovery round trips.
- Complete a disposable backup/restore rehearsal.
- Complete Chapa TEST checkout, callback, verification and reconciliation on hosted staging.
- Complete Ethiopian data-protection/legal review and processor safeguards.
- Complete qualified educator review of required learning content.
- Complete translated credential assessment certification.
- Confirm all required launch requirements are `complete` and none are `pending` or `blocked`.
- Only then change `production_launch` from `false` to `true`.

## Current launch inventory snapshot

| Gate | Status |
|---|---|
| Required complete | 6 |
| Required pending | 17 |
| Required blocked | 1 |
| Required total | 24 |
| Active questions | 142,396 |
| Verified work domains | 1,022 |
| Verified education domains | 1,167 |

The 17 pending and 1 blocked requirements are not safe to bypass with code. They include human review, hosted staging, SMTP/email verification, legal/compliance evidence, backup/restore rehearsal, payment-provider staging verification, physical-device QA, slow-network testing, safeguarding E2E, production-class load testing, one-million-user capacity evidence and leaked-password protection.

## Definition of production ready

Mela is production ready only when:

`build green + automated QA green + security green + RLS/data isolation green + hosted staging green + payment/authentication green + human/legal/content gates complete + scale evidence complete + launch registry has 0 pending and 0 blocked`
