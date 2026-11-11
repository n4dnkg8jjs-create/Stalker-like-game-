# Zone 12 — instructions for Claude

Read `HANDOFF.md` first: it has the project overview, build/test commands, architecture, the owner's rules and the open
backlog.

Essentials:
- Source is `dev/src/*.js` (concatenated in filename order). Never edit the root `index.html` by hand — it is built.
- Build: `cd dev && python3 build.py` → `dev/out/zone12.html`; syntax-check it with `node --check` (see HANDOFF §3);
  boot-check with `python3 dev/tools/dbgboot.py` before publishing.
- Publish: `cp dev/out/zone12.html index.html`, commit, push. The owner also wants the playable artifact updated
  (`python3 dev/build_art.py` → `dev/out/art/`).
- Owner's rules: no low-poly assets, high realism with performance kept in mind, verify fixes visually with renders,
  report honestly what was and wasn't checked, and finish the whole list before summarising.
