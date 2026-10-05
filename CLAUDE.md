# Sana Space — career guidance platform (RU/KZ)

Owner: Асель Бапанова (профориентолог, Казахстан). Work with her in Russian unless she writes otherwise. Imported from a Cowork task on 2026-10-05; this repo is now the place for fixes and new features.

## What it is
Bilingual (Kazakh/Russian) 8-day career-guidance program for teens/adults, based on 9 theories (Holland RIASEC, Gottfredson anti-rating/SELFDOUBT, Savickas narrative, Klimov+Fromm "three pillars", Schein anchors, McClelland/Deci-Ryan needs, Brenifier Socratic dialogue, Rokeach values). Content is original (no Punkt B IP / certified-specialist dependence). Hybrid model: AI drafts, consultant approves.

## Architecture (production, hosted by owner on Netlify: sanaspace.netlify.app)
- `app.html` – single-file HTML/JS app (no framework), state in localStorage. Source here: `src/prototype/` (`sana_space_prototype.html`, `app.latest.js` = latest extracted script, ~v0.8).
- `/api/chat` – Netlify Function (`chat.js`, modes `day3` and `report`), proxies Claude API; key in env `ANTHROPIC_API_KEY`. NOT in this repo yet.
- Google Apps Script (doPost/doGet, `?key=`) stores results in Google Sheets. Cabinet reads it. NOT in this repo yet.
- `sana_cabinet_consultant.html` – consultant cabinet (NOT in this repo yet; `src/cabinet/` has zakl.js "conclusion" generator, roster.js, flags.js).
- Landing pages (premium one used for ads; Meta Pixel 2262018727150405, Yandex.Metrika 110394161) – NOT in this repo yet.
- `legacy/diagnostika-platform.html` – older standalone KZ diagnostic page that was in the repo before the import.

## Layout
- `src/` code, `tests/` node scratch tests (`node tests/test_*.js`), `prompts/` AI system/analysis prompts, `docs/` methodology, questionnaires, pilot plan, budget.

## Known open items
- Missing from repo: live site folder (Desktop/sana-site: app.html, cabinet, chat.js, netlify.toml, apps script, landings, privacy policy). Ask owner to upload it.
- Migrate off Google Sheets/Apps Script to a backend with data stored in Kazakhstan (law №94-V).
- Gemini transcription for voice input; fill privacy-policy requisites; Multiverse must require ≥5 answers; all answers mandatory; AI uses masculine grammar with girls; "unfinished" status shown wrongly; surname+phone columns; name+surname in one sheet column.

## Rules
- Never hard-code API keys/secrets; the Apps Script key and URL belong in config, not commits.
- Deploys overwrite what teens are using mid-program: keep localStorage state keys backward compatible.
- LUPA: only scores ≥7 count in analysis.
