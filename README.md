# ddakzizon

## 개발 대상 플랫폼

**PC 웹 브라우저 전용 · 키보드와 마우스 조작을 기준으로 개발합니다.**
휴대폰·태블릿의 터치 조작과 모바일 전용 UI는 개발·검증 범위에 포함하지 않습니다.
권장 창 크기는 1280×720 이상이며, 작은 PC 창은 1024×600까지 확인합니다.
이 기준은 이전 기획 문서의 모바일 지원 설명보다 우선합니다.

## 스크롤되는 픽셀 월드 · 32×32 스프라이트

등장 캐릭터 12종을 모두 실제 **32×32 RGBA 픽셀 아트**로 새로 그렸습니다. 각 캐릭터의 대기·걷기 A/B·내려치기까지 총 48장입니다.
정수 배율·보간 없는 확대로 픽셀을 선명하게 유지하고, 대화·메뉴 초상화에도 같은 그림을 사용합니다. `npm run art:characters`로 원본 도안에서 다시 생성할 수 있습니다.
탐험에는 맵 폭 1280~2200에 맞춘 **긴 파노라마 배경 15종**을 추가했습니다. 플레이어를 따라 카메라가 이동하면 배경의 건물·바닥·소품·NPC도 같은 월드 좌표로 움직입니다. 대륙·세계·행성 허브도 폭 1920의 스크롤 구역입니다.
기존 고정 장면용 배경 **16종**도 픽셀 아트입니다. 교실·정자·집·마을과 시·도·전국 경기장, 대륙·세계·행성까지 각각 다른 240×160 배경을 사용합니다.
문·게시판·벤치·식탁·대전 매트 등 소품 17종도 32×32 픽셀로 다시 그렸습니다. 딱지 46종의 4상태, 184개 PNG도 전부 실제 32×32 RGBA로 통일했습니다. `npm run art:scenes`, `npm run art:panoramas`, `npm run art:characters`, `npm run art:items`로 각 아트 규격을 재생성/검증합니다.
[이미지 구성과 적용 범위](assets/art/README.md) · 서버 실행 후 `npm run test:art`.

## 최소 플레이 버전 v0.11

[최소 구현 문서](docs/game-planning/07-minimum-playable-version.md)를 기준으로,
타이틀의 **처음부터 시작**에서 아래 흐름을 플레이할 수 있습니다.

수업이 끝난 교실 → 친구들의 딱지 약속 → **관심이 생겨서 따라간다** 선택 → 운동장 정자 →
짧은 공방 → 상대 딱지가 내구도 1로 버티는 아쉬운 패배 → 페이드아웃/인으로 집에 도착 →
아빠와 대화하며 보강지·압축을 배움 → 신문지 딱지 접기·강화 +1·자동 장착 →
집 표적에 한 번 연습 → 학교 재대결 → 학교 앞 포스터 → 주민센터 접수·임시 대진표·완료 안내.

```sh
npm start
```

브라우저에서 `http://localhost:4173`을 엽니다. 별도 빌드나 서버 API는 필요하지 않습니다.
게임 실행에 npm 의존성은 필요하지 않으며, `npm ci`는 개발용 브라우저 테스트 도구를 설치합니다.

- PC: 좌우 방향키 / A, D 이동 · E 상호작용 · Space 공격과 게이지 정지.
- I 인벤토리 · M 지도 · Esc 메뉴. 대화는 다음 버튼이나 Space로 넘기거나 건너뛸 수 있습니다.
- 첫 경기는 마지막 한 수까지 몰리는 이야기 경기입니다. 재대결은 실제 승패를 적용하며,
  패배하면 즉시 재도전하거나 집에서 연습할 수 있습니다.
- 연습은 빗나가도 완료됩니다. 결과 화면에서 반복하거나 끝낼 수 있습니다.
- 오프닝 대화·선택지와 주요 사건, 멈춘 위치를 자동 저장합니다. **이어서 하기**로 복귀합니다.
  브라우저 저장이 차단된 경우 안내를 표시하고 현재 세션은 계속 플레이할 수 있습니다.
- 아빠에게 배우는 첫 강화 이후의 상점·고급 압축·제련·융합·훈련·접수 이후 경기는 이 짧은 버전에서 준비 중으로 표시합니다.

`minimum-rules.js`에 문서의 임시 전투 수치, 4단계 타이밍 판정, 피해·뒤집기 계산식,
진행 단계와 대진표를 모았습니다. `minimum.js`는 기존 맵·렌더러·대화·시계를 재사용해
짧은 여정을 연결합니다. 확정된 밸런스나 최종 아트를 의미하지 않습니다.

기존 긴 캠페인은 **기존 전체 캠페인 시작 / 전체 캠페인 이어하기**에서 계속 이용할 수 있습니다.
저장 키는 짧은 버전 `ddakzizon.minimum.v1`, 기존 캠페인 `ddakzizon.campaign.v3`로 분리됩니다.

개발 검증(별도 터미널에서 `npm start` 실행):

```sh
npm ci
npm run check
npm test
npm run test:opening
npm run test:minimum
npm run test:browser
```

브라우저 테스트는 로컬 Chromium이 있으면 사용하고, 없으면 `npx playwright install chromium`으로
설치할 수 있습니다. `BROWSER_EXECUTABLE`, `TEST_URL`, `ARTIFACT_DIR`로 실행 환경을 바꿀 수 있습니다.
`npm run test:browser`에는 기존 캠페인과 새 최소 버전의 검증이 모두 포함됩니다.
구체적인 검증 범위와 한계는 [검증 기록](tests/VALIDATION.md#최소-플레이-버전-v011)을 참고하세요.

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

## Full campaign — school yard to the planet exchange (v1.0)

Open `index.html` in a modern browser, or run `npm start` and visit
`http://localhost:4173`. No install, build, external fonts, or network connection
is required to play; npm dependencies are only for browser tests. The game uses Canvas 2D, CSS, and synthesized Web Audio;
characters and scenery use geometric placeholders. Newspaper, colored-paper, and
hair-fiber ttakji use matching four-state transparent PNG sprites.
Newspaper sprites in `assets/` appear in the title, school, battle, completed folding,
and inventory HUD. The front changes to damaged after taking a hit; the reverse
image appears after the flip passes its midpoint. Equipment and training affect
the school rematch and later tournament stats.

> 전투 공식, 스킬, 터치 조작과 설정의 최신 내용은 맨 아래 **v0.11** 섹션을, 프롤로그·튜토리얼·대회 흐름은 **v0.12** 섹션을, 도 대회부터 행성 교류전·엔딩까지는 **v1.0** 섹션을 따른다. 버전별 섹션의 옛 수치(BAD/GOOD/PERFECT 10/24/40, 집중·뿌리 버티기·승부수 등)는 기록용이다.

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

`province.js` (v1.0: merged into `stages.js`) owned the hub and story; growth, reward gates and attack intentions
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

`national.js` (v1.0: merged into `stages.js`) owned the hub and story, while `progression.js` owns entry/reward gates,
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

## Continent, world and planet — v1.0

After the national title, the national cup desk opens the **continent** tournament,
then **world** and **planet**. All three shared one hub flow in `frontier.js` (v1.0: merged into `stages.js`)
(transport, training, workshop, cup desk) with three rounds each, new opponent
patterns, and story beats: the old boss returns to say "세계를 뒤집어보지 않을래",
and the planet title ends on a `????` teaser for the next stage.

- Growth caps: continent +20 / 75 training, world +24 / 90, planet +28 / 105.
- **Fusion machine (융합기)**: from the continent workshop, 1500원 melts the
  newspaper, colored-paper and hair ttakji into one fusion ttakji (HP 165, attack 34,
  focus +1) that starts at the average of their compression levels. Sprites live in
  `assets/sprites/ttakji/fusion/`.
- **Worn-ttakji rules** (continent and above): attack falls toward 75% as HP drops
  (`TtakjiRules.strength`), and below 30% HP any hit can flip a ttakji early, up to
  a 50% chance for a PERFECT hit (`TtakjiRules.flipChance`). Earlier tiers keep
  their original balance.

Verification: `npm test` covers tier order, prizes, fusion and save validation;
`node tests/frontier.browser.cjs` covers entry, reload, fusion, the worn rules and the
`????` teaser.

### Stories and achievements — v1.1

- Nine new story chapters (18 activities) for the continent, world and planet,
  gating each tournament round the same way as earlier tiers: a desert child with no
  shared language, the ice master's apprentice, a match with Dad, stage fright, the
  boss's apology, the hometown care package, zero gravity, a Martian kid who lost his
  ttakji, and a hologram of the day it all started. 21 chapters / 42 activities total.
- **도전 과제** menu tab: 19 achievements (tier titles, compression, collection, forms,
  player level, stories, savings) that each pay coins once; the tab shows how many are
  ready to claim.

### Catalog ttakji — v1.2

The sprite catalog in `assets/sprites/ttakji/generation.json` supplies all 42 new
collectible ttakji: the requested 45 types plus fusion (46 playable types), defined in `progression.js`.

- **Rival trophies (18)**: every city-to-planet tournament rival plays with a catalog
  ttakji and hands it over the first time you beat them (L-folder, accordion folder,
  cardboard, iron, rubber, copper, shuriken, encyclopedia, certificate, glass, quartz,
  wood, fish and chips, semiconductor, diamond, slime, robot, uranium). The result card
  shows the ttakji you won.
- **딱지 가게 (24)**: a shop button in every workshop sells new ttakji as tiers open
  (village: school papers, city/province: household, national: food, continent:
  technology, world: diffuser and Hunminjeongeum), 60–7000원.
  Special stock includes ragged (village), couple gum (city), piano (national),
  Lego (continent), Saimdang (world), and magic carpet (planet).
- Each item has its own HP, attack and focus bonus and starts at +0 compression.
- Every playable type has separate base, flipped, inventory, and damaged sprites.
  All 184 runtime PNGs are 32×32 RGBA. The renderer switches battle states, while menus,
  the HUD, workshops, shops, and trophy rewards use the same item IDs.
  Base fallback remains available for a failed image request.
- `npm test` checks catalog coverage, PNG headers, acquisition, upgrades, and save
  restoration. `node tests/sprites.browser.cjs` decodes all 184 images and checks
  purchase, inventory equipment, reload, and all 138 battle sprite transitions.
- New achievements: 10 ttakji, every ttakji, and five shop purchases.

### v0.10 — 걸어서 이어지는 뒤집마을

`docs/game-planning/06-village-exploration.md`를 기준으로 탐험 맵을 교체했다.
집(1280) ↔ 골목(1800) ↔ 광장(2200) ↔ 주민센터(1800) ↔ 학교 앞(1400) ↔ 운동장(1600), 주민센터 안에는 별도 접수 로비(1280)가 있다.
시·도·전국 로비도 각각 학교 체육관, 철제 압축 경기장, 대형 실내 체육관으로 교체했다. 전투장은 같은 지역의 관중·설비·현수막을 사용한다.

- A/D 또는 좌우 방향키로 이동. E/Space로 가장 가까운 대상과 상호작용. 같은 거리에서는 NPC 우선. M은 지도, 목적지 안내는 설정에서 끌 수 있다.
- 첫 패배 후 페이드 전환으로 집에 도착해 아빠와 대화하며 접고 강화한다. 연습 뒤 집에서 학교로 돌아와 재대결하고, 학교 앞 포스터를 읽은 뒤 주민센터 로비에서 접수한다.
- 기존 12개 이야기와 대회 진행, 능력치와 보상은 유지한다. 기존 저장에는 마을 좌표와 재료를 안전한 기본값으로 추가하고, 이미 학교를 완료한 옛 저장은 포스터 조건을 인정한다.
- 잡화점 신문 10원 / 색종이 20원. 확인 후 1장 구매. 집 식탁에서 해당 재료 1장으로 보유 딱지를 1단계 보강(기존 강화 상한 적용). 초반 접기·재도전에는 구매가 필요 없다. 이 가격과 보강 조합은 기획의 미정 항목에 대한 초기 구현값이다.
- 집/훈련장의 무료 연습은 능력치·상금 보상이 없다. 유료 훈련은 확인 후 30원, XP +3(상한 적용). 기존 이야기 과제와 훈련 대결은 별도 메뉴에서 이용한다.
- 동네 제련소는 도 대회 진출 후 이용한다. 이미 사용하던 시 대회 공방의 제련은 유지한다. 전국 우승 뒤 대륙·세계·행성 대회로 이어지며, 대륙 공방부터 융합기를 이용할 수 있다.
- 위치·방문 기록·포스터 확인·재료·안내 설정을 기존 v3 저장에 포함한다. NPC 대화, 현수막, 표창장·트로피가 진행에 따라 변한다.

`exploration.js`의 구역 데이터가 출입구·폭·상호작용 좌표를 관리하고, `map-renderer.js`가 건물/바닥/전경을 분리해 그린다. 캐릭터와 배경은 기존 프로토타입의 도형 아트를 유지하며 딱지 PNG는 그대로 사용한다.

### v0.11 — 전투 규칙·스킬·터치 조작·설정 (기획 03 §2, 06 §2)

- 판정 4단계: 완벽 ×1.3 / 좋음 ×1.1 / 보통 ×1.0 / 빗나감 ×0.6. 게이지에 세 구간(노랑·초록·파랑)과 범례가 보인다. 집중력이 구간을 넓히고(1당 +2.5%, 최대 +50%), 강타는 구간을 0.6배로 좁힌다. 게이지 속도는 설정값을 따른다.
- 피해 = max(1, 반올림((공격력 + 힘 − 상대 방어력 × 0.5) × 판정 배율 × 스킬·자세 배율)). HP는 0 아래로 내려가지 않는다. 예: 공격 20, 힘 4, 방어 8, 좋음 → 22.
- 뒤집기 확률 = 10% + 60% × (1 − 현재 HP / 최대 HP) − 안정성 × 0.5%p + 스킬 보정, 5~75%로 제한. 모든 대회 단계에서 공격 뒤마다 판정하며 HP 0이면 판정 없이 뒤집힌다. 예: HP 48/100, 안정성 10 → 36.2%.
- 딱지 능력치: HP·공격력·방어력·안정성(+집중력 보너스). 신문지 딱지 100 / 20 / 8 / 10. 압축 1회마다 겹 +1, 공격 +3, HP +10, 방어 −1(최소 0). 비용은 그대로.
- 선수: 힘 4에서 시작해 훈련 레벨당 +2, 집중력은 레벨 + 딱지 보너스.
- 상대는 같은 공식을 쓴다. 판정은 상대별 분포(novice·club·ace·master·legend)에서 뽑고, 기존 패턴(방어·빈틈·완벽/빗나감 예고)은 유지한다. 방어/관통/빈틈 자세는 피해 배율(×0.5 / ×1.5)로 남았다. 상대 HP는 새 공식에 맞춰 기존의 75%로 조정했다.
- 스킬(집중·뿌리 버티기·승부수 대체): 정밀 타격 R(피해 ×0.8, 이번 타격 뒤집기 +15%p, 쿨타임 3턴, 마을 우승 후 박태풍), 강타 C(피해 ×1.4, 구간 좁아짐, 쿨타임 3턴, 시 대회 첫 승리 후 코치), 꾹 눌러 펴기 F(최대 HP 15% 회복, 공격·뒤집기 없음, 경기당 1회, 도 대회 첫 승리 후 철벽 선배). 쿨타임은 자기 턴 시작마다 1 감소하며 버튼에 남은 턴이 표시된다. 스킬을 가진 상대도 같은 쿨타임을 따른다. 옛 저장은 진행도에서 스킬을 다시 계산한다.
- 첫 학교 경기는 그대로 패배하며, 부하의 반응 대사가 판정 4단계에 맞춰 바뀐다.
- 탐험 중 화면 왼쪽 아래 ◀ ▶(누르고 있는 동안 이동, 여러 터치 지원), 오른쪽 아래 상호작용 버튼. 마우스로도 쓸 수 있다. Esc는 열린 시설·일반 대화·타이틀 설정을 먼저 닫고, 아무것도 없을 때 메뉴를 연다.
- 설정: 텍스트 속도(느림/보통/빠름/즉시), 게이지 속도(느리게/보통/빠르게)를 `ddakzizon.settings`에 저장. 타이틀에 설정 버튼이 있고, 저장이 없으면 이어하기는 비활성으로 보인다.
- `tests/rules.test.js`가 공식·예시·쿨타임을 검사하고, 브라우저 테스트는 결정적인 난수(0.9/0.95: 뒤집기 없음, 상대 빗나감)로 패턴·스킬 수치를 확인한다.

### v0.12 — 주인공 이름, 프롤로그·튜토리얼, 공통 대회 시스템 (기획 04 §2-6, 05 §2-6·§12, 06 §4-9)

- **주인공 이름**: 처음부터 시작하면 이름을 묻는다(최대 8글자, 글자·숫자·공백만, 비우면 ‘주인공’). 대사의 `나`와 `{name}`, 전투 HUD, 메뉴에 쓰인다. 이름이 없는 옛 저장은 기본값으로 옮긴다.
- **인물 이름 통일**: 민수(부하), 도윤(대장), 하나(유치원 친구), 박태풍(탈모 아저씨), 앞집 아저씨. 이야기 수첩 에피소드도 같은 이름을 쓴다.
- **프롤로그**: 내기 대사 → 판정별 첫 반응 4종 → 고정 패배(게임 전체에서 이것 하나). 도윤은 딱지를 *보관*한다(“잃어버리면 곤란하잖아.”). 신문 조각을 줍고, “그날 뒤집힌 건 내 딱지가 아니라 인생이다.” 뒤에 작은 글씨가 붙는다. 패배와 신문 조각은 장면 전에 저장되어 다시 실행되지 않는다.
- **튜토리얼**: 집으로 걸어가 식탁에서 접는다. 첫 시도는 비뚤어지고(“그건 딱지야, 종이비행기야?”) 틀린 모서리를 눌러도 계속 진행된다. 접기는 능력치를 바꾸지 않으며, 유료 압축·XP 보너스 단계는 없앴다. 지우개 표적 연습 3회(첫 타격은 양말), 마지막엔 뒤집기 연출. 공격 1회 + 게이지 정지 1회만 필수이고 연습은 반복 가능하다. 재대결 패배 시 “접힌 선을 한 번 더 눌러 볼까?”와 함께 재도전/집에서 연습을 고른다.
- **공통 대회 시스템** (`tournament.js` + `P.tournaments`): 정류장 대회 선택 → 접수 → 대진표(현재 라운드, 상대 딱지·성향 힌트, 내 경기 결과, 다른 참가자 경기 결과) → 준비 화면(장착 딱지·능력치·스킬, 딱지 바꾸기, 강화·훈련하러 가기, 경기 시작, 뒤로) → 경기 → 결과(최초/반복 보상 구분, 해금, 다음 경기·재도전·준비 화면·마을로). 보상은 `P.completeMatch`가 경기 기록과 함께 한 번만 지급하고, 대회 도중 재접속하면 마지막으로 끝낸 경기 뒤 대진표에서 시작한다. 우승 뒤 자유 경기는 최초 상금의 20%만 준다.
- **마을 대회(주민센터 컵)**: 앞집 아저씨(종이 박스, 방어↑ 공격↓, 50원, 압축기 안내) → 하나(색종이, 균형형, 70원 + 색종이 재료) → 박태풍(머리카락, 첫 턴 스킬 없음, 완벽 판정 시 뒤집기 +10%p, 150원 + 정밀 타격 + 머리카락 딱지 + 표창장 + 시 대회 참가권). 사회자 “아, 아”, 현수막, 물컵 연출. 정밀 타격은 결승 결과 화면에서 지급하고 광장의 박태풍은 설명만 한다. 표창장은 보관품이며 집 식탁에서 ‘마을 표창장 딱지’로 접을 때 원본 보관 여부를 묻는다. 벽의 복사본 액자는 그대로 남는다.
- **NPC 배치**: 대회 중 앞집 아저씨·하나는 대회장 로비에만 있고, 박태풍은 결승 전 주민센터 앞 의자 → 우승 후 광장. 골목 아저씨 대사는 단계별(튜토리얼 전/패배 뒤/대회 전/대회 후). 민수는 재대결 뒤 단계별 응원 대사.
- **시 대회(학교 체육관)**: 지역구 예선 서준(L자 파일, 공격↑ 안정↓, 100원) → 한별(모의고사 종이, 방어/공격 교대, 빨간 점수, 120원) → 시 결승 도윤(방어·정밀 타격·정타 혼합, 300원 + 도 대회 참가권, 패배 시 대사 후 재도전). 첫 시 경기 전 복도 재회에서 원래 딱지 ‘첫 신문지 딱지’를 돌려받는다(한 번만, 건너뛰어도 지급). 강타는 시 첫 승리 후, 꾹 눌러 펴기는 도 첫 승리 후(v0.11 그대로).
- **해금 시점**: 마을 압축기는 1회전 뒤. 제련소는 도 대회 우승 뒤(그전엔 ‘공사 중’, 이미 산 형태는 계속 적용). 융합기는 대륙 대회부터(기존).
- **대사 건너뛰기·다시 보기**: 주요 장면에 ‘건너뛰기’ 버튼. 건너뛰어도 같은 완료 처리를 실행하므로 보상·상태 변화는 빠지지 않는다. 본 장면은 메뉴 ‘이야기 다시 보기’와 광장 게시판에서 다시 볼 수 있고, 다시 보기는 진행을 바꾸지 않는다.
- **이야기 수첩 에피소드는 선택**: 대회 경기를 막지 않는다. 보상과 진행은 그대로.
- 데이터: 장면 대사는 `story-data.js`, 대회 정의는 `progression.js`의 `tournaments`(id, stage, name, venue, field, opponents, condition, open/entered/enter/award, firstReward, others). 상대 데이터에 `hint`(성향), `unlocks`, `calmStart`, `perfectFlip`이 추가됐다. 저장에 `name`, `villageEntered`, `keepsakes`, `story`, `map.tournament`가 추가됐다.

### v1.0 — 도 대회부터 행성 교류전, 엔딩까지 (기획 04 §7-13, 05 §2-1·§2-3·§7-11, 06 §4-1·§4-4)

- **모든 대회가 공통 흐름으로**: 도·전국·대륙·세계·행성 대회도 `tournament.js`의 대진표(다른 참가자 8명) → 준비 → 경기 → 결과(최초/반복 보상) → 재도전·준비 화면 → 재접속 복귀 → 우승 후 자유 경기(최초 상금의 20%)를 쓴다. 대회장은 모두 걸어 다니는 구역(`exploration.js`의 `province`~`planet`)이고, 접수처가 대진표를, 정류장이 대회 선택을 연다. 대회별 화면 코드(`province.js`, `national.js`, `frontier.js`)는 지우고 `stages.js` 하나로 합쳤다.
- **상대와 상금** (밸런스는 `tests/balance-sim.cjs`로 시뮬레이션, 아래 표):

| 대회 | 1회전 | 준결승 | 결승 |
|---|---|---|---|
| 도 · 시립 경기장 | 상자왕 · 종이 박스, 방어형 · 200원 | 최단단 · 압축(철) 딱지, 방어↑ 안정 0 · 250원 | 윤서 · 피아노 딱지, 정확한 4박자, 낮은 내구도에선 정해진 정타 없음 · 600원 + 제련소 + 전국 참가권 |
| 전국 · 대형 실내 체육관 | 테이프 딱지 선수 · 절반 아래에서 두 번까지 회복 · 400원 | 공인 딱지 선수 · 표창장 딱지, 균형형 · 500원 | 이규격 · 백과사전 딱지, 다음 수를 알리지 않음(7수 고정 표) · 1200원 + 융합기 + 대륙 참가권 |
| 대륙 · 국제 전시장 | 마리 · 식빵 무늬 종이, 버티기 · 800원 | 리오 · 구리색 종이, 공격↑ 안정↓ · 1000원 | 아라 · 레고 딱지, 거꾸로 접기(첫 박자 정타) · 2500원 + 세계 참가권 |
| 세계 · 원형 경기장 | 미라 · 유리 무늬 투명 종이, 방어형(완벽만 뚫림) · 1500원 | 연맹 추천 선수 · 반도체 딱지, 균형형 · 2000원 | 한결 · 다이아 딱지, 상황형(뒤지면 막고 앞서면 몰아침, 정밀·강타·회복) · 5000원 + 세계 우승 트로피 + 행성 초대장 |
| 행성 · 우주 정거장 | 모서리 셋 · 석영 딱지, 안정↑ 공격↓ · 3000원 | 반짝 · 표창(별) 딱지, 게이지 ×0.8(설정 ‘느리게’면 그대로) · 4000원 | 무중 · 슬라임 딱지, 상황형 · 10000원 + 교류전 우승 장식 |

- **도 대회**: 첫 경기 전 박태풍의 편지(한 번만). 준비 화면에 보유 딱지 중 공격형·방어형 추천을 나란히 보여 주고 한 번에 장착할 수 있다(강제 없음). 최단단의 바닥 움푹·무게 재기 개그와 ‘강한 딱지 ≠ 두껍고 무거운 딱지’ 교훈. 꾹 눌러 펴기는 1회전 뒤 상자왕이 알려 준다. 결승 후 윤서 “좋은 딱지를 믿는 만큼 네 손도 믿어”, 박태풍 답장 “잘했다. TV에 내 머리 정수리만 나왔다.” 우승 시 제련소 개방.
- **전국 대회**: 후원사가 **공인 딱지**(새 선택 장비, 평범한 균형형 능력치)를 무료로 권한다. 접수 화면의 버튼으로 받을 수 있고, 받지 않아도·받고 안 써도 된다. 1회전 뒤 별도 장면에서 도윤이 공인 딱지 선수에게 지고(“내가 익숙한 방식을 끝까지 믿지 못했어”), 대진표도 그때 결과를 보여 준다. 결승 전 이규격의 자 재기 개그, 결승 후 “틀린 접기인 줄 알았는데, 다른 접기였군요”, 관중석의 백지훈. 우승 시 **융합기 개방**(이전: 대륙 진입 시).
- **대륙 대회**: 같은 국가 대표 도윤, 번역기 개그(절대 뒤집어지지 않은 감자). 대진표에 **무료 연습전**(다음 상대와 같은 데이터, 보상·기록 없음). 1회전 뒤 도윤이 다른 경기에서 탈락하고 준비를 돕는다. 결승 전후 아라와 접기 교환, 우승 뒤 백지훈의 새 국제 규격 발표(안전 규정 + ‘지정 소재와 형태만’ 검토).
- **세계 대회**: 하나의 영상 통화 “그럼 내 딱지도 이제 못 쓰는 거야?”, 도윤의 “처음 널 만났을 때…”, 첫 딱지. 1회전 뒤 회장이 과거 사고를 설명하고, 준결승 뒤 공개 논의에서 시범 경기·대표 회의를 통한 검토를 약속한다(경기 한 번으로 규정이 바뀌지 않음). 보유 장비는 어느 시점에도 쓸 수 없게 되지 않는다. 결승 한결 대사, 우승 뒤 대표 회의·시험 운영 발표, 화면 속 박태풍·하나·민수, 하늘의 딱지 그림자와 행성 초대장(“그래서 내가 도 대회에서 잘하라고 했잖아.” / “도 다음이 행성이에요?”).
- **행성 교류전**: 정복전이 아닌 교류전, 같은 규칙. 모서리 셋(“그건 삼각형인데?” / “우리 행성에서는 딱지가 먼저 생겼다.”)과 접기 교환, 반짝의 빠른 게이지, 결승 무중과 “다시 한 장만.”
- **엔딩** (`ending.js`): 행성 우승 직후 학교 운동장 벤치 → 아이들의 질문 → 도윤 “이제 너랑 끝내지 못한 승부, 한 판 더?” → 운동장 경기(이겨도 져도 이야기가 끝난다) → 카메라가 하늘로, 딱 소리, 페이드 → 출연진 스크롤 크레딧(건너뛰기, 동작 줄이기 설정이면 정지 화면) → 크레딧 후 ‘???? 대회’ 초대장과 박태풍 “이번엔 내가 나간다.” 엔딩 플래그(`story.ending`)는 경기 직후 저장되어 저절로 반복되지 않는다. 엔딩 중 재접속하면 벤치 장면부터 다시 시작한다. 이후 **자유 경기**: 정류장에서 모든 대회 반복, 운동장의 도윤과 보상 없는 친선전(바로 다시 하기). ‘이야기 다시 보기’에서 엔딩·크레딧을 경기 없이 다시 볼 수 있다.
- **집과 마을의 변화**: 우승할 때마다 집 선반에 트로피가 하나씩(마을~행성 7개, 세계는 큰 컵, 행성은 별 장식) 놓이고 조사할 수 있다. 표창장 액자, 프롤로그 이후의 신문 조각은 그대로. 주민센터 앞 현수막은 대회 중 “{이름} 선수, ○○ 힘내라!”, 우승 뒤 “축! {이름}, ○○ 우승!”으로 바뀌고 우승 수만큼 깃발 줄과 관중이 늘어난다. 장식은 능력치에 영향이 없다.
- **이야기 다시 보기**: 도 대회~엔딩의 새 장면 37개가 `story-data.js`의 다시 보기 순서에 들어 있다. `{name}`이 대사에 반영된다.
- **밸런스 시뮬레이션** (`node tests/balance-sim.cjs`, `tests/balance.test.js`): 단계마다 상한의 약 3/4까지 압축·훈련한 대표 빌드(도·전국: 머리카락 +9/+12, 대륙~행성: 융합 +15/+18/+21), 평균적인 타이밍(게이지 중앙에서 표준편차 0.09)으로 경기당 3000~4000판. 결승 승률 62~66%, 1회전·준결승 68~82%. 압축·훈련 없이(+0, Lv.1) 도 결승에 가면 약 22%, 행성 결승을 상한까지 키우면 약 85%. 이 전투 공식에서는 경기가 2~3턴이면 끝나고 뒤집기 확률이 결과를 크게 좌우하므로, 타이밍 실력보다 빌드 차이가 승률을 더 많이 바꾼다.
- 데이터·저장: 상대 필드 `steady`, `hidden`, `heals`/`healAt`, `gaugeScale` 추가. 상대 행동은 `P.foeIntent`/`P.plan`(게임과 시뮬레이션이 같이 쓰는 순수 함수). `P.titles`, `P.takeOfficial`, `P.finishEnding`, `P.fusionOpen`. 저장에 `story.official`, `story.ending`, `map.tournament`(모든 대회), 새 구역 `continent`/`world`/`planet`이 추가됐다. 트로피 딱지 출처를 새 상대에 맞게 바꿨고(예: 철 → 최단단, 다이아 → 한결), 더는 상대가 쓰지 않는 고무·나무·피쉬앤칩스·로봇·우라늄(모조품) 딱지는 해당 단계 가게에서 판다. 상자·테이프·피아노·식빵·레고 딱지는 가게에서 사거나 이겨서 얻는다.
- 테스트: `tests/stages.test.js`, `tests/balance.test.js`, `tests/ending.browser.cjs`(준비된 세계 챔피언 프로필로 행성 결승 → 엔딩 → 크레딧 → 자유 경기 → 다시 보기). `tests/province|national|frontier.browser.cjs`는 공통 흐름 기준으로 다시 썼다.
