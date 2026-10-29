# School chapter v0.2 verification

Verified in headless Chromium with Playwright 1.62.1 against a local HTTP server:

- New-game title → chapter card → keyboard movement → nearby NPC interaction.
- Typewriter completion and dialogue advancement.
- Player timing changes damage, impact animation and feedback.
- Pause freezes the simulation clock and timing gauge; resume accepts Space.
- Intro attack → enemy counter → forced defeat → theft → narration → home.
- Four ordered folds and three practice attempts, including imperfect attempts.
- Reload at the saved checkpoint and resume at school for a rematch.
- Focus can only be used once and slows the next gauge to a 2400 ms cycle.
- Fair rematch victory and defeat through normal UI actions (timing/RNG controlled
  in the test for deterministic outcome coverage).
- Returning to title during an enemy turn cancels pending attack callbacks.
- Mobile 390×844: touch direction pad/destination, dialogue, attack, pause.
- Landscape 844×390: menu bounds and playable battle controls.
- No uncaught JavaScript errors during the verified flows.
- Shared combat rules: 4 Node tests passed. JavaScript syntax checks passed.

The managed browser rejects `file://` navigation with
`ERR_BLOCKED_BY_ADMINISTRATOR`. Direct-file launch was therefore not runtime
verified here. The game uses only relative classic scripts and styles; there are
no runtime network dependencies. Use `npm start` for the verified serving path.

## PC tutorial revision

Verified on desktop Chromium at 1440×900:

- Rival speech introduces arrow keys / WASD, then E when the player approaches.
- First battle teaches lifting the ttakji in rival dialogue.
- First attack explains Space and the center timing zone before the gauge starts.
- Full keyboard flow reaches defeat, folding with keys 1–4, practice, and rematch.
- Rematch dialogue introduces F; F slows the next gauge to 2400 ms.
- Escape pauses the gauge and resumes keyboard play correctly.
- Permanent instruction text, battle narration, and mobile direction pad are absent.

The earlier mobile checks above describe the previous revision. This revision is
intended for PC keyboard/mouse play; mobile-specific controls have been removed.

## Newspaper sprite integration

Verified all four existing 256×256 RGBA files retain their transparent alpha.
In Chromium, all four PNGs loaded successfully and were observed in canvas draw
calls. A normal rematch was exercised through a surviving enemy hit (damaged
front) and a lethal enemy hit (reverse face after the flip midpoint). Verified the
completed folding scene draws the inventory sprite and the HUD icon appears only
while a folded newspaper ttakji is owned. No JavaScript errors were observed.

Artwork is drawn at its original aspect ratio in resting poses. Temporary vertical
compression is used only for the flip animation, with the reverse image drawn
without mirroring. No HP, damage, or victory rules changed.

## Colored-paper sprite integration

Created four matching red/orange colored-paper sprites: base front, actual reverse,
48px-readable inventory icon, and torn/crumpled front. All files are 256×256 RGBA
PNGs with transparent margins and centered artwork spanning at most 204px.
Visually reviewed the normalized set and desktop battle screenshots.

Verified in Chromium at 1440×900:

- All four colored-paper assets load successfully; the base appears on the title
  screen and in battle through the shared renderer used by the playground.
- A nonlethal player attack selects the damaged front using the same existing
  damage-state rule as the newspaper ttakji.
- A lethal attack shows the reverse after the flip midpoint, retaining the
  original aspect ratio when the flip completes.
- Victory displays the colored-paper inventory icon; resetting to the opening
  school scene clears that icon.
- Existing newspaper battle states, completed folding sprite, and inventory
  visibility still pass their browser checks after sharing the sprite loader.
- No uncaught JavaScript errors; syntax checks and all four rules tests pass.

Only artwork and its rendering were changed; combat balance and controls remain
unchanged.

## Village campaign v0.3

Verified in desktop Chromium (1440×900 and 1280×720):

- Existing school keyboard tutorial still reaches folding, practice and rematch;
  pause and one-use focus retain their original behavior.
- Legacy v2 completion saves lead through the boss's departure, advertisement,
  and village introduction, granting the initial equipment and money once.
- Keyboard movement and E open all four facilities, including repeat visits.
  Equipment changes, compression costs/stat previews, insufficient funds, and
  completed training rewards behave correctly.
- All three tournament opponents can be defeated through attack UI actions;
  earlier rounds stay completed, rewards total 200 coins, and the final unlocks
  the hair-fiber ttakji and defensive skill.
- A tournament defeat retains money and completed rounds. Returning to title
  during an attack cancels the scheduled events. Reward-checkpoint reload resumes
  the final dialogue without duplicating the reward.
- Equipment, currency and unlocks survive reload. R halves the next incoming
  attack, is consumed only once per match, and cannot be reused. F includes the
  equipped item's concentration bonus. Sparring awards no tournament money.
- All hair-fiber PNGs return HTTP 200. Base, damaged, and reverse sprites appear
  in canvas draw calls; the inventory icon appears in equipment and the HUD.
- Visually reviewed the village, compression panel, equipment reward screen,
  battle, and the four normalized 256×256 RGBA hair sprites, including 48px icons.
- Eleven combat/progression unit tests and all five game-script syntax checks pass.

Reproducible campaign checks are in `campaign.browser.cjs` and
`campaign-edges.browser.cjs`; see README for `npm run test:browser`. These tests
control timing/RNG, accelerate simulation in selected flows, and seed checkpoints
for edge cases. The legacy school keyboard walkthrough was also exercised from
new game through rematch. No uncaught JavaScript errors were observed.

## Inventory and game menu

Verified at 1440×900 and 1024×600 in desktop Chromium:

- I opens the inventory and toggles back to the same scene. Esc opens the menu,
  navigates back from submenus, and resumes from the overview.
- All three owned items show real sprites, upgrades, equipped state, and stat
  comparisons; equipment changes persist after reload and update the HUD.
- Changing equipment over the compression facility refreshes its preview.
- Opening during the timing gauge freezes both the simulation and gauge; equipment
  changes are disabled in combat and the same gauge resumes on close.
- The stolen/unfinished tutorial ttakji does not appear as a folded owned item.
- Modal input stays in the menu, background controls are inert, Tab/Shift+Tab wrap,
  arrow selection works, and returning to title releases focus restrictions.
- Sound preferences toggle while audio remains paused; fullscreen toggles work.
- Player skills, controls, and the overview render; desktop menu bounds fit.

The campaign's victory, defeat, reward reload and cancellation browser checks also
pass with the new menu. `npm run test:browser` includes the new menu browser check.

## City championship v0.4

Verified in desktop Chromium at 1440×900 and 1280×720:

- Legacy village champion saves unlock the city without losing equipment or money;
  earlier school/village progress cannot enter it. The city intro resumes on reload.
- Keyboard travel reaches city training, compression, tournament and return bus.
  Training returns to the city. Travel to the village and back preserves both
  brackets. City inventory changes retain the city save destination.
- Three fair city matches reach championship through combat UI actions. The folding
  master's odd-turn defense is bypassed by PERFECT; announced strong attacks and
  defense patterns repeat as documented.
- First-victory reload resumes skill instruction, final-victory reload resumes the
  boss's story. Total city rewards are 520 coins, with no duplicate payments.
- C is locked before first victory and usable once per later match. GOOD/PERFECT
  receive its bonus; BAD receives its penalty before defense. Repeated key presses
  cannot stack it. F and C can be combined; skills reset on a fresh encounter.
- City defeat retains prior wins, money, and the unlocked skill. Retrying works;
  returning to title cancels pending attacks. Reload resumes the same city round.
- The menu shows city progression, the new skill, and province qualification.
  Combat inventory remains read-only. A new game resets city progress and skills.
- Compression +8 and training 30 caps, save compatibility, reward idempotency,
  opponent patterns and wager math are covered by progression tests.
- Existing village championship, reward/cancellation, inventory and menu browser
  suites still pass. Seventeen unit tests and seven game-script syntax checks pass.

City browser tests: `city.browser.cjs` and `city-edges.browser.cjs`. Timings and RNG
are controlled, and selected simulation flows accelerated for deterministic
coverage. No uncaught JavaScript errors were observed.

## School loss → home upgrade → rematch v0.5

Verified in desktop Chromium from a fresh game:

- Rival dialogue teaches attack and timing before the first hit; a hit changes HP,
  and the rival responds before the scripted defeat and theft.
- Keyboard folding leads into the new home workbench. Inventory is empty while
  the replacement has not been folded, then contains the new newspaper ttakji.
- The 40-coin allowance is issued once. Before purchase the panel shows attack
  20→23 and durability 110→120. Native Space activates the purchase; it spends 40,
  produces +1, and unlocks practice only after the pressing animation.
- Esc pauses the pressing clock. Reload before purchase cannot duplicate the
  allowance; reload after purchase retains +1 and does not charge again.
- Father dialogue introduces F. Upgraded practice GOOD hits deal 28; completing
  three hits grants player growth once, reaching attack 25 and concentration 1.
- Rematch has 120 player HP versus 100 rival HP. Focus lasts 2480ms. Four GOOD
  attacks deal 30 each and win under ordinary HP rules; the deterministic GOOD
  enemy fixture leaves the player with 48 HP.
- A failed rematch offers home practice, preserving the upgrade and avoiding
  repeat XP/currency rewards. Legacy practice/rematch saves enter the lesson;
  completed campaign saves continue without receiving tutorial funds.

The complete fresh-game flow, all existing campaign/menu browser suites, twenty
unit tests, and eight game-script syntax checks passed. Browser combat timing and
RNG were controlled for reproducibility; most scene timers were accelerated.

## City refinery v0.6

Verified in desktop Chromium at 1440×900 and 1024×600:

- A legacy city save without refining fields opens normally. First visit to the
  refinery teaches tradeoffs, per-item cost and free switching through the owner.
  Finishing the dialogue saves that visit without spending money.
- Arrow keys/Enter select the attack form and preview attack 20→28 / HP 110→90;
  native Space on the purchase button spends exactly 90 coins. Repeated activation
  cannot charge again. Reload preserves the purchase and unlocked forms.
- Both paid forms belong to their individual items. Switching to original or any
  previously processed form is free; insufficient funds disable an unowned form.
- I changes equipment under the paused workshop and refreshes its preview. Buying
  is blocked while paused. The inventory displays the active form and actual stats.
- A processed hair ttakji starts combat at 105 HP and 36 attack. A GOOD hit with
  wager against the folding master's defense deals 32 damage; his guarded GOOD
  counter leaves 88 HP. Equipment changes and processing are unavailable in battle.
- City/village travel keeps processed stats. Reload retains independent newspaper
  and hair forms and the correct wallet. Starting a new game clears the unlocks.
- Desktop panels fit within the viewport, with internal scrolling at short heights.
  Preview screenshots were visually inspected. No uncaught JavaScript errors.

`forge.browser.cjs` seeds a city checkpoint, drives actual keyboard/mouse UI, and
controls timing/RNG for its battle. Twenty-three unit tests and syntax checks for
nine game scripts pass, including save normalization, costs and combined growth.

All six existing school/campaign/menu/city browser suites also passed after this
change, including championship wins, loss/retry, reward reload and cancellation.

## Province championship v0.7

Verified in desktop Chromium at 1440×900:

- A legacy city-champion save unlocks province travel. The intro checkpoint reloads
  its story. Earlier city profiles cannot enter even with invalid province fields.
- Keyboard travel reaches the return bus, training, workshop and bracket. Expanded
  +12 / 45 growth caps persist. Refining and inventory changes save to the province;
  training returns to that hub. Previous-region visits retain all bracket records.
- Three real tournament matches reach province championship. The wall halves GOOD
  but allows PERFECT to pierce; the offbeat opponent alternates announced PERFECT
  and BAD; the champion cycles defense/PERFECT/BAD. F/R/C remain one-use skills.
- The controlled 55-attack build deals 33 with GOOD into defense and 165 with a
  piercing PERFECT wager. The offbeat weak counter deals 18; guarding the champion
  PERFECT reduces 80 damage to 40. A deliberately weak build loses normally.
- Province awards total 940 coins once. Final-checkpoint reload resumes the award
  story without paying twice. The menu shows national qualification. Post-final
  sparring is available; national matches remain future content.
- Defeat/retry keeps prior wins and money. Returning to title during a hit clears
  pending events; reload resumes the province. Fresh game clears province progress.
- Reviewed the hub and final-battle screenshots; all new characters and scenery use
  geometric placeholders with the existing material sprites. No JavaScript errors.

`province.browser.cjs` controls timing/RNG and accelerates scene timers. Twenty-six
unit tests passed, including entry gates, one-time prizes, save migration, expanded
caps and opponent patterns. Syntax checks passed for all ten game scripts.

All seven existing school, village, inventory/menu, city and refinery browser
suites also passed with the province changes (eight browser suites in total).

## National championship v0.8

Verified in desktop Chromium at 1440×900:

- A legacy province-champion save unlocks national travel. The entry story resumes
  after reload; an unfinished province save cannot enter the national bracket.
- Keyboard travel reaches training, compression/refining, the bracket and return
  bus. National caps are +16 and 60 training points. Inventory changes and refining
  preserve the national checkpoint, and completed training returns to its hub.
- All three tournament opponents can be defeated through the actual battle UI.
  With 66 attack, GOOD into defense deals 40. PERFECT with wager into an opening
  deals 297 after combining the two 1.5× factors. Guard reduces the charger's strong
  counter from 84 to 42 and the champion's from 96 to 48. NPC speech announces both
  the opening bonus and the expected counter, including overlapping strong turns.
- National prizes total 1,550 coins once. The final reward checkpoint reloads its
  family scene without paying twice. The menu records the championship and
  continental qualification. Reward-free post-final sparring remains available.
- Deliberately weak equipment loses normally. Defeat/retry, mid-hit cancellation,
  reload and return travel preserve earlier wins and wallet contents. New game
  clears national progress, and malformed premature entry fields are normalized.
- Hub and opening-turn screenshots were visually reviewed. Existing material
  sprites and rectangular character/scenery placeholders are retained. No uncaught
  JavaScript errors were observed during the national walkthrough.

`national.browser.cjs` seeds a province champion and controls timing/RNG while
accelerating animations. Twenty-nine unit tests and eleven script syntax checks
passed, covering gate/reward persistence, caps and the new multiplier composition.

All eight existing school, village, menu, city, refinery and province browser
suites also passed after the national changes (nine browser suites in total).

## Story/playtime expansion v0.9

Verified in desktop Chromium at 1440×900 and 1024×600:

- Twelve authored chapters add 24 activities: 17 duels, seven five-hit accuracy
  drills, and 132 dialogue lines. Each unfinished main tournament match is gated
  by its corresponding two activities and closing dialogue.
- The new campaign walkthrough begins with the normal post-school allowance,
  +1 newspaper and training reward. It completes all 24 activities and all twelve
  tournament matches using earned money and upgrades; player stats/HP and prizes
  are not overridden. Timing/RNG are controlled and animation timers accelerated.
- Five BAD hits fail without rewards. A mixed set meeting the stated accuracy
  threshold succeeds. Winning a skill challenge without the requested skill also
  fails without paying. Retry and return-to-preparation work in both cases.
- Completing an activity saves its stage, reward and pending dialogue together.
  Reloading the result resumes the ending, retains money, and opens the following
  activity without replaying the completed encounter or issuing duplicate rewards.
- J toggles the paused journal. Encounter pause freezes the timing clock. Future
  chapters stay unavailable; complete chapters can be reread without payment.
  The journal and chapter panel were visually inspected, including the short PC
  viewport. All activities and tournament results remain complete after reload.
- An additional legacy national-champion walkthrough opens a newly added chapter
  while preserving the completed bracket, coins and XP. No migration rewards are
  granted; old champions can play all unlocked new stories. Fresh game clears them.
- All nine prior browser suites pass with explicit story-prepared fixtures for
  combat-only checks. The new story suite exercises the gates and the whole longer
  campaign. No uncaught JavaScript errors were observed. Thirty-four unit tests
  cover data integrity, ordered completion, pending saves, migration and objectives.

The tests establish playable content and persistence, not a measured human
completion-time estimate. Reading speed, accuracy and retry frequency vary.

## v0.10 탐험 맵

- 단위 테스트: 옛 챔피언 저장의 포스터/진행 보존, 새 위치·재료·안내 설정 저장, 잘못된 좌표/지역/재료 정규화.
- `tests/exploration.browser.cjs`: 새 게임 첫 패배 → 운동장 출구 → 학교 앞 → 주민센터 → 광장 → 골목 → 집 → 접기/강화/연습 → 학교 재대결 → 포스터 → 접수원. 카메라 추적, 수평 이동, M 지도/일시정지, 상점 확인/취소, 보강, 무료/유료 연습 보상, 재접속 좌표, 구역 10개 렌더링, 정류장 복귀, 1024×600 메뉴 경계를 검증한다.
- 기존 전투 회귀 테스트는 시설 진입 헬퍼를 직접 메뉴 호출로 바꿨다. 구형 한 화면의 건물 x 좌표를 향해 걷던 검증은 새 탐험 브라우저 테스트가 대체한다. 전투/재화/장비/재접속 단언은 유지한다.
- 화면 산출물: `/tmp/ddakzizon-checks/map-{home,alley,square,center,lobby,schoolfront,yard,city,province,national}.png`, `map-menu.png`.
