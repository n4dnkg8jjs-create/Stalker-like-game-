# Zone 12 — hand-off for the next agent

Read this whole file before changing anything. It covers what the project is, how to build and test it, how the code is
organised, the owner's standing rules, the traps that have cost time before, and what is still open.

## 1. What this is

**Zone 12** is a first-person, STALKER-inspired browser game written in plain JavaScript on **three.js r128**. There is no
bundler and there are no npm packages. Everything — terrain, buildings, vehicles, weapons, textures, sounds, animation
— is generated procedurally at load time in code. The exceptions are the character meshes, which were baked from CC0
MakeHuman data into `dev/src/03y_chars.js`, and the CC0 sound recordings in `dev/assets/snd.js`.

The story runs in three chapters:
- **Chapter 1:** forward operating base "Kurgan", then a BTR-80 ride to Sector 1 (field, checkpoint, the farmhouse,
  the "shadow").
- **Chapter 2:** new orders, the forest track, the highway, the ambush (the BTR burns), the wake-up.
- **Chapter 3:** on foot with the wounded Captain Morozov, west through the forest, the old collective field and the
  flooded contaminated basin (giant crayfish) to the separatist outpost at a lumber yard. Beyond it lie the village of
  Staroye Opalikhino and a road toward the front line.

See `dev/LORE.md` for the setting.

Where it lives:
- **GitHub:** https://github.com/n4dnkg8jjs-create/Stalker-like-game- . GitHub Pages serves the root `index.html` as the
  playable game.
- **Playable copy:** a claude.ai artifact, last published as version 50. The artifact build splits the 23 MB character
  file into chunks to fit the artifact file-size limit; see `build_art.py`.

## 2. Repository layout

```
index.html            the BUILT game (single 28 MB file) — what GitHub Pages serves. Never edit by hand.
README.md             player-facing readme (controls, credits)
HANDOFF.md            this file
CLAUDE.md             short pointer to this file (auto-loaded by Claude Code)
dev/
  src/*.js            THE SOURCE. Concatenated in filename order into one script (see build.py)
  template.html       page shell: menus, HUD, CSS, loads three r128 from cdnjs; '/*JS*/' is replaced by the source
  assets/snd.js       CC0 recorded sounds as base64 (inlined ahead of the game script)
  assets/icons/       source images of the three real Orthodox icons (already embedded in src/07zf0_iconimg.js)
  build.py            -> dev/out/zone12.html   (the game; copy this to /index.html to publish)
  build_art.py        -> dev/out/art/          (artifact variant: index.html + snd.js + chars0/1.js + chars_join.js)
  lab/three.min.js    local copy of three r128 (the test tools serve it instead of hitting the CDN)
  tools/              headless test/inspection tools (Playwright, Python) — see §4
  sculpt/             the offline Python character generator that produced 03y_chars.js (needs MakeHuman data,
                      not included; you should not need it)
  LORE.md             setting/story notes
  out/, work/         build output and tool scratch (git-ignored)
```

## 3. Build and publish

```bash
cd dev
python3 build.py            # writes dev/out/zone12.html, prints its length
python3 build_art.py        # writes dev/out/art/* (only needed for the claude.ai artifact)
```

- **Syntax check after every edit** (cheap; catches most breakage):
  ```bash
  python3 - <<'EOF'
  import re,subprocess
  s=open('dev/out/zone12.html').read()
  sc=max(re.findall(r'<script[^>]*>(.*?)</script>',s,re.S),key=len)
  open('/tmp/z.js','w').write(sc)
  print(subprocess.run(['node','--check','/tmp/z.js'],capture_output=True,text=True).stderr[:800] or 'syntax ok')
  EOF
  ```
- **Boot check** before publishing: `python3 dev/tools/dbgboot.py` must print `booted at N`. The whole game is wrapped
  in `try{...}catch` inside `main()`, so a startup exception never surfaces as a page error. It shows as a red
  `<pre>Zone 12 failed to start: ...</pre>`, which dbgboot detects and prints.
- **Publish:** `cp dev/out/zone12.html index.html`, then commit and push.
- **Commit trailer:** previous commits end with `Co-Authored-By: Claude ... <noreply@anthropic.com>`.

The owner's standing rule is to **push to GitHub AND update the playable artifact after every batch of work**. If you
cannot update the artifact from Claude Code, say so, and tell them `dev/out/art/` is ready to publish.

## 4. Testing tools (dev/tools)

All are Playwright (Python) scripts that load `dev/out/zone12.html` headlessly with SwiftShader WebGL. Setup:
`pip install playwright && playwright install chromium`. A full world boot takes **3–6 minutes** in software
rendering, and each screenshot can take minutes, so batch your checks into one run. On a machine with a real GPU you
can drop the `--use-angle=swiftshader` launch args and it will be much faster.

| tool | what it does |
|---|---|
| `dbgboot.py` | boot check; prints `booted at N` or the failure text |
| `bootchk.py` | older boot check |
| `probe.py` | generic scene probe (`#field` debug view) |
| `fixshots.py` | world shots: boots `#field`, un-parks every region, finds objects (e.g. by memo'd material via `__z.MEMO.get(key)`), renders several cameras to `dev/work/shots/*.jpg`. Copy it and edit `SETUP` for new checks |
| `woundonly.py` | spawns chapter 3 separatists, wounds one into the sitting-and-firing state, steps only its animator (game paused) and renders it. Pattern for isolated animation checks |
| `vmlab.py` | first-person viewmodel lab: `python3 tools/vmlab.py ak tools/akdet.js _tag` renders the AK from several angles |
| `vmserve.py` + `vs.py` + `vrun.py` | persistent viewmodel server: start `vmserve.py` (boots `#vm` once, writes `work/vcmd/ready`), then send jobs with `vs.py job.json` (`{"js":"...","shots":[{name,t,views,w}]}`) |
| `smkseq.py` | renders the cigarette sequence at given times through `vrun.py` and measures fingertip-to-cigarette contact |

**Debug URL hashes:** `#field` (free scene, used by probes), `#vm` (viewmodel lab), `#ak`, `#adsak`, `#ride`,
`#ridecam`, `#plan`, `#uaz`, `#bodies`, `#doll`, `#face`, `#faces`. Add-ons: `&nomerge` (skip static mesh merging, for
audits), `rain`, `kit`, `crew`.

**Console handles:**
- `window.__z` holds scene, camera, renderer, player, S (game state), H (height), MEMO (material/texture cache), VILL,
  villW, WX, roadFrame, ROADS, PARK, unparkRegion, roffRestore, distanceCull and others.
- `window.__act` holds the smoking/hand-action rig: `smokeAt(t)`, `RIG`, `chainPts`, `handPt`, `sdf`, `colPrep`, `PK`,
  `SMK` and others.
- `window.__c3` is chapter 3: `CH3`, `ch3Spawn`, `SEPDEF`, `H` and others.
- `window.__xbtr` is the front-road BTR wreck group, and `__PB` the PBR texture sets.

### Probe traps (each one has cost an hour or more)
- **Hidden scene content:** regions are *parked* or *offloaded* by chapter and distance. In a probe, call
  `for(const k of Object.keys(__z.PARK.L))__z.unparkRegion(k); __z.roffRestore();` first. Render with
  `camera.layers.enableAll()`, because distance culling moves far meshes to layer 1.
- **Chapter 1 position clamp:** in chapter 1 the player is clamped to the base area. Running the game loop with the
  player elsewhere snaps them back, and distant characters then stop animating. Set `S.chapter=3` or keep the game
  paused and step things by hand.
- **Chapter 3 logic interferes:** running live chapter 3 logic for seconds inside a probe can reset or respawn
  separatists. To check a pose, pause the game and call `s.an.update(dt,target)` directly.
- **Merged statics:** `mergeStatic()` merges static meshes into chunks, so `getWorldPosition()` on a merged piece is
  the chunk origin. To identify something you see, raycast from the shot camera through its pixel and print the hit
  object's geometry, size and material.
- **Slow traversals:** a `scene.traverse` that calls `Box3.setFromObject` on every mesh takes forever. Filter by
  distance first.
- **Long probes:** keep each probe under about 40 minutes. Launch long runs as tracked background jobs, not detached
  `&` processes, which get killed.
- **Killing your own shell:** `pkill -f pattern` or `grep "[x]yz" | kill` matches its own command line if the pattern
  appears in it, and kills your shell (exit 144). Kill by PID.

## 5. Code architecture (dev/src, concatenated in order)

- `00_core.js`: helpers (`mesh`, `rbox`, `std` material, `C` colour (sRGB→linear), `memo`, `G` geometry cache,
  `lathe`, `merge`, `V3`, `rng`/`hash`, `sstep`, `damp`). Also **HIPOLY**: from `06_btr.js` on, every
  Cylinder/Sphere/Circle/Torus/Lathe gets enough radial segments for its size (`sides(r)`). New round parts are smooth
  automatically. Files before 06 (weapons in millimetres, rig, fx) set segment counts by hand.
- `01_tex.js` / `01b_pbr.js` / `07zh_logs.js`: procedural tileable textures. `pbr(size,(u,v)=>[r,g,b,height,rough],
  {bump,rep})` gives `{a,n,r}` (albedo, normal, roughness). `N2`/`fbmT` are tileable only at **integer** scales of
  u and v. `wor(u,v,p)` is tileable cellular noise returning `[F1, F2-F1]`.
- `02_terrain.js`: heightfield, `ROADS` (highway `hw`, kolkhoz road `dr`, forest track `tr`), the village layout
  `VILL`, craters (`wxCraters`), war-dried fields, and the north dirt road plane at x=0 (now runs z −720…+300).
- `02b_interior.js`: darkens sky light inside house boxes through a shader-chunk patch (`vIntK`).
- `04_rig.js`, `05b_anim.js`: MakeHuman skinned characters. `animate(h,{...})` returns an Animator with pose
  blending, `go(poseName,t)`, gait from keyframe curves (`gkey`, now baked to a lookup table) and arm IK onto the gun.
  Poses live in `AP`.
- `05_weapons.js`: AK-74M (`buildAK`) and others, from real side profiles in **millimetres** (group scaled .001).
  Uses `loftU(sec,[[u,halfW,vBottom,vTop],...])` for the handguards.
- `06_btr.js`: BTR-80 (`buildBTR(opts)`). `opts.openDoors` builds the side doors open (used by the front-road wreck).
- `07z*` interiors and furniture; `07zg_belongings.js` holds per-house belongings (rabbit, bags, satchel and others);
  `07zf*` holds the icons.
- `08e_village.js` (the biggest file) builds the village houses: log/clapboard walls, roofs and damage, facade fixtures
  (gas meter, electric meter, number plate, dish), yards, ruins. `cladM` uses `PB.peel` with a shader that tints only
  the paint.
- `09_game.js` holds the main loop, the player, items/inventory, the view bob, ANIMS updates (characters out of view
  and over 8 m away are skipped, with their time caught up later), bullet decals (`decalMat` by surface) and Geiger
  clicks.
- Chapter and region files: `09b_chapter2.js` (ambush; burnt BTR uses `charPB()`), `09e_chapter3.js` (separatist AI;
  wounded → `'wfight'` state, `AP.woundFire`), `09j_horizon.js` (the world beyond the map edge, including road
  continuations through the treeline), `09m_actions.js` (cigarette/hand actions), `09n_westroad.js` and
  `09n_xfront.js` (road to the front, BTR wreck), `09o_warscape.js` (war soundscape; synthesised artillery bodies and
  tails).
- `99_boot.js`: static merging, chunking, region parking/offload, distance cull, shadow trim, and the `__z` export.

**Conventions:**
- The code style is dense one-liners with long explanatory comments. Keep comments in that voice: say what the
  real-world thing is and why it is built that way.
- Units are metres, except weapons (millimetres).
- Reuse `memo('key',()=>...)` for every shared material and texture.
- Performance matters: merge static meshes, instance repeated foliage (`ibucket`/`ibk`), avoid per-frame allocations,
  and avoid per-frame buffer uploads when nothing changed.

## 6. The owner's standing rules (from the conversation)
- "Make no mistakes." Verify visually with renders before claiming something is fixed, and report honestly what was and
  was not checked.
- **No low-poly assets.** Everything should be as detailed as possible, with smooth geometry, while still performing
  well (LODs, instancing, draw calls).
- High realism with a STALKER-like atmosphere: a war zone, the approaching front line, contamination.
- After each batch: push to GitHub **and** update the playable artifact.
- Never open the user's Chrome. Ask permission before downloading files.
- Do not stop to report half-way. The owner complained when work paused at a summary with items left undone. Keep going
  through the list, then summarise.

## 7. Recent work (Oct 30 batch, commits 200ba27 and 752fbf6)
- **Cigarette:** fingertip positions are now measured from the skinned glove mesh (`fingerTips()` in `09m`). The old
  estimate overshot by about 1 cm, so contact solving never really touched. The pinch is now a dedicated solver
  (`pinchTo`, pads one filter-width apart, opposed thumb shape `HANDS.pinchC`). The look-down curve keeps the tip on
  screen; G takes a draw, five per cigarette.
- **AK-74M:** lower handguard enlarged to reference proportions, with the rib rack and front ribs.
- **Village:**
  - The collapsed-house chimney stands on the stove's flue.
  - Fallen roof sheets are confined to the yard strip between porch and fence and draped on the ground.
  - New gas meter (dial face, stubs, union nuts, riser into the inlet, outlet into the wall) and electric meter box.
  - Clapboard peel texture rebuilt; only the paint takes the house colour.
  - `PB.char` charred-wood texture for burnt debris and ruins.
  - Rabbit toy, suitcase, holdall, bundle and satchel rebuilt.
- **BTRs:** the chapter 2 ambush BTR uses `charPB()` (fresh soot and heat tint, no rust). The front-road wreck stays
  rusted, has its side doors open, and its burnt materials are double-sided (they must be, because hull halves are
  mirrored).
- **Roads:** the highway (both ends) and the north road continue past the map edge through gaps in the horizon
  treeline (`CONT` in `09j`).
- **Audio:** synthesised artillery (blast bodies plus rolling multi-echo tails, generated between frames), and eight
  Geiger click variants.
- **Animation:** gait curves are baked as time-correct Hermite splines; the view bob uses a softened |x| (`sabs`);
  stride eases between walk and sprint.
- **Optimisation:** animators skipped out of view; dust and flag updates only when needed.
- **Verified in renders:** the pinch contact, the wounded sitting-and-firing pose, the wreck from all sides with its
  open doors, the road continuations, the meters, the chimney, the cladding.
- **Not verified in renders:** the rabbit and bags, the bullet decals, the yard sheets, the sounds (not listened to),
  the gait smoothness.

## 8. Open items / backlog
1. **Village floating-object audit was never finished.** It was too slow. Write a faster one: raycast down from object
   bottoms, only for meshes near houses, in `&nomerge` mode.
2. **Black crescent shapes on top of a collapsed log-house ruin** (owner's screenshot) were never identified. Find them
   by pixel raycast and fix them.
3. **Household items:** the owner said "the items in the houses need more detail" and planned to upload more
   references. Ask for them.
4. **Look at the rabbit and bags in renders.** The probe found their materials on objects sitting at the world origin,
   so check whether a prototype mesh is stranded there.
5. **Optimisation that does not change the picture:** the owner asked for more. Ideas: shadow-caster trimming,
   further instancing, cheaper per-frame loops in `09_game`. Measure frame time before and after.
6. **Cladding:** the peel-texture pattern can still look repetitive at distance. Per-house UV offsets would help.
7. **Pinch posing:** `fingerTips` changed the contact geometry for every grip in `09m` (lighter, held-cigarette V
   grip). Those looked fine in renders, but re-check them if anything there looks off.
8. **AK detail:** the owner wanted "no mistakes". The handguard pass is done. A further side-by-side with the AK-74M
   reference photos is worth doing (the receiver rivets, selector and stock were judged fine).
