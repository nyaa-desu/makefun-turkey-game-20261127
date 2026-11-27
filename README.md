[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/nyaa-desu/makefun-turkey-game-20261127/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/nyaa-desu/makefun-turkey-game-20261127/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

# GIBLET'S GREAT ESCAPE: outrun Farmer Bram through Maple Hollow Farm at dusk — 4 stages, 12 hiding spots, 9 tools, 5 pursuers, 3 lives

An entry for the make.fun **turkey-run-game-01** bounty.

## The story

It is Thanksgiving dusk at **Maple Hollow Farm**, and the oven is already warm.
**Giblet** the turkey — a plucky tom who refuses to be dinner — has 2,400 metres
to run: out of the farmyard, through the cornfield, across the pumpkin patch,
through the farmhouse kitchen and out the back door to the forest gate. He has
360 seconds before dinner is served.

## The cast

- **Giblet** (you) — the turkey. "Not today. Not ever. I am NOT dinner."
- **Farmer Bram Cobb** — chases with a net in the yard and the carving knife in
  the kitchen. He searches haystacks and corners the turkey when he gets close.
- **Biscuit** — Bram's beagle. Faster than Bram, and always sniffing: hide too
  long and he finds you.
- **Tabitha** — the barn cat. She pounces in the pumpkin patch; jump to dodge.
- **Henrietta** — the hen, your lookout. She honks warnings and tells you where
  to hide.
- **The Oven and the Carving Knife** — the fifth pursuers, waiting in the kitchen.

## How to play

| Key | Action |
| --- | --- |
| ← → / A D | Surge ahead or steady the run |
| Space / W / ↑ | Jump fences, crates, knives and oven flames |
| ↓ / S | Hide in a haystack, barrel, bush or crate (Biscuit is sniffing — don't linger) |
| Shift | Dash (costs stamina) |
| P | Pause · M | Mute · Enter / click | Start / restart |

Grab corn for points, feathers and gravy for stamina, a pumpkin shield to block
a hit, a lantern, a wishbone for an extra life, a hay disguise, a pepper bomb
to make Bram sneeze, and a horseshoe for double points. Nine tools, twelve
hiding spots, five pursuers, four stages, three lives — and one forest gate.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network requests: `game/` is plain static files, and the
sound is synthesised with WebAudio. Screenshots are staged with
`?shot=cover|title|early|end&seed=7` (see `shots.json`).

## Layout

- `game/index.html` — the page
- `game/src/config.js` — the farm, the cast, the stages, the tools
- `game/src/random.js` — the seeded farm generator
- `game/src/audio.js` — synthesised gobbles, boings and alarms (WebAudio)
- `game/src/input.js` — keyboard and pointer input
- `game/src/world.js` — the run, the farmer's hunt, hiding, collisions, scoring
- `game/src/render.js` — dusk farm, kitchen, characters, HUD, panels, screens
- `game/src/shots.js` — the four staged screenshot scenes
- `game/src/main.js` — boot, the fixed-step loop, screens
- `main.ts` — the hand-in program (Node 22, stdlib only)

## License

MIT — see [LICENSE](LICENSE).
