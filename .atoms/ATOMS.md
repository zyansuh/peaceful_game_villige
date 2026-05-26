# Project Context

## Project Overview
평화로운게임마을 (Peaceful Game Village) - A gaming community teacher assignment system where new members can choose their mentor teachers across 3 game classes.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-05-25 | Use Atoms Cloud backend | Alex | Auth + DB + CRUD needed |
| 2026-05-25 | 3 classes: 수달반(OW), 사자반(PUBG), 여우반(Valorant) | Alex | Per design spec |
| 2026-05-25 | Teachers table public (create_only=false), Applications user-owned (create_only=true) | Alex | Teachers visible to all, applications private |

## Constraints
- Color Scheme: 수달반=#3B82F6(blue), 사자반=#F97316(orange), 여우반=#8B5CF6(purple)
- Design: "게임 길드 + 아카데미" dark theme with neon accents
- Typography: Bold headings, clean body text
- Card hover effects on class selection
- Admin pages restricted to authenticated users only