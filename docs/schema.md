# 23 Nailroom – Datenbankschema (MVP)

Kontext

- Postgres (Supabase), strikte Multi-Tenancy.
- Jede fachliche Tabelle enthält studio_id (Profiles ausgenommen).
- Profiles 1:1 zu auth.users (profiles.id = auth.users.id).
- RLS: Tenant-Isolation per studio_id, Rollen: admin | staff.
- Zeit: timestamptz; Preise: price_cents (int), currency (char(3)).

Konventionen

- Parent-Tabellen haben UNIQUE (studio_id, id).
- Child-Tabellen referenzieren Parents via (studio_id, id), um Cross-Tenant-FKs zu verhindern.
- Standard-Defaults (empfohlen für MVP):
  - created_at: now()
  - is_active: true
- Wichtige Indizes:
  - appointments: (studio_id, staff_id, starts_at), (studio_id, customer_id, starts_at)
  - messages: (studio_id, thread_id, sent_at DESC)
  - studio_members: (profile_id)
  - Generell: INDEX(studio_id) auf allen Multi-Tenant-Tabellen

Enums

- member_role: admin, staff
  - Verwendung: studio_members.role
- appointment_status: requested, confirmed, checked_in, completed, cancelled, no_show
  - Verwendung: appointments.status
- message_sender: studio, customer, ai
  - Verwendung: messages.sender_type
- channel: instagram, internal
  - Verwendung: message_threads.channel, appointments.source (zusätzlich ‘online’/’dm’/’phone’/’manual’ als freie Quellenangabe)
- thread_status: open, snoozed, closed
  - Verwendung: message_threads.status

RLS (Muster)

- Grundpolicy (SELECT/INSERT/UPDATE):
  - Zeile ist sichtbar/bearbeitbar, wenn EXISTS (
    SELECT 1 FROM studio_members m
    WHERE m.studio_id = <row>.studio_id
    AND m.profile_id = auth.uid()
    AND m.is_active = true
    )
- Admin-only (z. B. DELETE): zusätzlich m.role = 'admin'.
- profiles: Zugriff nur auf WHERE id = auth.uid().

---

## Tabellen

### studios

Spalten

- id: uuid, NOT NULL, PK
- name: text, NOT NULL
- slug: text, NOT NULL
- timezone: text, NOT NULL
- default_currency: char(3), NOT NULL
- created_by: uuid, NOT NULL (→ profiles.id)
- created_at: timestamptz, NOT NULL, default now()

Schlüssel

- PK: (id)
- UNIQUE: (slug)
- UNIQUE: (studio_id, id) – entfällt (Root-Tabelle, kein studio_id)

Fremdschlüssel

- created_by → profiles.id

Indizes

- slug UNIQUE

Besonderheiten

- Root-Tabelle für Tenants/Studios.

---

### profiles

Spalten

- id: uuid, NOT NULL, PK (→ auth.users.id)
- full_name: text, NOT NULL
- avatar_url: text, NULL
- phone: text, NULL
- default_studio_id: uuid, NULL (→ studios.id)
- created_at: timestamptz, NOT NULL, default now()

Schlüssel

- PK: (id)

Fremdschlüssel

- id → auth.users.id
- default_studio_id → studios.id

Indizes

- (default_studio_id)

Besonderheiten

- 1:1 zu auth.users.
- Keine studio_id (globales Profil).

---

### studio_members

Spalten

- studio_id: uuid, NOT NULL (→ studios.id)
- profile_id: uuid, NOT NULL (→ profiles.id)
- role: member_role, NOT NULL
- title: text, NULL
- is_active: boolean, NOT NULL, default true
- joined_at: timestamptz, NOT NULL, default now()

Schlüssel

- PK: (studio_id, profile_id)

Fremdschlüssel

- studio_id → studios.id
- profile_id → profiles.id

Indizes

- (profile_id)
- (studio_id, role)

Besonderheiten

- Mitgliedschaft und Rolle pro Studio.

---

### locations

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL (→ studios.id)
- name: text, NOT NULL
- address: jsonb, NULL
- phone: text, NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- studio_id → studios.id

Indizes

- (studio_id)

Besonderheiten

- Optional, aber hilfreich für Kapazitäten/Planung.

---

### customers

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL (→ studios.id)
- full_name: text, NOT NULL
- phone: text, NULL
- email: text, NULL
- instagram_handle: text, NULL
- notes: text, NULL
- consent_marketing: boolean, NOT NULL, default false
- created_at: timestamptz, NOT NULL, default now()

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)
- UNIQUE: (studio_id, phone) NULLS NOT DISTINCT
- UNIQUE: (studio_id, email) NULLS NOT DISTINCT

Fremdschlüssel

- studio_id → studios.id

Indizes

- (studio_id)

Besonderheiten

- Eindeutigkeit von Kontaktfeldern pro Studio.

---

### services

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL (→ studios.id)
- name: text, NOT NULL
- description: text, NULL
- category: text, NULL
- duration_min: int, NOT NULL
- buffer_before_min: int, NOT NULL, default 0
- buffer_after_min: int, NOT NULL, default 0
- price_cents: int, NOT NULL
- currency: char(3), NOT NULL
- color: text, NULL
- active: boolean, NOT NULL, default true

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)
- UNIQUE: (studio_id, name)

Fremdschlüssel

- studio_id → studios.id

Indizes

- (studio_id)

Besonderheiten

- Preis-/Dauer-Logik pro Service; Name pro Studio eindeutig.

---

### staff

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL (→ studios.id)
- profile_id: uuid, NULL (→ profiles.id)
- display_name: text, NOT NULL
- bio: text, NULL
- color: text, NULL
- is_bookable: boolean, NOT NULL, default true

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)
- UNIQUE: (studio_id, profile_id) WHERE profile_id IS NOT NULL

Fremdschlüssel

- studio_id → studios.id
- profile_id → profiles.id

Indizes

- (studio_id)

Besonderheiten

- Optionaler Link zu profiles (externe Mitarbeitende möglich).

---

### staff_services

Spalten

- studio_id: uuid, NOT NULL
- staff_id: uuid, NOT NULL (→ staff.(studio_id,id))
- service_id: uuid, NOT NULL (→ services.(studio_id,id))
- price_cents: int, NULL
- duration_min: int, NULL
- active: boolean, NOT NULL, default true

Schlüssel

- PK: (studio_id, staff_id, service_id)

Fremdschlüssel

- (studio_id, staff_id) → staff.(studio_id, id)
- (studio_id, service_id) → services.(studio_id, id)

Indizes

- (studio_id)
- (studio_id, service_id)

Besonderheiten

- Überschreibt Service-Preis/Dauer pro Staff.

---

### studio_hours

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL (→ studios.id)
- weekday: int, NOT NULL (0=Sonntag … 6=Samstag)
- open_time: time, NOT NULL
- close_time: time, NOT NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, weekday, open_time, close_time)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- studio_id → studios.id

Indizes

- (studio_id)

Besonderheiten

- Regelmäßige Öffnungszeiten.

---

### staff_working_hours

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- staff_id: uuid, NOT NULL (→ staff.(studio_id,id))
- weekday: int, NOT NULL (0=Sonntag … 6=Samstag)
- start_time: time, NOT NULL
- end_time: time, NOT NULL
- location_id: uuid, NULL (→ locations.(studio_id,id))

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, staff_id) → staff.(studio_id, id)
- (studio_id, location_id) → locations.(studio_id, id)

Indizes

- (studio_id)

Besonderheiten

- CHECK(end_time > start_time).

---

### staff_time_off

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- staff_id: uuid, NOT NULL (→ staff.(studio_id,id))
- starts_at: timestamptz, NOT NULL
- ends_at: timestamptz, NOT NULL
- reason: text, NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, staff_id) → staff.(studio_id, id)

Indizes

- (studio_id)

Besonderheiten

- CHECK(ends_at > starts_at).

---

### appointments

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- customer_id: uuid, NOT NULL (→ customers.(studio_id,id))
- staff_id: uuid, NOT NULL (→ staff.(studio_id,id))
- service_id: uuid, NOT NULL (→ services.(studio_id,id))
- starts_at: timestamptz, NOT NULL
- ends_at: timestamptz, NOT NULL
- status: appointment_status, NOT NULL, default 'requested'
- price_cents: int, NOT NULL
- currency: char(3), NOT NULL
- notes: text, NULL
- source: text, NULL (Kanal/Quelle; channel + frei: ‘online’|’dm’|’phone’|’manual’)
- created_by: uuid, NOT NULL (→ profiles.id)
- rescheduled_from_id: uuid, NULL (Self-Ref → appointments.(studio_id,id))

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, customer_id) → customers.(studio_id, id)
- (studio_id, staff_id) → staff.(studio_id, id)
- (studio_id, service_id) → services.(studio_id, id)
- created_by → profiles.id
- (studio_id, rescheduled_from_id) → appointments.(studio_id, id)

Indizes

- (studio_id)
- (studio_id, starts_at)
- (studio_id, staff_id, starts_at)
- (studio_id, customer_id, starts_at)

Besonderheiten

- CHECK(ends_at > starts_at).

---

### message_threads

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- customer_id: uuid, NOT NULL (→ customers.(studio_id,id))
- channel: channel, NOT NULL
- external_ref: text, NULL
- status: thread_status, NOT NULL, default 'open'
- last_message_at: timestamptz, NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, customer_id) → customers.(studio_id, id)

Indizes

- (studio_id)

Besonderheiten

- external_ref für API-Integration (z. B. IG Thread-ID).

---

### messages

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- thread_id: uuid, NOT NULL (→ message_threads.(studio_id,id))
- sender_type: message_sender, NOT NULL
- sender_profile_id: uuid, NULL (→ profiles.id)
- content: text, NOT NULL
- attachments: jsonb, NULL
- sent_at: timestamptz, NOT NULL, default now()
- read_at: timestamptz, NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, thread_id) → message_threads.(studio_id, id)
- sender_profile_id → profiles.id

Indizes

- (studio_id)
- (studio_id, thread_id, sent_at DESC)

Besonderheiten

- sender_profile_id bei sender_type='studio' relevant.

---

### ai_prompts

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- key: text, NOT NULL
- content: text, NOT NULL
- is_active: boolean, NOT NULL, default true

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)
- UNIQUE: (studio_id, key)

Fremdschlüssel

- studio_id → studios.id

Indizes

- (studio_id)

Besonderheiten

- Versionierung später möglich (separate Tabelle).

---

### ai_suggestions

Spalten

- id: uuid, NOT NULL
- studio_id: uuid, NOT NULL
- suggestion_type: text, NOT NULL ('reply'|'price'|'schedule')
- message_id: uuid, NULL (→ messages.(studio_id,id))
- appointment_id: uuid, NULL (→ appointments.(studio_id,id))
- payload: jsonb, NULL
- content: text, NULL
- score: numeric, NULL

Schlüssel

- PK: (id)
- UNIQUE: (studio_id, id)

Fremdschlüssel

- (studio_id, message_id) → messages.(studio_id, id)
- (studio_id, appointment_id) → appointments.(studio_id, id)

Indizes

- (studio_id)

Besonderheiten

- Referenzen optional; je nach Vorschlagstyp.

---

### audit_logs

Spalten

- id: bigint, NOT NULL, identity/sequence, PK
- studio_id: uuid, NOT NULL
- actor_profile_id: uuid, NULL (→ profiles.id)
- action: text, NOT NULL
- object_type: text, NOT NULL
- object_id: uuid, NULL
- changes: jsonb, NULL
- ip: inet, NULL
- user_agent: text, NULL
- created_at: timestamptz, NOT NULL, default now()

Schlüssel

- PK: (id)

Fremdschlüssel

- studio_id → studios.id
- actor_profile_id → profiles.id

Indizes

- (studio_id, created_at DESC)
- (studio_id, object_type, object_id)
- (studio_id)

Besonderheiten

- Generisches Audit mit strukturierten Änderungen (jsonb).
