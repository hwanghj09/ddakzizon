# ddakzizon

## Ttakji sprite skill

The repository includes a reusable Codex/Agent Skill:

- [Ttakji Sprite Artist](.agents/skills/ttakji-sprite-artist/SKILL.md)

This skill defines how to create **four consistent 256×256 transparent PNG sprites per ttakji type**: base (battle), flipped (reverse side), inventory icon, and damaged (low HP). It includes four reusable image-generation prompts, naming conventions, and validation steps.

### Use in Codex

Open this repository in Codex. Ask, for example:

```text
Use $ttakji-sprite-artist to create the four newspaper ttakji sprites (256x256 transparent PNG), check consistency, and save them in the game assets folder.
```

Or, to get prompts without generating images:

```text
Use $ttakji-sprite-artist to write four prompts for a metal ttakji. Do not generate images.
```

The skill contains instructions and prompts. Generated newspaper PNG assets are available in `assets/sprites/ttakji/newspaper/`.

## Play — school through national championship

Open `index.html` in a modern browser, or run `npm start` and visit
`http://localhost:4173`. No install, build, external fonts, or network connection
is required to play; npm dependencies are only for browser tests. The game uses Canvas 2D, CSS, and synthesized Web Audio;
characters and scenery use geometric placeholders. Newspaper, colored-paper, and
hair-fiber ttakji use matching four-state transparent PNG sprites.
Newspaper sprites in `assets/` appear in the title, school, battle, completed folding,
and inventory HUD. The front changes to damaged after taking a hit; the reverse
image appears after the flip passes its midpoint. Equipment and training affect
the school rematch and later tournament stats.

### Controls

- Move: arrow keys / WASD, PC keyboard input only.
- Talk near the rival: E or Space.
- Dialogue: Space / Enter / Continue. First press reveals an unfinished line.
- Attack: select 내려치기, then stop the gauge with Space or mouse click.
- Fold: use number keys 1–4, or click the highlighted corner.
- Story notebook: J, or the story button at training/tournament facilities.
- Pause: Escape or Ⅱ. The game clock, gauge, and events freeze together.
- Sound and fullscreen controls are in the upper-right corner.

The screen keeps essential combat and menu labels. The rival introduces movement
and interaction through an in-world speech bubble, then explains attack and timing
in dialogue before the first hit. Focus uses F and is taught by the father during home practice.

### Chapter flow

Title → explore school → challenge the rival → interactive first attack → fixed
intro defeat → theft and closing narration → folding → paid home upgrade →
three practice hits with Focus →
return to school → a fair rematch → victory and a colored-paper ttakji reward.
A lost rematch can be retried or followed by more home practice; victory continues
into the village chapter below.
Practice unlocks 집중: once per rematch it slows the next timing gauge, without
changing damage.

Only `intro_battle` forces defeat. BAD / GOOD / PERFECT deal 10 / 24 / 40 damage.
The rival has 100 HP in both school encounters. After the home lesson, the player
returns with 120 HP and 25 attack; GOOD deals 30 damage. Enemy timing is randomly
sampled, and the rematch is won through the ordinary HP rule. Timing changes the first attack's damage and animation even
in the intro. The school chapter connects to the playable village championship described below.

### Save and pause

Scene checkpoints save automatically to browser localStorage. 이어서 하기 resumes
at school, home folding, home upgrading, practice, the school rematch, or a campaign checkpoint. Combat is resumed from the start
of the encounter, not mid-turn. Starting a new game replaces the current save.
Saves are scoped to this browser and URL; local-file storage depends on the browser.
If storage is unavailable, the game remains playable and reports that limitation.
Changing tabs pauses active gameplay. Returning to the title clears scheduled
attacks and transitions. Sound preferences are also saved locally.

### Source and verification

- `game.js`: chapter state, input, simulation clock, save, combat and audio.
- `world.js`: canvas scenes, movement rendering, fold / hit / flip effects.
- `rules.js`: shared timing and damage rules.
- `style.css`: integrated game HUD and PC controls.

Run `npm test` for rules and `npm run check` for JavaScript syntax.
Browser verification covers the full chapter, movement, paused timing, folding,
practice, checkpoint reload, one-use focus, both rematch outcomes, title navigation
during a pending enemy attack. Screenshot artifacts and the
playable ZIP are delivered separately.

## Village chapter — v0.3

Winning the school rematch now leads to the boss's departure, a tournament
advertisement, and a walkable village. Existing v2 `complete` saves continue into
this ending. Characters and buildings remain simple geometric placeholders;
newspaper, colored-paper, and hair-fiber ttakji each have four actual transparent
256×256 sprites.

The village contains a house (equipment), training ground, compression machine,
and tournament desk. Walk with arrows/WASD and press E at a doorway. Use the
arrow keys, Tab, Enter or Space inside facilities; E goes back outside. NPCs
introduce each facility on the first visit.

- School completion grants the colored-paper ttakji and 80 starting coins once.
- Compression adds 3 attack and 10 durability to the equipped ttakji, up to +5.
  The cost starts at 40 coins and increases by 30 each upgrade.
- Completing three timing hits grants one training point and 5 coins, regardless
  of accuracy. Every three points adds 2 player attack and 1 concentration, up to
  15 points. Concentration adds 80ms to the timing gauge's cycle per point.
- Village damage is `round(timing damage × attack / 20)`. Defensive effects halve
  damage before rounding; minimum damage is 1. HP reaching zero flips the ttakji.
  The opening defeat remains scripted, while the rematch uses learned upgrades.
  There is no random early flip or low-HP attack penalty.
- Tournament: neighbor (80 HP, 18 attack, 30 coins), kindergarten friend (110 HP,
  21 attack, 50 coins), balding uncle (150 HP, 24 attack, 120 coins). The friend
  halves incoming damage on even turns. The uncle lands a PERFECT on every third
  turn. These intentions are explained in dialogue and shown in speech bubbles.
- Each match begins at full durability. Losses retain earlier victories and
  earned money. Between matches you may train, equip, and upgrade. Round rewards
  are granted once, with progress saved before displaying the result.
- Winning the final grants the hair-fiber ttakji and **뿌리 버티기**: press R once
  per battle to halve the next incoming hit without spending your attack. Focus
  (F) also remains available once per match. Sparring at the training ground lets
  you use the new equipment and skill, without monetary rewards.

Campaign saves use `ddakzizon.campaign.v3`, recording money, equipment, upgrades,
training, unlocked skill, and tournament progress. Legacy school saves are read
when no campaign save exists. Reloading mid-match returns to the village with the
same round available. Reloading after the final reward resumes its story without
awarding money twice. Starting a new game resets campaign progress.

The playable campaign continues through the national championship (see v0.8 below).
Continental and higher tournaments and the fusion facility remain future content.
The city refinery is playable (see v0.6 below).

### Campaign development and verification

`progression.js` holds equipment, economy, progression, and save normalization;
`village.js` connects the new story, facilities, tournament, and skills to the
existing engine. `npm test` covers combat and progression; `npm run check` checks
all game scripts.

For repeatable browser checks, run `npm install` and `npx playwright install chromium`,
start the game with `npm start`, then run `npm run test:browser` in another terminal.
`BROWSER_EXECUTABLE` can point to an existing Chromium, `TEST_URL` changes the
server address, and `ARTIFACT_DIR` changes the screenshot directory (default:
the system temporary directory's `ddakzizon-checks`). Browser checks control timing
and RNG for repeatability and accelerate animation time on the main campaign run.

### Inventory and game menu

Press **I** (or the grid button in the HUD) to open the inventory; press I again
or select Continue to resume. **Esc** opens the menu, goes back from a submenu,
and resumes from the overview. The menu contains current progress, inventory,
player growth/skills, sound/fullscreen settings, and keyboard controls.

The inventory shows only owned ttakji, with their actual sprites, upgrade levels,
equipped badge, and stats compared with the equipped item. Select an item with the
mouse or arrow keys, then choose Equip using Tab/Enter or the mouse. Equipment can
be changed while exploring the village/city or using their facilities. During battles
and story events the inventory is read-only. The stolen newspaper ttakji is absent
until a new one has been folded. Equipment changes update the HUD, any underlying
facility preview, and the existing campaign save.

`menus.js` owns the modal interface and keyboard focus. Opening it freezes the
simulation clock and suspends game audio; the underlying game is inert until
resume. `tests/menus.browser.cjs` covers ownership, stat comparisons, equipment
persistence, facility preview refresh, battle restrictions, timing pause/resume,
settings, focus containment, and smaller desktop viewport bounds.

## City championship — v0.4

After the village championship, use **시 대회에 도전** at the village tournament
desk. A short introduction leads to a walkable city with a free return bus,
training ground, compression workshop, and tournament desk. Keyboard interaction,
I inventory, and Esc menus work the same way as in the village. Travel is free and
keeps both tournament records; each completed city round awards its prize once.

Entering the city increases compression's limit from +5 to +8 and the training
limit from 15 to 30. Existing upgrades, skills and equipment carry over. Each new
training level still adds 2 attack and 80ms to the timing cycle. The expanded limits
remain available when visiting village facilities.

| Round | Opponent | HP / attack | Pattern | Prize |
| --- | --- | --- | --- | --- |
| First | 박자왕 | 150 / 26 | PERFECT counter on even turns | 80 |
| Semifinal | 접기 장인 | 190 / 28 | Defends on odd turns; player PERFECT bypasses this defense | 140 |
| Final | 대장 | 230 / 32 | Repeats defense → regular attack → PERFECT counter | 300 |

Opponents explain their patterns before battle and show imminent defense/strong
counters in speech bubbles. HP reaching zero still determines victory. Battles
use the existing ttakji materials and four-state sprites; the city hub and arena
use geometric scenery and characters matching the game's placeholder style.

The first city victory unlocks **승부수 (C)**. Once per match, prepare it before an
attack: GOOD/PERFECT damage is multiplied by 1.5; BAD damage is halved. The modifier
is applied with attack and opponent defense before rounding. It can be combined
with Focus, and is consumed by the next hit. It is available for subsequent village,
city, training and sparring battles. The menu lists its unlock condition and key.

The final opponent is the former school boss. Winning resolves their unfinished
match and concludes with “너 한번 세계를 뒤집어보지 않을래”. City championship status
and the province entry qualification appear in the menu. The city desk also offers
a reward-free boss rematch. The province championship follows in v0.7 below.

Save format v3 remains compatible: missing city fields default to locked/zero;
entry requires the village championship. City introduction, first-victory skill
story, and championship story have separate checkpoints. Rewards and progress are
saved before the result screen, so reloading those stories cannot pay twice. A loss
or mid-match reload returns to the city with the same round available. Starting a
new game resets both tournaments and the new skill.

`city.js` owns the new hub and story. Shared growth, intentions and reward rules
live in `progression.js`; combat uses the existing engine. `npm run test:browser`
also runs the city championship and failure-path tests. The suite seeds completed
village saves and controls timing/RNG for repeatable combat, while exercising
actual keyboard travel, UI attacks, skills, results and checkpoint reloads.

## School learning loop — v0.5

The opening now teaches combat, then equipment growth, then lets the player use
both in the rematch. The flow is school loss → home folding → home compression →
Focus/timing practice → school victory → the existing village and city campaign.

The rival explains movement, interaction and timing, then reacts to the first hit
before delivering the scripted defeat. At home, the father guides four folds and
provides 40 coins once for reinforcement materials. The player reviews attack
20→23 and durability 110→120 and activates **보강하고 압축하기** with mouse or
Enter/Space. This spends 40 coins through the same upgrade rule as the village
machine; it is not a cosmetic bonus. The press animation uses the simulation clock
and pauses with the menu. The +1 item stays in inventory through later chapters.

The father then teaches F during three actual practice attacks. Completing the
lesson grants three training points once: player attack +2, concentration +1.
Combined with the upgraded ttakji, the rematch uses 25 attack and 120 HP. GOOD now
deals 30 instead of the introductory 24; the focus cycle becomes 2480ms including
concentration. The rival keeps 100 HP; only the opening defeat is a fixed event.
A failed rematch offers either an immediate retry or home practice, which does not
repeat the growth reward.

`school.js` owns the workbench and tutorial-specific presentation. Persistent
allowance, upgrade-completion and practice-completion flags live in the existing
v3 profile. Purchases are saved before animation; reload cannot duplicate the
allowance, charge again, or lose the upgrade. The new `home_upgrade` checkpoint
can resume before or after purchase. Old unfinished practice/rematch saves first
visit the new upgrade lesson; completed village/city saves continue as before.

`tests/school.browser.cjs` plays from new game through forced defeat, keyboard
folding, paid upgrading, checkpoint reloads, paused pressing, Focus practice and a
fair rematch victory. It also checks the return-to-practice path and one-time growth.


## City refinery — v0.6

The city **딱지 공방** now offers compression and **제련소 · 형태 가공**.
The owner introduces the choice through dialogue on the first refinery visit.
Use arrows and Enter to select a form, compare the equipped item's resulting
attack/durability, then activate the purchase button with Enter or Space.

| Form | Attack | Maximum durability | First processing cost |
| --- | --- | --- | --- |
| 기본형 | unchanged | unchanged | free |
| 공격형 | +8 | −20 | 90 coins |
| 수비형 | −4 | +35 | 90 coins |

A form is unlocked separately for each ttakji. Only the first processing costs
money; switching among unlocked forms, including the original, is free. One form
is active per item. Compression, player growth, and skills still apply normally;
form bonuses affect actual battle HP and damage. The material's four existing
sprites are retained, while inventory, workshop and battle labels identify its
form. There is no chance of failure or item destruction.

Processing happens in city, province and national workshops outside combat. I opens the inventory to change
the item under the workshop; its preview refreshes without making a purchase.
Processed equipment works in village matches too. Money, unlocked forms and active
choices save together immediately. Older saves default to the original form;
new games reset all forms. Missing or invalid entries are normalized on load.

`forge.js` owns the facility UI and NPC introduction. Pure costs, per-item unlocks,
stat changes and save normalization live in `progression.js`. The browser suite
includes `tests/forge.browser.cjs` for keyboard operation, payment/reload, free
switching, equipment changes, insufficient funds, pause/combat restrictions,
actual battle stats with skills, travel and smaller desktop layouts.


## Province championship — v0.7

After the city final, select **도 대회에 도전** at the city tournament desk. A short
conversation with the former school boss introduces the next arena. The province
hub contains a free return bus, training, compression/refining workshop and bracket.
The existing PC controls, inventory, pause, skills and equipped forms carry over.

Province entry permanently raises compression to +12 and training to 45 points.
These caps remain available while visiting earlier areas. Each match starts with
full item durability; earlier wins, equipment and money survive a defeat. The
three brackets progress independently and each province prize pays only once.

| Round | Opponent | HP / attack | Announced pattern | Prize |
| --- | --- | --- | --- | --- |
| First | 철벽 선배 | 260 / 34 | Always defends; PERFECT bypasses defense | 180 |
| Semifinal | 엇박자 선수 | 280 / 36 | Odd-turn PERFECT, even-turn BAD counters | 260 |
| Final | 도 챔피언 | 320 / 40 | Defense → PERFECT → BAD, repeating | 500 |

The champion's defense halves even PERFECT hits. Opponents explain these rules
before the match, and their next defensive/strong/weak action appears in a speech
bubble. Existing F/R/C skills can be timed around these openings. Other counters
use the existing random timing distribution. Only the opening school defeat is
scripted; province matches use ordinary damage and zero-HP defeat.

Winning the final gives 500 coins and national qualification, followed by a short
award scene. The menu records the province championship. The desk offers the story
again, a reward-free former-champion sparring match, and travel to the national
championship added in v0.8 below.

`province.js` owns the hub and story; growth, reward gates and attack intentions
remain in `progression.js`. Shared facilities return to the current hub, including
refining and inventory changes. Geometric scenery and existing material sprites
are reused. The v3 save gains province entry/round fields plus intro and reward
checkpoints. Older profiles start with this stage locked; entry requires a city
championship. Intro/final reload resumes its dialogue without repeating prizes.

`tests/province.browser.cjs` exercises keyboard travel from a legacy city-champion
save, the intro reload, upgrades/refining, inventory, training, all three matches,
precise announced damage, skill combinations, return travel, reward reload,
loss/retry, cancellation, locked entry and fresh-game reset. The existing browser
suite remains part of `npm run test:browser`.


## National championship — v0.8

At the province desk after winning its final, select **전국 대회에 도전**. Father
comes to watch, and the coach introduces the new opening mechanic in dialogue.
The national hub includes a free return bus, training, compression/refining and
an eight-player bracket represented by the player's three matches.

| Round | Opponent | HP / attack | Pattern | Prize |
| --- | --- | --- | --- | --- |
| Quarterfinal | 한방 승부사 | 380 / 42 | Odd turns: defense + BAD; even turns: exposed + PERFECT | 300 |
| Semifinal | 종이 수비수 | 420 / 44 | Two defending turns, then exposed + BAD; repeats | 450 |
| Final | 전국 챔피언 | 480 / 48 | Defense → ordinary counter → PERFECT → exposed + BAD; repeats | 800 |

An **exposed** turn takes 1.5× player damage. This multiplies the existing timing,
attack and wager factors before a single final rounding. A PERFECT wager into an
opening therefore deals 2.25× the ordinary PERFECT damage, while BAD still suffers
the wager penalty. National opponents' defense halves even PERFECT hits. Their
patterns are explained before each match; exposed turns display both the damage
bonus and the incoming strong/weak counter. The final's ordinary counters use the
existing random timing distribution. Existing opponents retain their damage rules.

Entry raises compression to +16 and training to 60; equipment, forms, coins and all
F/R/C skills carry over. Facilities and inventory save to the current national
checkpoint. Going back to previous areas retains the new caps and every bracket.
Defeat is fair and preserves earlier wins; each prize is paid once, totaling 1,550.
The final leads to a family award scene and continental qualification. That next
competition remains future content. The completed desk offers the story again and
reward-free sparring.

`national.js` owns the hub and story, while `progression.js` owns entry/reward gates,
opening bonuses and save normalization. Old saves default national progress to
locked; only a province champion may enter. Intro/final checkpoints resume their
stories after reload without issuing duplicate rewards. Fresh games clear progress.
The existing geometric scenery and four-state material sprites are reused.

`tests/national.browser.cjs` plays through keyboard travel, intro reload, growth,
refining/inventory, training, all three matches and opening/skill combinations,
return travel, final reload, defeat/retry, cancellation and entry/reset gates.


## Stories between matches — v0.9

Each village, city, province and national tournament now has three story chapters,
one before each match. The next match opens after both activities in its chapter
and their closing dialogue are complete. This adds **12 chapters, 24 activities
(17 fair duels and 7 accuracy drills), and 132 dialogue lines**, before counting
the existing school tutorial and 12 main tournament matches. Animation speed,
enemy HP in the original brackets, and travel speed have not been stretched.

| Region | Chapters |
| --- | --- |
| Village | 같이 놀 사람 / 아빠의 접힌 기억 / 아저씨의 비밀 특훈 |
| City | 낯선 경기장의 첫 친구 / 한 번에 끝내려는 마음 / 끝내지 못한 운동장 |
| Province | 두 사람의 원정 / 틀려도 이어지는 박자 / 응원석 한 자리 |
| National | 예전의 나를 만나다 / 이기는 법을 나누다 / 한 장에 담긴 사람들 |

The former school rival learns to play without taking another child's ttakji;
the father shares his unfinished childhood tournament; the balding uncle talks
about his daughter; the former boss becomes a practice partner. Later chapters
bring these characters together and let the protagonist help a child facing the
same loss that started the game.

Press **J** for the paused story notebook. It shows all regions and progress;
select an available chapter in the current region to open its facility page.
The training ground and tournament desk also link to the notebook. Future chapters
show when they unlock, the next activity shows its objective, and completed stories
can be reread without receiving rewards again. Inventory stays usable outside
encounters, including while viewing a story facility.

Each drill has five hits with a displayed minimum GOOD/PERFECT requirement. Some
duels require using Focus, Guard or a Wager hit as well as winning. Objectives are
introduced through NPC dialogue and shown in the battle header; failing a goal
allows a free retry or a return to preparation. Defeat and failed objectives pay
nothing and preserve completed activities. Skills reset per encounter.

Each successfully completed activity pays once: 10/20/35/50 coins by region and
one training point, respecting existing caps. Across all stories this is 690 coins
and up to 24 training points. These rewards fund equipment upgrades during the
longer journey. There are no added timers, entry fees or mandatory repeat-farming
loops. Actual playtime depends on reading, timing accuracy and retries; the tests
measure content coverage, not a promised human completion time.

Progress saves per activity before its result screen. A pending ending also saves,
so reloading resumes the dialogue and cannot pay again or erase the completed
encounter. Old saves retain all tournament wins and start the new stories unplayed:
already unlocked chapters remain available, including for existing champions.
Previously completed tournaments are not relocked. A fresh game clears the notebook.

`journey-data.js` holds authored chapters and pure progression rules; `journeys.js`
connects them to the common battle, facility, save and menu systems. Browser tests
play all 24 activities and all 12 tournament matches from an ordinary post-school
profile, using earned coins/upgrades only. Timing and RNG are controlled and scene
timers accelerated for reproducibility. Existing combat regression fixtures explicitly
start after story preparation; the new full campaign test exercises the real gates.
