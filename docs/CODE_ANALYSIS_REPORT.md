# Code Analysis Report

**Date:** 2026-02-02 (Updated)  
**Scope:** Game Engine (`src/app/game-engine/`) and Engagements Module (`src/app/modules/Engagements/`)

---

## Executive Summary

This report identifies code quality issues, architectural concerns, and improvement opportunities across the game engine and Engagements module. Issues are categorized by severity and include specific file/line references.

---

## Game Engine Analysis

### High Priority Issues

#### 1. Unimplemented Effect Types

**Location:** `src/app/game-engine/types/Mechanic.ts:14`

```typescript
export type Effect = "rollBonus" | "rollPenalty" | "staticNumber" | "addsKeyword" | 
                     "addsAbility" | "reroll" | "autoSuccess" | "mortalWounds" | 
                     "ignoreModifier" | "halveDamage" | "minDamage" | "setsFnp";
```

- **Defined:** 12 effect types
- **Fully Implemented:** 6 types
  - `rollBonus` - in `evaluateStep()`, adds to hit/wound/save modifiers
  - `rollPenalty` - in `evaluateStep()`, subtracts from modifiers
  - `setsFnp` - in `deriveFnpFromMechanics()`, sets Feel No Pain value
  - `addsAbility` - in `processAbilityGrantingMechanics()`, converts to special effects (LETHAL HITS, etc.)
  - `autoSuccess` - in `hasAutoSuccessForAttribute()`, checked in `computeFinalToHit()` which returns `"auto"` (used by TORRENT)
  - `ignoreModifier` - in `hasIgnoreModifierFor()`, suppresses specific modifiers like cover bonus (used by IGNORES COVER)
- **Unimplemented:** 6 types (`staticNumber`, `addsKeyword`, `reroll`, `mortalWounds`, `halveDamage`, `minDamage`)

No type safety prevents using unimplemented effects, leading to silent failures.

---

#### 2. Missing Range Conditions

**Location:** `src/app/game-engine/CombatEngine.ts:366+`

The `inHalfRange` state is referenced in RAPID FIRE and MELTA conditions in `weaponAttributes.ts`, but `getStateValue()` doesn't handle it:

```typescript
// weaponAttributes.ts - RAPID FIRE condition
conditions: [{ entity: "thisUnit", state: "inHalfRange", operator: "equals", value: true }]

// CombatEngine.ts - getStateValue() has no case for "inHalfRange"
// Returns false, so RAPID FIRE and MELTA bonuses NEVER apply
```

**Impact:** RAPID FIRE and MELTA weapon bonuses are currently broken.

---

#### 3. Type Safety Gaps

**A. Unsafe `any` types**

- `CombatEngine.ts:447` - `compare()` function accepts `any`:
  ```typescript
  private compare(actual: any, operator: string, expected: any): boolean
  ```

- `CombatEngine.ts:480` - Type assertion discards type info:
  ```typescript
  return baseToHit as any;
  ```

**B. Unsafe JSON import**

- `coreAbilities.ts:20`:
  ```typescript
  const registry = coreAbilitiesData as CoreAbilitiesRegistry;
  ```
  No runtime validation that JSON matches expected schema.

**C. Mechanic value type too permissive**

- `Mechanic.ts` - `value` allows any of 3 types but effects require specific types:
  ```typescript
  value: boolean | number | string;
  ```
  Should use discriminated union: `{ effect: "rollBonus"; value: number } | ...`

---

#### 4. Dead Code - Stratagem System

**Location:** `src/app/game-engine/CombatEngine.ts:174`

```typescript
// this.collectFromStratagems();
```

- `activeStratagems` accepted in `CombatContext` but never used
- `collectFromStratagems()` function doesn't exist
- Stratagems are completely non-functional

---

#### 5. Incomplete Critical Hit/Wound Logic

**Location:** `src/app/game-engine/CombatEngine.ts:499-530`

- `criticalHitThreshold` and `criticalWoundThreshold` are computed
- But effects (auto-wound on critical hit, mortal wounds on critical wound) are not applied
- Results are informational only, not evaluated in damage calculation

---

### Medium Priority Issues

#### 1. Code Duplication

**A. Entity Resolution**
- `resolveEntityToUnit()` called multiple times per condition evaluation
- Should resolve once and pass unit reference

**B. State Aliases**
- Multiple aliases for same state: `isInCover` vs `inCover`, `hasChargedThisTurn` vs `hasCharged`
- Should normalize state names before checking

**C. ANTI-X Regex Parsing**
- Same regex pattern appears in `weaponAttributes.ts` and `CombatEngine.ts`
- Should extract to shared constant

---

#### 2. CombatEngine Does Too Much

**Location:** `src/app/game-engine/CombatEngine.ts` (596 lines)

Single class handles:
- Collecting mechanics from sources
- Evaluating conditions
- Aggregating modifiers
- Computing final values
- Formatting for display

**Recommendation:** Split into focused classes:
- `MechanicCollector`
- `ConditionEvaluator`
- `ModifierAggregator`
- `DisplayFormatter`

---

#### 3. Weapon Attributes Parsing

**Location:** `src/app/game-engine/weaponAttributes.ts` (352 lines)

Large `parseWeaponAttribute()` function with switch/if statements.

**Recommendation:** Refactor to registry pattern similar to core abilities:
```typescript
const WEAPON_ATTRIBUTE_REGISTRY = {
  "ASSAULT": { mechanic: null, specialEffect: { type: "assault" } },
  "HEAVY": { mechanic: { effect: "rollBonus", ... }, specialEffect: { type: "heavy" } },
  // ...
};
```

---

### Low Priority Issues

1. **No memoization** of keyword lookups - `getUnitKeywords()` called multiple times per resolve
2. **Linear search** through mechanics for each step - should index by attribute
3. **Unused function** - `filterCombatRelevantMechanics()` in `abilityMechanics.ts` never called

---

## Engagements Module Analysis

### High Priority Issues

#### 1. Props Drilling

**Location:** `src/app/modules/Engagements/ViewEngagement/CombatPhase/Octagon.tsx`

```typescript
<AttackerPanel
  gamePhase={gamePhase}
  force={attackingForce}
  unitItems={attackerUnitItems}
  selectedUnit={selectedAttackerUnit}
  onUnitChange={handleAttackerUnitChange}
  selectedWeapon={selectedWeapon}
  onWeaponChange={handleWeaponChange}
  onCombatStatusChange={handleAttackerCombatStatusChange}
/>
```

8+ props passed to each panel component.

**Recommendation:** Extract `AttackerPanelState` context or use compound component pattern.

---

#### 2. God Component

**Location:** `src/app/modules/Engagements/ViewEngagement/CombatPhase/Octagon.tsx` (201 lines)

Handles too many responsibilities:
- Unit selection state management
- Weapon selection logic
- Model selection validation
- Precision targeting rules
- Movement behavior constraints
- Combat resolution integration
- Phase-specific logic

**Recommendation:** Split into focused hooks:
- `useUnitSelection()`
- `useWeaponSelection()`
- `useCombatTargeting()`

---

#### 3. State Inconsistency

**Location:** `src/app/modules/Engagements/EngagementManagerContext.tsx:321-346`

```typescript
const updateUnitCombatState = useCallback((engagementId, forceType, unitId, updates) => {
  // forceType parameter IGNORED - re-derived by searching both forces
  const unitInForceA = engagement.engagementForceA.items.some((item) => item.listItemId === unitId);
  const forceKey = unitInForceA ? "engagementForceA" : "engagementForceB";
  // ...
});
```

**Issues:**
- If unit ID exists in both forces, behavior is unpredictable
- No validation that unit exists
- `forceType` parameter ignored and re-derived

---

#### 4. Dead Code

**A. Debug logging**
- `CombatStatusPanel.tsx:80`: `console.log(unit.name, combatState.isDestroyed)`

**B. Unused state variables**
- `Octagon.tsx:41-42`:
  ```typescript
  const [activeAttackerStratagems, setActiveAttackerStratagems] = useState<string[]>([]);
  const [activeDefenderStratagems, setActiveDefenderStratagems] = useState<string[]>([]);
  ```

---

### Medium Priority Issues

#### 1. Duplication

**A. Turn flag reset logic**
- `advanceTurn()` and `resetTurnFlags()` in `EngagementManagerContext.tsx` duplicate flag reset logic
- Should extract shared `_resetAllUnitFlags()` helper

**B. Model availability checking**
- Scattered across `CombatStatusPanel.tsx`, `DefenderPanel.tsx`, `CasualtyPanel.tsx`
- Should create shared `useModelAvailability()` hook

**C. Weapon selection logic**
- Duplicated across multiple callbacks in `Octagon.tsx`
- Should consolidate into derived state hook

---

#### 2. Missing Memoization

**A. Model sorting**
- `DefenderPanel.tsx:38-63` - O(n log n) sort on every render
- Should pre-sort during unit creation

**B. Inline callbacks**
- `Dancefloor.tsx:11` creates new function on every render:
  ```typescript
  const handleCombatStatusChange = (unitId, updates) => {
    onUpdateUnitCombatState("attacking", unitId, updates);
  };
  ```
  Should use `useCallback()`

---

#### 3. combatUtils.ts Needs Reorganization

**Location:** `src/app/modules/Engagements/ViewEngagement/CombatPhase/utils/combatUtils.ts`

16 exported functions with mixed concerns.

**Recommendation:** Split into focused modules:
```
combatUtils/
  ├── unitSelection.ts
  ├── weaponSelection.ts
  ├── targetingRules.ts
  └── movementRules.ts
```

---

#### 4. Missing Validation

No validation utilities for:
- Unit exists in engagement
- Combat state is valid
- Model instance IDs match unit
- Weapon belongs to unit

**Recommendation:** Create `validation.ts` module.

---

## Summary Table

| Category | Severity | Count | Key Issues |
|----------|----------|-------|-----------|
| Unimplemented Features | High | 3 | 6 effect types, range conditions, stratagems |
| Type Safety | High | 4 | `any` types, unsafe casts, loose parameters |
| Dead Code | Medium | 4 | Console.log, unused state, commented code |
| Duplication | Medium | 6 | Entity resolution, state aliases, turn flags |
| Architecture | High | 3 | God components, props drilling, mixed concerns |
| Performance | Low | 4 | Missing memoization, linear searches |

---

## Recommended Priority Order

### Immediate (Bug Fixes)
1. Implement `inHalfRange` state evaluation (RAPID FIRE/MELTA currently broken)
2. Remove debug `console.log` statements

### Short Term (Code Quality)
1. Split `Octagon.tsx` into focused hooks
2. Extract weapon attribute parsing to registry pattern
3. Add JSON schema validation for `core-abilities.json`
4. Fix state inconsistency in `updateUnitCombatState()`

### Medium Term (Architecture)
1. Split `CombatEngine` into focused classes
2. Reorganize `combatUtils.ts` into modules
3. Create validation utilities
4. Extract shared hooks for model availability

### Long Term (Features)
1. Implement stratagem system
2. Implement remaining effect types (rerolls, mortal wounds, etc.)
3. Add comprehensive type guards and discriminated unions
4. Complete critical hit/wound damage application

---

## Appendix: File References

### Game Engine Files
- `src/app/game-engine/CombatEngine.ts` - Main combat resolution
- `src/app/game-engine/abilityMechanics.ts` - Ability extraction
- `src/app/game-engine/weaponAttributes.ts` - Weapon parsing
- `src/app/game-engine/coreAbilities.ts` - Core ability registry
- `src/app/game-engine/types/Mechanic.ts` - Effect/condition types
- `src/app/game-engine/types/ModifierResult.ts` - Output types
- `src/app/game-engine/types/EffectSource.ts` - Source attribution

### Engagements Module Files
- `src/app/modules/Engagements/EngagementManagerContext.tsx` - State management
- `src/app/modules/Engagements/ViewEngagement/CombatPhase/components/Octagon.tsx` - Combat UI
- `src/app/modules/Engagements/ViewEngagement/CombatPhase/components/AttackerPanel.tsx`
- `src/app/modules/Engagements/ViewEngagement/CombatPhase/components/DefenderPanel.tsx`
- `src/app/modules/Engagements/ViewEngagement/CombatPhase/utils/combatUtils.ts`
- `src/app/modules/Engagements/ViewEngagement/MovementPhase/utils/movementEffects.ts`
