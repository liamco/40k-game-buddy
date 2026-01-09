# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changing files

# Data processing scripts
npm run parse-depot-data       # Process depot JSON files (converts strings to numbers, transforms formats)
npm run extract-effects:openai # Extract game effects from ability descriptions using OpenAI
```

## Architecture

This is a Warhammer 40,000 game assistant React application built with Vite, using Tailwind CSS 4 and shadcn/ui components.

### Core Modules (`src/app/pages/`)

- **AttackResolver** - Calculates combat outcomes (to-hit, to-wound, saves) based on attacker/defender stats and weapon profiles
- **ListManager** - Army list builder with localStorage persistence. Handles faction/detachment selection, unit composition, leader attachment
- **Stratagems** - Displays available stratagems filtered by game phase and turn

### Data Flow

1. **Depot Data** (`src/app/depotdata/`) - JSON files containing faction, datasheet, and stratagem data
   - Organized as `factions/{faction-slug}/faction.json` and `factions/{faction-slug}/datasheets/{id}.json`
   - Loaded dynamically via Vite's `import.meta.glob` in `depotDataLoader.ts`

2. **Data Processing** (`scripts/`)
   - `parse-depot-data.js` - Transforms raw depot data (converts "5+" to 5, "7\"" to 7, normalizes formats)
   - `extract-effects.js` - Uses OpenAI to parse ability descriptions into structured `Mechanic` objects

### Key Types (`src/app/types.ts`)

- `Datasheet` - Unit data including models, wargear, abilities, keywords
- `WeaponProfile` - Weapon stats (attacks, strength, AP, damage, attributes like HEAVY/TORRENT)
- `Model` - Individual model stats (M, T, Sv, W, etc.)
- `ArmyList` / `ArmyListItem` - List builder data structures with localStorage persistence
- `AttackResult` - Combat calculation output with roll targets and modifiers

### Effects System (`guidelines/exampleEffectsFormat.ts`)

Defines the `Mechanic` interface for structured game effects:
- `entity` - What is affected (thisUnit, targetUnit, etc.)
- `effect` - Type of effect (rollBonus, addsKeyword, etc.)
- `conditions` - When the effect applies

### State Management

- Uses React state with localStorage/sessionStorage persistence
- Army lists stored under `battle-cogitator-army-lists` key
- Selected lists for combat stored in session storage
- Custom `listsUpdated` event for cross-component synchronization

### Combat Calculation (`AttackResolver.tsx`)

Implements 40k 10th edition rules:
- Strength vs Toughness wound roll calculation
- Weapon attributes (HEAVY, TORRENT, IGNORES COVER) affect rolls
- Unit abilities (Stealth, Feel No Pain) apply modifiers
- Invulnerable saves override armor when better
