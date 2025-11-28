---
title: Appointments Flow v1
owners: ['@jebigajohn']
status: draft
labels: [spec, appointments]
---

## Overview

Booking flow from service selection to appointment creation with RLS checks and staff assignment.

## Goals

- Create appointment with computed end time
- Auto-pick first bookable staff (v1)
- Validate times within working hours and not in time_off

## Non-Goals

- Multi-service carts, payments

## Decisions

- If no staff available → show actionable error to choose another time

## Tasks

- [ ] Query working hours and block outside windows
- [ ] Consider time_off ranges in validation
- [ ] Surface staff choice (dropdown) when multiple possible
- [ ] Add success toast + link to appointments list
