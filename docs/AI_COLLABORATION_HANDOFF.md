# MELA AI Collaboration / Source-of-Truth Contract

Status: launch-critical pre-production
Last reviewed: 2026-09-06

## Purpose

This file is the handoff contract for ChatGPT, Supabase AI Assistant, GitHub-connected coding agents, and future MELA agents. The goal is to allow multiple AI systems to continue work without overwriting, weakening, or duplicating each other's fixes.

## Authoritative source of truth

1. GitHub repository `Melakulms/Melaku-` is the canonical application source.
2. Supabase production is the canonical runtime/database environment.
3. `main` is the integration branch.
4. Deployed Supabase Edge Functions must remain compatible with the source and documented deployment state.
5. Never treat a Dashboard-only edit as the permanent source of truth; copy any intentional function change back into the repository before the next deployment.

## Collaboration rules

- Read this file before modifying launch-critical code.
- Inspect the current implementation before changing it.
- Do not recreate or replace an existing function because another AI has already implemented it.
- Make the smallest safe change that closes a verified gap.
- Preserve authentication, ownership checks, RLS, audit logging, approval gates, and frozen payment behavior.
- Do not weaken a QA test merely to make a failing implementation pass.
- Do not mark a gate complete unless it has been actually executed and verified.
- Record important changes in Git history with a precise commit message.
- If two agents touch the same area, re-read the current file before applying a second change.

## Supabase AI Assistant handoff

When working in Supabase AI Assistant:

- First inspect the existing Edge Function and database objects.
- Prefer repository-backed changes over untracked Dashboard edits.
- Before deploying an Edge Function, preserve its current `verify_jwt` behavior unless the security design explicitly requires a change.
- Never use service-role credentials in browser code.
- Never bypass RLS or task ownership checks to make an E2E test pass.
- For AI workforce work, preserve the execution chain: authenticated user -> task ownership -> assigned agent -> assigned tool -> authorization/risk gate -> tool call -> AI response -> persistence -> audit.
- For admin actions, preserve permission checks and audit records.
- Payment/installment work is frozen unless the user explicitly reopens it.

## Current frontend delivery architecture

`mela-web` Supabase Edge Function is a backend/runtime endpoint and must not be treated as the production HTML host on the default Supabase domain. Supabase documents that hosted Edge Functions rewrite `text/html` GET responses to `text/plain`; therefore the production browser contract must target a real frontend host that serves HTML.

The authoritative frontend currently originates from the active MELA build and is synchronized into `index.html` by `.github/workflows/sync-mela-frontend.yml`. The eventual production frontend URL must be supplied through the QA/deployment configuration rather than hardcoding an unverified test host.

## Current launch gates

- Frontend/backend core flows: continue verification.
- AI workforce: built; real authenticated execution E2E still required.
- Admin: built; state-change -> audit E2E still required.
- Registration/permissions/security: continue E2E verification.
- Payment/installment: frozen as completed by user.
- Production frontend hosting: BLOCKED until an actual HTML-serving production URL is connected and the production contract passes.

## Do not change

- Payment implementation unless explicitly reopened.
- AI task ownership protections.
- RLS policies merely to simplify tests.
- Approval requirements for risky actions.
- Production QA content-type requirement.
- `production_launch` flag until final acceptance gates pass.

## Required verification after a launch-critical change

1. Static/source invariant check.
2. Relevant database/RLS/security check.
3. Live function or frontend contract check.
4. Relevant E2E journey.
5. Confirm no unrelated/frozen subsystem changed.
6. Update this handoff only when the architecture or gate status materially changes.
