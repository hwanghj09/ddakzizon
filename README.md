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

The skill contains instructions and prompts; it does **not** include generated PNG assets yet.
