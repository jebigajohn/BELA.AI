```mermaid
erDiagram
  studios ||--o{ studio_members : has
  profiles ||--o{ studio_members : member_of

  studios ||--o{ locations : has
  studios ||--o{ customers : has
  studios ||--o{ services : offers
  studios ||--o{ staff : employs
  staff ||--o{ staff_services : can_perform
  services ||--o{ staff_services : performed_by
  studios ||--o{ studio_hours : opens
  staff ||--o{ staff_working_hours : works_at
  locations ||--o{ staff_working_hours : located_at
  staff ||--o{ staff_time_off : time_off

  studios ||--o{ appointments : books
  customers ||--o{ appointments : booked_by
  staff ||--o{ appointments : assigned_to
  services ||--o{ appointments : service
  appointments ||--o{ appointments : rescheduled_from

  studios ||--o{ message_threads : has
  customers ||--o{ message_threads : with
  message_threads ||--o{ messages : contains
  profiles ||--o{ messages : sent_by

  studios ||--o{ ai_prompts : has
  studios ||--o{ ai_suggestions : has
  messages ||--o{ ai_suggestions : for_message
  appointments ||--o{ ai_suggestions : for_appointment

  studios ||--o{ audit_logs : logs
  profiles ||--o{ audit_logs : actor

  studios {
    uuid id PK
    text name
    text slug
    text timezone
    char(3) default_currency
    uuid created_by FK
    timestamptz created_at
  }

  profiles {
    uuid id PK  // -> auth.users.id
    text full_name
    text avatar_url
    text phone
    uuid default_studio_id FK
    timestamptz created_at
  }

  studio_members {
    uuid studio_id FK
    uuid profile_id FK
    member_role role
    text title
    boolean is_active
    timestamptz joined_at
    PK (studio_id, profile_id)
  }

  locations {
    uuid id PK
    uuid studio_id FK
    text name
    jsonb address
    text phone
  }

  customers {
    uuid id PK
    uuid studio_id FK
    text full_name
    text phone
    text email
    text instagram_handle
    text notes
    boolean consent_marketing
    timestamptz created_at
  }

  services {
    uuid id PK
    uuid studio_id FK
    text name
    text description
    text category
    int duration_min
    int buffer_before_min
    int buffer_after_min
    int price_cents
    char(3) currency
    text color
    boolean active
  }

  staff {
    uuid id PK
    uuid studio_id FK
    uuid profile_id FK
    text display_name
    text bio
    text color
    boolean is_bookable
  }

  staff_services {
    uuid studio_id FK
    uuid staff_id FK
    uuid service_id FK
    int price_cents
    int duration_min
    boolean active
    PK (studio_id, staff_id, service_id)
  }

  studio_hours {
    uuid id PK
    uuid studio_id FK
    int weekday
    time open_time
    time close_time
  }

  staff_working_hours {
    uuid id PK
    uuid studio_id FK
    uuid staff_id FK
    int weekday
    time start_time
    time end_time
    uuid location_id FK
  }

  staff_time_off {
    uuid id PK
    uuid studio_id FK
    uuid staff_id FK
    timestamptz starts_at
    timestamptz ends_at
    text reason
  }

  appointments {
    uuid id PK
    uuid studio_id FK
    uuid customer_id FK
    uuid staff_id FK
    uuid service_id FK
    timestamptz starts_at
    timestamptz ends_at
    appointment_status status
    int price_cents
    char(3) currency
    text notes
    text source
    uuid created_by FK
    uuid rescheduled_from_id FK
  }

  message_threads {
    uuid id PK
    uuid studio_id FK
    uuid customer_id FK
    channel channel
    text external_ref
    thread_status status
    timestamptz last_message_at
  }

  messages {
    uuid id PK
    uuid studio_id FK
    uuid thread_id FK
    message_sender sender_type
    uuid sender_profile_id FK
    text content
    jsonb attachments
    timestamptz sent_at
    timestamptz read_at
  }

  ai_prompts {
    uuid id PK
    uuid studio_id FK
    text key
    text content
    boolean is_active
  }

  ai_suggestions {
    uuid id PK
    uuid studio_id FK
    text suggestion_type
    uuid message_id FK
    uuid appointment_id FK
    jsonb payload
    text content
    numeric score
  }

  audit_logs {
    bigint id PK
    uuid studio_id FK
    uuid actor_profile_id FK
    text action
    text object_type
    uuid object_id
    jsonb changes
    inet ip
    text user_agent
    timestamptz created_at
  }
```
