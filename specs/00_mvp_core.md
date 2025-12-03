---
title: MVP Core – 23 Nailroom
owners: ['@jebigajohn']
status: draft
labels: [mvp, spec]
due: 2025-12-01
---

## Overview

MVP for multi-tenant nail studio SaaS ("BellaAI" / 23 Nailroom).  
Core flows: Auth, studio membership, services management, appointments booking, basic customers CRUD.  
RLS-enforced per studio, typed Supabase client, and a small but consistent UI layer (Storybook-documented).

## Goals

- Auth (email+password) with profiles auto-provision (trigger on auth.users)
- Tenant isolation via studio_members (admin | staff)
- Services listing and simple booking form (public-facing + internal demo)
- Customers list + create (basic CRM)
- Basic staff model (staff linked to profiles where needed) for future scheduling
- Typed Supabase clients (`Database` from `database.types.ts`) in server+browser
- Minimal design system (buttons, cards, form controls) dokumentiert in Storybook

## Non-Goals

- Payments (Stripe etc.)
- Real Instagram API integration (only DM simulation later)
- Advanced scheduling constraints (multi-service, overlapping resources, multi-location logic)
- Vollständiges Studio-Marketplace-Setup (Onboarding neuer Studios über UI)
- AI-Bildanalyse mit echtem Vision-Endpoint (nur Placeholder im MVP)

## Scope

- Next.js App Router + Supabase (hosted), no local Supabase stack
- Schema: studios, profiles, studio_members, services, staff, customers, appointments, messages (and helpers) as designed
- RLS policies in place and respected by the app (no "service key" cheats)
- Typed Supabase clients (`createServerClient<Database>`, `createBrowserClient<Database>`)
- Storybook for selected UI components (cards, buttons, forms) mit Autodocs

## Risks

- RLS regressions during feature growth (new queries forgetting studio_id / membership)
- Session caching/hydration nuances in Next.js (server vs client, auth state)
- Schema drift between Supabase and generated `database.types.ts` if gen-types is not kept up to date
- Over-scoping DM/AI features too früh → MVP verzögert sich

## Open Questions

- Need service overrides per staff in MVP? (staff_services) or first global service pricing only?
- Do we need any minimal notion of locations in MVP, or is 23 Nailroom single-location?
- How much DM/AI functionality gehört wirklich in den ersten Release? (nur Simulation, kein echtes Routing?)
- Public booking: reiner "Request"-Flow (requested status) oder direkt "confirmed" nach Regeln?

## Tasks

- [ x ] Add Services editor (admin-only): list/create/update/delete
- [ x ] Add Appointments list with basic filters (date, staff)
- [ ] Validate booking against staff_working_hours + time_off (at least no obvious conflicts)
- [ ] Improve error toasts and form validation (forms, API errors, RLS feedback)
- [ ] Seed demo data command (npm script) – nutzt bestehende Seed-Migration als Referenz
- [ ] Deploy instructions (README section) für Vercel o.ä.

<!-- UI / DX -->

- [ ] Extract core UI components (Button, Card, FormField) and document them in Storybook (Autodocs enabled)
- [ ] Add Storybook section "BellaAI" mit Beispiel-Stories für mindestens 2 Komponenten

<!-- Optional / Stretch, aber im Blick -->

- [ ] DM threads & messages simulation (message_threads/messages UI read-only)
- [ ] AI reply stub: simple suggestion generator (no real LLM call yet)
- [ ] Basic staff management view (list staff, toggle is_bookable)
