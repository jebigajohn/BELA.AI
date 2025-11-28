# Specs (Speckit)

Purpose

- Central place for product and engineering specs.
- Each spec contains Goals, Non-Goals, Decisions and a Tasks section (checkbox list).
- Tasks can be turned into GitHub issues.

Conventions

- File name: `NN_topic.md` where NN controls ordering (00, 10, 20,...)
- Frontmatter (optional):
  - title, owners, status, due, labels
- Sections: Overview, Goals, Non-Goals, Scope, Risks, Open Questions, Tasks

How to work with specs

1. Create or edit a spec in this folder
2. Keep the Tasks section up to date (checkbox list)
3. Create issues from tasks (manually or via automation)

Example task format

- [ ] Build customers list page (/demo/customers)
- [ ] Add service editor with create/update/delete
