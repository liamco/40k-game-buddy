# Combat Engine

The Combat Engine is a flexible system for resolving Warhammer 40K combat with proper modifier aggregation, condition evaluation, and rules compliance.

## Architecture Overview

```
src/app/game-engine/
├── types/
│   ├── Mechanic.ts        # Entity, Effect, Condition, Operator types
│   ├── CombatContext.ts   # Game state passed to engine
│   ├── EffectSource.ts    # Effect origin tracking for attribution
│   ├── ModifierResult.ts  # Output types (StepModifiers, CombatResolution)
│   └── index.ts           # Type exports
├── CombatEngine.ts        # Main engine class
├── weaponAttributes.ts    # HEAVY, TORRENT, etc. → Mechanic conversion
├── hooks/
│   └── useCombatResolution.ts  # React hook for components
└── index.ts               # Public API exports
```

## Usage

### Basic Usage with React Hook

```typescript
import { useCombatResolution } from "#game-engine";

const resolution = useCombatResolution({
    phase: "shooting",
    attackerUnit,
    attackerForce,
    weaponProfile,
    modelCount,
    defenderUnit,
    defenderForce,
    targetModel,
});

// resolution contains all calculated values and attributed modifiers
if (resolution) {
    console.log(resolution.finalToHit);      // number | "auto"
    console.log(resolution.finalToWound);    // number
    console.log(resolution.hitModifiers);    // StepModifiers with bonuses/penalties
}
```

### Direct Engine Usage

```typescript
import { CombatEngine, buildCombatContext } from "#game-engine";

const context = buildCombatContext({
    phase: "shooting",
    attackerUnit,
    attackerForce,
    weaponProfile,
    modelCount,
    defenderUnit,
    defenderForce,
    targetModel,
});

if (context) {
    const engine = new CombatEngine(context);
    const resolution = engine.resolve();
}
```

## Core Concepts

### Mechanic

A structured representation of a game effect:

```typescript
interface Mechanic {
    entity: Entity;           // What is affected (thisUnit, targetUnit, etc.)
    effect: Effect;           // What it does (rollBonus, autoSuccess, etc.)
    attribute?: Attribute;    // Which stat (h, w, s, a, etc.)
    value: boolean | number | string;
    conditions?: Condition[]; // When it applies
}
```

### EffectSource

Tracks where modifiers come from for display attribution:

```typescript
type EffectSourceType =
    | "coreRule"        // Cover, battle-shock
    | "factionAbility"  // Army-wide rules
    | "detachmentRule"  // Detachment abilities
    | "unitAbility"     // Datasheet abilities
    | "leaderAbility"   // Attached leader abilities
    | "enhancement"     // Character upgrades
    | "weaponAttribute" // HEAVY, TORRENT, etc.
    | "stratagem";      // Activated stratagems
```

### CombatResolution

The output containing all calculated values:

```typescript
interface CombatResolution {
    // Base values
    baseToHit, baseToWound, baseSave, baseInvuln, baseFnp, baseDamage

    // Modifiers per step (with attribution)
    hitModifiers, woundModifiers, saveModifiers, fnpModifiers, damageModifiers

    // Final computed values
    finalToHit: number | "auto"
    finalToWound: number
    finalSave: number
    useInvuln: boolean

    // Weapon special effects
    weaponEffects: SpecialEffect[]
}
```

## Current Implementation Status

### Fully Working

| Mechanic | Description |
|----------|-------------|
| Base calculations | To-hit (BS/WS), to-wound (S vs T), saves (armor/invuln with AP) |
| TORRENT | Auto-hit detection, displays "Auto" |
| HEAVY | +1 to hit when unit's `movementBehaviour` is "hold" |
| Modifier capping | +1/-1 cap enforced for hit and wound rolls |
| Modifier attribution | Bonuses/penalties display with source labels |
| PRECISION | Allows targeting of leaders in combined units |

### Groundwork Laid - Conditions Need to be Met

| Mechanic | Status | What's Needed |
|----------|--------|---------------|
| LANCE | Condition evaluation in place | `hasCharged === true` to trigger +1 wound |
| LETHAL HITS | Parsed as SpecialEffect | Dice rolling implementation |
| SUSTAINED HITS | Parsed with value | Dice rolling implementation |
| DEVASTATING WOUNDS | Parsed as SpecialEffect | Dice rolling implementation |
| RAPID FIRE | Parsed with value | "In half range" state tracking |
| MELTA | Parsed with value | "In half range" state tracking |
| IGNORES COVER | Parsed | Cover bonuses for defenders |
| ASSAULT, HAZARDOUS, BLAST, INDIRECT | Parsed as SpecialEffect | Display only currently |

### Future Phases

| Mechanic | Reason Not Working |
|----------|-------------------|
| Unit abilities | Datasheet `mechanics[]` not populated |
| Leader abilities | Needs mechanics data on datasheets |
| Stratagems | UI and mechanics data needed |
| Detachment rules | Not collected by engine yet |
| Faction abilities | Not collected by engine yet |
| Enhancements | Not collected by engine yet |
| Cover bonuses | `isInCover` tracked but not applied |
| Feel No Pain | Model type lacks `fnp` property |
| Dice rolling | Engine outputs target numbers only |
| Rerolls | Type exists but no implementation |

## Extending the Engine

### Adding a New Effect Source

1. Add collection method in `CombatEngine.ts`:

```typescript
private collectFromNewSource(): void {
    // Get data from context
    const sourceData = this.context.attacker.newSourceData;
    
    for (const item of sourceData) {
        if (item.mechanics) {
            for (const mechanic of item.mechanics) {
                this.collectedMechanics.push({
                    mechanic,
                    source: createEffectSource("newSourceType", item.name),
                });
            }
        }
    }
}
```

2. Call it from `collectAllMechanics()`:

```typescript
private collectAllMechanics(): void {
    this.collectFromWeapon();
    this.collectFromNewSource(); // Add here
}
```

3. Add the source type to `EffectSourceType` in `types/EffectSource.ts`

### Adding a New Condition

Add to `getStateValue()` in `CombatEngine.ts`:

```typescript
private getStateValue(entity: Entity, state: string): boolean {
    // ... existing cases ...
    
    case "newCondition":
        return combatState.newProperty ?? false;
}
```

### Adding a New Weapon Attribute

Add to `parseWeaponAttribute()` in `weaponAttributes.ts`:

```typescript
if (attr === "NEW ATTRIBUTE") {
    return {
        mechanic: {
            entity: "thisUnit",
            effect: "rollBonus",
            attribute: "h",
            value: 1,
            conditions: [/* optional conditions */],
        },
        specialEffect: {
            type: "newAttribute",
            value: true,
            source,
        },
    };
}
```

## 40K Rules Compliance

### Modifier Caps

Per 10th Edition rules:
- Hit and wound roll modifiers: capped at +1/-1 total
- Save, attacks, damage modifiers: no caps

### Battle-shock

- Does NOT disable unit abilities
- Prevents stratagems from being used on the unit
- Sets OC to 0 (no effect on combat resolution)

### Stacking

- Multiple bonuses sum before capping
- Priority determines override order for conflicts (stratagems > unit abilities > weapon attributes)

## Integration Points

### AttackResolver

Receives `CombatResolution` and displays each step:

```typescript
<AttackResolver resolution={combatResolution} modelCount={attackerModelCount} />
```

### AttackStep

Receives attributed modifiers for display:

```typescript
<AttackStep
    bonuses={resolution.hitModifiers.forDisplay.bonuses}
    penalties={resolution.hitModifiers.forDisplay.penalties}
    finalValue={`${resolution.finalToHit}+`}
/>
```

### Octagon

Builds context and calls the hook:

```typescript
const combatResolution = useCombatResolution({
    phase: gamePhase,
    attackerUnit: selectedAttackerUnit?.item ?? null,
    // ... other params
});
```
