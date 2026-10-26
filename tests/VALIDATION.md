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
