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

## Play — school chapter

Open `index.html` in a modern browser, or run `npm start` and visit
`http://localhost:4173`. No install, build, external fonts, or network connection
is required to play. The game uses Canvas 2D, CSS, and synthesized Web Audio;
characters, scenery and ttakji are intentionally simple rectangular placeholders.
The original newspaper PNG assets are preserved in `assets/`.

### Controls

- Move: arrow keys / WASD, click a destination, or use the mobile direction pad.
- Talk near the rival: E, Space, or the interaction button.
- Dialogue: Space / Enter / Continue. First press reveals an unfinished line.
- Attack: select 내려치기, then stop the gauge with Space, click, or touch.
- Fold: select the highlighted corner or its corresponding button.
- Pause: Escape or Ⅱ. The game clock, gauge, and events freeze together.
- Sound and fullscreen controls are in the upper-right corner.

### Chapter flow

Title → explore school → challenge the rival → interactive first attack → fixed
intro defeat → theft and closing narration → folding → three practice hits →
return to school → a fair rematch → victory and a colored-paper ttakji reward.
Rematches can be replayed after either outcome. Practice unlocks 집중: once per
rematch it slows the next timing gauge, without changing damage.

Only `intro_battle` forces defeat. BAD / GOOD / PERFECT deal 10 / 24 / 40 damage.
In rematches both sides start at 100 HP and use the same damage rule; enemy timing
is randomly sampled. Timing changes the first attack's damage and animation even
in the intro. The implementation contains the complete school chapter; subsequent
chapters are not included.

### Save and pause

Scene checkpoints save automatically to browser localStorage. 이어서 하기 resumes
at school, home, practice, or the school rematch. Combat is resumed from the start
of the encounter, not mid-turn. Starting a new game replaces the current save.
Saves are scoped to this browser and URL; local-file storage depends on the browser.
If storage is unavailable, the game remains playable and reports that limitation.
Changing tabs pauses active gameplay. Returning to the title clears scheduled
attacks and transitions. Sound preferences are also saved locally.

### Source and verification

- `game.js`: chapter state, input, simulation clock, save, combat and audio.
- `world.js`: canvas scenes, movement rendering, fold / hit / flip effects.
- `rules.js`: shared timing and damage rules.
- `style.css`: integrated game HUD and responsive controls.

Run `npm test` for rules and `npm run check` for JavaScript syntax.
Browser verification covers the full chapter, movement, paused timing, folding,
practice, checkpoint reload, one-use focus, both rematch outcomes, title navigation
during a pending enemy attack, and mobile controls. Screenshot artifacts and the
playable ZIP are delivered separately.
