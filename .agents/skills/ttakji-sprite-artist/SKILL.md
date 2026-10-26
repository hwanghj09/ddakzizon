---
name: ttakji-sprite-artist
description: Create, edit, or plan consistent 256x256 transparent PNG sprites for Korean ttakji (ddakji) used in the 2D web game "딱, 지존". Use when making newspaper, colored-paper, cardboard, metal, AI, or other themed ttakji, especially their four gameplay states (base, flipped, inventory, damaged), or when preparing generation prompts, validating sprites, and importing them into the game. Not for character, background, or general UI artwork.
---

# Ttakji Sprite Artist — 딱, 지존

Create production-ready **Korean folded ttakji** assets for the 2D web game. Use a consistent visual identity across every material and state. Treat this as an asset-production workflow, not a request to draw four unrelated illustrations.

## 1. Defaults and deliverables

Unless the user or existing project art overrides a setting:

| Setting | Default |
| --- | --- |
| Resolution | Exactly **256 × 256 px** per file |
| Format | Transparent **RGBA PNG** |
| Asset count | **Four separate sprites per ttakji type** |
| Art direction | Readable, lightly stylized, hand-drawn 2D game art, clean contours |
| Framing | One isolated ttakji centered, about 80% of the canvas, with safe padding |
| Battle camera | Fixed slight top-down / three-quarter view |
| Inventory camera | Top-down, simplified for small slot sizes |
| Background | Fully transparent; no floor, cast shadow, item card, UI, labels, hands, or characters |

Produce the following four assets:

1. `base`: Undamaged **front face** for normal battle, selection, and previews.
2. `flipped`: The **reverse face** of that **same** ttakji after being flipped in battle. It is resting flat, not hovering or standing vertically. Do not merely rotate the front-face image 180°.
3. `inventory`: Readable top-down item icon of the same ttakji. Simplify tiny details but preserve recognizable folds, material, and colors. No inventory slot or frame baked into the PNG.
4. `damaged`: The **front face** after taking heavy damage. Preserve the original pose, silhouette, and scale as much as possible; add wear appropriate to its material (rips for paper, dents for metal, etc.).

The flipped sprite represents the result of a flip, **not** a full flipping animation. If animation is needed, animate the transition in the game engine or ask for separate animation frames.

## 2. Design consistency contract

- **Create the base sprite first**. Use the approved base image as a direct reference for each of the other three states. Do not rely on a text-only description when the image reference can be provided.
- Preserve the same fold geometry, underlying identity, material palette, contour weight, rendering style, and framing.
- Battle `base`, `flipped`, and `damaged` must share comparable scale and visual center, so swapping them does not make the object jump. The inventory camera is intentionally different.
- Draw a **Korean folded square ttakji**, with legible overlapping triangular folds and layered edges; avoid generic flat square tokens, coins, square crackers, cards, or unrelated origami.
- The physical fold silhouette should remain legible when displaying the sprite at a small game size.
- Material themes may reinterpret the surface (newspaper, cardboard, rubber, steel, circuits), but **must remain identifiable as a ttakji**. Apply material-appropriate damage.
- Newspapers may contain tiny decorative print marks; do not invent legible headlines, logos, UI text, numbers, or watermarks.
- Match any approved art direction from the repository before applying the defaults above.

## 3. Asset production workflow

1. **Inspect** existing ttakji sprites, style guidance, import paths, naming, and rendering code when accessible. Avoid overwriting approved assets without permission.
2. **Select** a material and a stable slug (default: `newspaper`). Decide base colors, surface treatment, and damage vocabulary.
3. **Generate base** as one isolated object. Review fold geometry and approve it as the visual anchor.
4. **Generate flipped** using the actual base as a reference. Show the opposite face upward, fixed battle camera and framing.
5. **Generate inventory** using the same base reference. Move to top-down and simplify small-scale detail.
6. **Generate damaged** using the same base reference. Keep the base's front face/camera and change **condition**, not identity.
7. **Normalize** all four assets to exact 256 × 256 RGBA PNGs. If the generator does not output that exact resolution, resize the object proportionally and center on a transparent 256 × 256 canvas. Never stretch or crop the ttakji.
8. **Validate** each image and compare the set as a group (see §6). Redo inconsistent states.
9. **Save** assets to the project folder; optionally integrate with the game's manifest/components if requested.
10. **Report** created paths, changes, checks, and any unresolved limitation. Never claim generation or validation succeeded unless actual files were produced and inspected.

If image generation or image editing is unavailable, provide the four complete prompts and an integration checklist; do **not** claim to have produced sprites.

## 4. Prompt builder

Replace `{MATERIAL}`, `{SURFACE}`, `{PALETTE}`, and `{DAMAGE}`. For follow-up states, **attach the actual approved base PNG as the reference image**.

### A. Base / battle

```text
Create ONE Korean traditional folded square ttakji made from {MATERIAL}, for a 2D side-view/side-scrolling web game's battle asset. Show the isolated ttakji resting flat, seen from a fixed slight top-down three-quarter camera. Depict unmistakable overlapping triangular folds, thick layered paper-like construction, readable silhouette, and {SURFACE}. Use {PALETTE}, subtle hand-drawn 2D game illustration, clean clear contours, and slightly exaggerated material detail. Precisely one object, centered and occupying approximately 80% of a square canvas. Deliver as a transparent RGBA PNG at exactly 256x256 pixels. No background, ground, cast shadow, hands, characters, UI, frame, labels, or extra objects. This is the design reference for all further states.
```

### B. Flipped / reverse face

```text
Using the ATTACHED APPROVED BASE SPRITE as the exact visual reference, draw THE SAME {MATERIAL} Korean folded square ttakji with its opposite reverse face now facing upward after a successful flip. It rests flat. Show believable backside fold arrangement, layered edges, and the same material, color family, contour style, object size, visual center, and fixed slight top-down three-quarter battle camera. This is a reverse-facing side of the same physical object, NOT the original front rotated in the image, NOT a hovering or vertically upright mid-flip pose. One isolated object, approximately 80% of the canvas, exactly 256x256 transparent RGBA PNG. No background, floor, shadows, motion lines, characters, UI, labels, or additional objects.
```

### C. Inventory icon

```text
Using the ATTACHED APPROVED BASE SPRITE as the design reference, draw the SAME {MATERIAL} Korean folded square ttakji as a clean top-down inventory item icon. Preserve its characteristic overlapping folds, colors, and {SURFACE}, but simplify micro-details and strengthen silhouette readability so it remains recognizable at 48x48 display size. Center it within about 80% of a square canvas. Match the same hand-drawn 2D game art style. Export as exactly 256x256 transparent RGBA PNG. NO inventory-slot border, card, item name, count, text, UI, shadow, background, hands, or other objects.
```

### D. Damaged / front face

```text
Using the ATTACHED APPROVED BASE SPRITE as the exact visual reference, draw the SAME {MATERIAL} Korean folded square ttakji with heavy battle damage on its ORIGINAL FRONT FACE. Maintain the original folds, visual center, proportions, overall silhouette, material palette, hand-drawn contour style, and slight top-down three-quarter camera. Show {DAMAGE}, but keep the object intact, recognizable, and on the ground. This represents low HP, not flipping. One isolated centered ttakji, about 80% of the canvas; exactly 256x256 transparent RGBA PNG. No background, floor, shadows, hands, characters, explosions, effects, labels, or UI.
```

### Default material: newspaper

For `newspaper` use:

- `{MATERIAL}` = `aged black-and-white newspaper`
- `{SURFACE}` = `muted off-white and gray newsprint fibers, tiny indistinct black printed columns, paper creases, slight wear, visibly folded edges`
- `{PALETTE}` = `warm off-white, light gray, charcoal black print`
- `{DAMAGE}` = `torn corners, crumpled edges, deep creases, partially loosened folds, and frayed newspaper fibers`

For non-paper materials, replace paper-like descriptions with suitable thickness, folds, texture, and damage while retaining the ttakji construction.

## 5. Files and integration

Default directory and filenames:

```text
assets/sprites/ttakji/{slug}/
  ttakji_{slug}_base.png
  ttakji_{slug}_flipped.png
  ttakji_{slug}_inventory.png
  ttakji_{slug}_damaged.png
```

For example:

```text
assets/sprites/ttakji/newspaper/
  ttakji_newspaper_base.png
  ttakji_newspaper_flipped.png
  ttakji_newspaper_inventory.png
  ttakji_newspaper_damaged.png
```

Use the project's existing folder convention if one already exists. Keep asset paths stable. If an asset manifest is appropriate, use `base`, `flipped`, `inventory`, `damaged` as state keys. Switch between `base` and `damaged` at a threshold chosen by gameplay logic; use `flipped` only for the completed flip state. Do not hardcode an HP threshold without a game-design decision.

## 6. Validation checklist (required)

- [ ] Four **different, correct states**, each in a separate file (not a combined sheet).
- [ ] Each file is **exactly 256×256**, PNG, with an actual alpha channel and transparent exterior pixels.
- [ ] No checkerboard painted into the image; no white rectangular background or baked UI.
- [ ] One centered object with sensible transparent margins; no clipping or stray objects.
- [ ] `base` and `damaged` clearly depict the **same front face**; `flipped` shows the **opposite face**.
- [ ] Consistent camera, approximate bounding-box size, and center across three battle sprites.
- [ ] `inventory` reads at **48×48** or a comparably small in-game size.
- [ ] Folds and material are recognizable, and wear differs appropriately for the chosen material.
- [ ] Existing approved project sprites and naming conventions are preserved.

For automated checks, use a local image library when available (e.g. Pillow) to inspect PNG dimensions, color mode, alpha extrema, and nontransparent bounds; visually inspect the images as well. Programmatic checks alone cannot prove art consistency. If a transparent PNG cannot be produced, disclose the blocker instead of delivering an opaque background as if it met the specification.

## 7. Request behavior

When asked to draw a particular material, produce all four states unless the user requests a subset. When asked only for prompts, give four copy-ready prompts instead of generating images. When asked to integrate into a repository, inspect its art pipeline and wire assets only after the images exist. Commit or push **only when the user requests it**. Do not expand to character sprites, arena backgrounds, gameplay code, or additional art unless requested.
