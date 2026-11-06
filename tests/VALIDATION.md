# School chapter v0.2 verification

> 현재 검증 대상은 PC 웹(키보드·마우스), 권장 1280×720 이상 / 최소 검증 창 1024×600입니다. 아래 모바일 기록은 과거 버전의 이력이며 현재 지원을 의미하지 않습니다.

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

## 최소 플레이 버전 v0.11

기준 문서: `docs/game-planning/07-minimum-playable-version.md`.
타이틀의 기본 **처음부터 시작 / 이어서 하기**가 이 버전을 연다.
전체 캠페인(‘처음부터 시작’)과 짧은 체험판은 별도 버튼과 별도 저장 키를 쓴다.

- `npm run check`: 기존 스크립트와 새 `minimum-rules.js`, `minimum.js` 문법 검사 통과.
- `npm test`: 기존 규칙·성장·탐험·이미지 검사를 포함한 단위 테스트 52개 통과.
- `npm run test:minimum`: 새 규칙 테스트 4개와 브라우저 스위트 2개 통과.
- 기존 브라우저 스위트 14개와 새 스위트 2개가 각각 통과했다. 학교·마을·시·도·전국,
  대륙·세계·행성, 이야기 활동 42개·대회 경기 21개, 인벤토리·공방·탐험,
  이미지 184개 로딩·배틀 상태 138개와 기존 음향 검증을 포함한다.
- `minimum.browser.cjs`: 새 게임부터 주요 경로를 실제 키보드 이동으로 걸어서
  첫 경기 → 귀가 → 제작 → 연습 → 재대결 → 포스터 → 주민센터 접수까지 완료.
  위치를 바꾸는 내부 함수를 써서 필수 경로를 건너뛰지 않는다.
- 첫 경기 전 이야기상 패배 안내, 실제 첫 공격과 뒤집기, 빗나감 연습 완료·반복,
  재대결의 실제 패배·즉시 재도전·승리, 게이지 일시정지를 확인했다.
- 패배·제작·연습·승리·포스터·접수 후 새로고침과 이어하기, 반복 제작·포스터·접수,
  접수 취소 후 재신청, 3행 임시 대진표와 버전 완료 안내를 확인했다.
- 모바일 Chromium 에뮬레이션 390×844 / 844×390: 실제 터치 누름·취소에 의한 이동,
  상호작용, 공격·게이지 정지, 메뉴·소리 설정·인벤토리, 패배 후 집 연습, 접수,
  주요 패널의 화면 경계를 확인했다. 모바일 전투·접수는 준비된 진행 상태를 사용한다.
- 320×568 추가 점검: 두 종류의 저장이 모두 있을 때 타이틀을 스크롤해 네 버튼에
  접근할 수 있다. `/ddakzizon/` 하위 경로에서 상대 URL 스크립트·딱지 PNG와 터치 연습이 동작했다.
- `minimum-edges.browser.cjs`: 손상된 JSON 저장을 무시하고 새로 시작하는 경우,
  Storage API 접근이 차단됐다가 복구되는 경우, 이른 접수 진입 차단을 확인했다.
  연습 타격 전·후 체크포인트, 공격·상대 턴 도중 타이틀 복귀 후 콜백 취소,
  기존 캠페인 저장 보존과 최소 버전 새 게임 초기화도 확인했다.
- 새 브라우저 검증 흐름에서 처리되지 않은 JavaScript 오류가 없었다.

새 게임 수치와 상태 전이는 `minimum-rules.js`로 분리되어 있다. HP 100, 공격 20,
방어 8, 안정성 10, 힘 4, 4개 판정과 피해·뒤집기 식은 문서의 **임시값**을 따른다.
상대는 좋음 고정이며 게이지 왕복은 1.8초로 표시한다. 연습은 1회면 완료되며,
상점·강화·압축·제련·융합·훈련·접수 이후 경기는 이 버전에서 진행하지 않는다.

재현하려면 `npm ci`, 별도 터미널의 `npm start`, `npm run check`, `npm test`,
`npm run test:minimum`을 사용한다. 전체 회귀 검사는 `npm run test:browser`다.
브라우저 실행은 `BROWSER_EXECUTABLE` 또는 설치된 `/usr/bin/chromium`을 사용하고,
둘 다 없으면 Playwright의 설치된 Chromium을 사용한다. 기존 frontier/sprites
검증의 브라우저 선택도 같은 방식으로 맞췄다.

자동화는 게이지 위치와 난수를 통제하고 일부 장면 시간을 가속한다. 실제 완주 시간,
실기기 Safari/Firefox, 확정 게임 밸런스, 외부 배포·게시를 검증했다는 뜻은 아니다.
새 이미지와 최종 인물 아트 대신 기존 딱지 PNG와 도형 배경·인물을 재사용한다.
화면 산출물: `/tmp/ddakzizon-checks/minimum-{registration-desktop,mobile-registration,mobile-inventory,mobile-landscape}.png`.

### 실제 속도 플레이 후 보완

Chromium 1366×768에서 난수, HP, 게이지 판정, 게임 시계를 변경하지 않고 키보드 이동과
실제 타이밍 입력으로 새 게임부터 대회 접수·새로고침 후 복귀까지 플레이했다.
재대결에서는 실제 확률 뒤집기로 한 번 패배한 뒤 재도전해 승리했다.
추가로 390×844와 320×568 화면, 메뉴를 연 상태의 가로 회전을 확인했다.

- 첫 패배 후 딱지를 가져가는 애니메이션에 시작 시각이 없어 좌표가 NaN이 되고,
  딱지가 화면 왼쪽 위에 그려지던 오류를 수정했다. 새 회귀 검증은 첫 패배의
  시작 시각과 Canvas 이동 좌표가 유한한지 확인한다.
- 민수가 말할 때 주인공 초상화를 사용하던 매핑을 수정했다.
- 좁은 세로 화면에서 탐험 시야를 960에서 560 월드 단위로 줄여 인물·주변 안내를
  확대했다. 이동 속도와 실제 맵 좌표는 유지한다. 양쪽 맵 끝, 회전 전후의
  카메라·캐릭터 위치를 검증하고 전투·기존 캠페인은 전체 시야를 유지한다.
- 모바일 장착 표시를 한 줄로 정리하고, 장소 안내 토스트가 상단 버튼과 겹치지
  않게 옮겼다. 수정 전후 화면을 직접 비교했다.
- 실제 플레이에서 내구도가 남은 채 뒤집히는 승패가 헷갈리지 않도록 첫 경기 안내,
  뒤집기 순간 문구, 결과 설명을 보완했다. 양쪽의 확률 뒤집기를 공격 UI로 재현해
  HP가 남은 상태와 안내 문구를 함께 확인한다.

수정본으로 같은 전체 경로를 다시 완주했고 처리되지 않은 JavaScript 오류가 없었다.
화면 산출물은 `/tmp/ddakzizon-live-play-fixed/`에 남겼다. 이 확인은 실제 기기에서의
수동 플레이나 다른 브라우저 엔진에 대한 검증을 대신하지 않는다.

### 종이·녹색 UI 정리

- 타이틀, 공통 버튼, 대화, 전투 HP/게이지, 결과, 시설, 인벤토리와 메뉴를 종이색·녹색 팔레트와 얇은 테두리로 통일했다. 강조 버튼과 보조 버튼의 위계를 구분하고 과한 입체 그림자·글자 외곽선·기울임을 제거했다.
- 도구 버튼은 일관된 SVG 아이콘을 쓰며, 소리 버튼의 토글 상태와 접근성 이름을 유지한다. 대진표는 클릭 버튼처럼 보이지 않는 목록으로 정리했다.
- 장소 토스트는 대화·시설·결과·전투의 제목을 덮지 않도록 종류를 구분한다. 저장 실패 등 일반 알림은 유지한다.
- 1366×768, 390×844, 320×568, 844×390에서 타이틀·대화·탐험·전투·게이지·인벤토리·지도·접수 화면 32개를 캡처해 검토했다. 가로 화면의 메뉴 폭은 브라우저 전체가 아닌 실제 게임 영역을 기준으로 제한한다.
- 단위 테스트 52개, 최소 버전 브라우저 2개와 기존 메뉴·공방·학교·음향 브라우저 4개가 통과했다. 4개 화면 크기에서 도구 버튼, 전투 조작, 메뉴 경계와 장소 안내 겹침을 추가 확인했다. 문법 검사와 `git diff --check`도 통과했다.
- 화면 산출물: `/tmp/ddakzizon-ui-redesign/`. 이번 확인은 Chromium에서 수행했다.

## 현재 기준: PC 전용 UI

- 지원 대상은 PC 웹의 키보드·마우스다. 모바일 관련 기록은 과거 이력으로만 남기며 터치 버튼, 터치 이벤트, 모바일 카메라 확대와 가로폭 기반 모바일 레이아웃을 제거했다.
- 기준을 `AGENTS.md`, README, 상세 기획·마을·탐험·최소 버전 문서에 명시하고 타이틀 하단에도 PC 전용 입력 방식을 표시했다.
- PC 화면에 맞춰 어두운 HUD·대화·전투·메뉴 탐색 영역과 종이색 정보창을 구성했다. 주 행동에 금색을 쓰고 타이틀 설명, 단축키, 버튼 위계를 재정리했다. 라운드 표시는 경기장 간판과 겹치지 않는 상단 공간을 사용한다.
- 1440×900, 1280×720, 1024×600에서 타이틀·대화·탐험·전투·인벤토리·접수 화면 18개를 검토했다. 원본 화면은 `/tmp/ddakzizon-pc-ui/`에 남겼다.
- `npm run check`, 단위 테스트 52개, 최소 버전 2개 및 기존 메뉴·학교·공방 브라우저 3개 스위트가 통과했다. 전체 여정의 저장·재도전 검증을 유지하면서 모바일 검증 부분을 PC 창 크기·키보드·설정·일시정지 검사로 교체했다. 모바일 검사를 단순히 건너뛰는 설정은 추가하지 않았다.

## 캐릭터 색감과 명도 조정

- 캐릭터 12종의 피부·머리·의상·신발·장식을 중간 톤으로 조정했다. 순백색은 따뜻한 회백색으로, 원색 의상은 저채도 소재색으로 바꾸고 캐릭터별 대표색은 유지했다.
- 캐릭터 외곽선·눈 반사·볼 색을 완화하고 얼굴과 옷의 작은 음영을 추가했다. 대화 초상화, 선수 아이콘과 대회 관중도 같은 팔레트로 맞췄다.
- 배경·딱지 PNG·전투 수치·좌표·이동 속도는 변경하지 않았다.
- 타이틀, 운동장·골목·로비, 캐릭터 12종 전투 장면, 대화 초상화를 동일한 PC 화면과 시각으로 고정해 수정 전후 17개 화면씩 비교했다. 렌더링 중 JavaScript 오류는 없었다.
- 문법 검사, 단위 테스트 52개, 최소 버전 브라우저 2개와 기존 학교 브라우저 검증이 통과했다.
- 화면 산출물: `/tmp/ddakzizon-characters-before/`, `/tmp/ddakzizon-characters-after/`.

### 캐릭터 회색기 보정

- 이전 명도 조정이 탁하게 보인다는 피드백을 반영해 피부의 따뜻함과 의상의 빨강·파랑·초록·보라를 회복했다. 순백색 강조는 회백색으로 유지하고 얼굴·옷의 음영은 더 옅게 조정했다.
- 녹갈색 윤곽선을 중립적인 짙은 청회색으로 바꿔 색을 흐리지 않고 형태를 구분한다. 초상화·선수 아이콘·관중에도 동일하게 적용했다.
- 캐릭터 12종과 타이틀·탐험 3곳·초상화의 17개 PC 화면을 이전 버전과 비교했다. JavaScript 오류가 없었고 문법 검사·단위 테스트 52개·학교 브라우저 검증이 통과했다.
- 화면 산출물: `/tmp/ddakzizon-characters-clear/`.

## 256×256 손그림 적용

- ImageGen 원화로 배경 7개, 캐릭터 18개 파일(12종), 소품 17개를 제작했다. 최종 PNG 42개는 모두 정확히 256×256이며 캐릭터·소품 가장자리는 투명하다. 제작용 시트는 게임에 포함하지 않는다.
- 주요 탐험 7구역, 타이틀, 학교/연습/주민센터 경기, 접기/압축 화면과 대화/선수 초상화에 적용했다. 시·도·전국은 로비 배경을 공유하며 대륙 이후는 기존 배경을 유지한다. 기존 딱지 PNG 184개와 전투/저장 규칙은 유지했다.
- Chromium에서 42개 이미지 디코드, 알파 여백, 공통 발 기준점, 공격 자세의 크기 유지, 실제 키보드 걷기 2프레임과 좌우 반전, 7개 맵의 실제 이미지 사용, 대화 초상화와 배경 로드 실패 시 기존 렌더러 동작을 검증했다.
- `npm run check`, 단위 테스트 52개, `npm run test:art`, `npm run test:minimum`, 기존 학교·메뉴·탐험·딱지 이미지 브라우저 스위트 4개가 통과했다. 최소 버전 검증에는 1440/1280/1024 PC 창 크기, 첫 패배→귀가→접기→연습→재대결→포스터→접수, 저장/재시도와 예외 흐름이 포함된다.
- 화면 산출물: `/tmp/ddakzizon-checks/art-*.png`. 그림 비율을 유지해 확대하므로 256픽셀 배경은 큰 PC 화면에서 부드럽게 보인다. 다른 브라우저 엔진의 별도 검증은 수행하지 않았다.

## 교실 오프닝과 정자로 따라가기

- 새 짧은 여정은 수업 종료 → 민수의 장소 질문 → 도윤의 정자 약속 → 주인공의 호기심 → “관심이 생겨서 따라간다” 선택으로 시작한다. 건너뛰기는 선택 대기까지만 진행한다. 정자 도착 후 첫 경기/귀가/접기/연습/재대결/대회 접수로 이어진다.
- 교실·정자 배경은 각각 256×256 PNG다. 교실의 세 캐릭터는 같은 바닥선에 배치했으며, 선택창이 가리지 않도록 작은 PC 창에서 높이를 조정했다.
- `opening.browser.cjs`: 대화 순서와 화자 초상화, 실제 Space/마우스 조작, 선택 대기 중 이동 차단, 일시정지 중 클릭 차단 및 포커스 복귀, 대화/선택 전후 새로고침, 선택 후 첫 경기, 새 게임 재시작, 1440×900/1280×720/1024×600 선택창 경계를 검증했다.
- 저장 버전은 유지한다. 새 `opening` 필드가 없는 기존 저장 및 첫 경기 이후 저장은 완료 상태로 복원한다. 선택 직후 전환 중 종료해도 정자 도착 지점으로 복구되도록 목적지부터 저장한다.
- 문법 검사와 단위 테스트 53개, `npm run test:minimum`(오프닝/전체 짧은 여정/예외 흐름), `npm run test:art`(44개 PNG), 기존 학교·메뉴 브라우저 검증이 통과했다.
- Chromium 화면 산출물: `/tmp/ddakzizon-opening/`. 다른 브라우저 엔진 검증은 수행하지 않았다.
