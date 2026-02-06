# Code Analysis Report

**Date:** 2026-02-06 (Updated)  
**Scope:** Game Engine (`src/app/game-engine/`), Engagements Module (`src/app/modules/Engagements/`), and Types (`src/app/types/`)

---

## Executive Summary

This report identifies code quality issues, architectural concerns, and improvement opportunities. Since the last report (2026-02-02), some issues have been fixed, others remain, and new issues have emerged. The codebase has grown with enhancement system integration.

**Key Changes Since Last Report:**
- Enhancement system integrated into combat engine
- CombatEngine grown from ~596 to 895 lines
- Debug console.log removed (FIXED)
- Model sorting memoization added (FIXED)
- New type safety issues introduced with enhancement mechanics

**Note:** Some features (RAPID FIRE, MELTA, reroll effects, mortal wounds, etc.) are outside current application scope and tracked separately in the roadmap.

---

## Game Engine Analysis

### High Priority Issues

#### 1. Type Safety Gaps (8 instances of `any`)

**Status:** STILL PRESENT / WORSENED

| Location | Issue |
|----------|-------|
| `CombatEngine.ts:241` | `value?: any` parameter in createSpecialEffectForAbility |
| `CombatEngine.ts:294` | `(attackerUnit as any).resolvedWargearAbilities` |
| `CombatEngine.ts:311` | `(defenderUnit as any).resolvedWargearAbilities` |
| `CombatEngine.ts:393` | `isEnhancementBearerAlive(unit: any)` - NEW |
| `CombatEngine.ts:645` | `isLeaderAlive(unit: any)` |
| `CombatEngine.ts:719` | `compare(actual: any, operator: string, expected: any)` |
| `CombatEngine.ts:752` | `return baseToHit as any` |
| `coreAbilities.ts:20` | Unsafe JSON cast without runtime validation |

---

#### 2. Dead Code - Stratagem System

**Status:** STILL PRESENT  
**Location:** `CombatEngine.ts:193-194`

```typescript
// Future: stratagems, etc.
// this.collectFromStratagems();
```

- `activeStratagems` accepted in CombatContext but never used
- `collectFromStratagems()` doesn't exist
- Stratagems completely non-functional

---

#### 3. Critical Hit/Wound Effects Not Applied

**Status:** PARTIAL - Informational only  
**Location:** `CombatEngine.ts:74-75, 797-836`

- Thresholds computed and returned in result
- ANTI-X logic implemented for critical wound threshold
- But effects never applied:
  - LETHAL HITS auto-wound not triggered
  - SUSTAINED HITS extra hits not generated
  - Mortal wounds on critical wounds not dealt

---

### Medium Priority Issues

#### 4. CombatEngine Size - WORSENED

**Status:** GROWN from ~596 to 895 lines (+50%)  
**Location:** `CombatEngine.ts`

Now handles 6+ responsibilities:
1. Collecting mechanics from weapons, abilities, enhancements, wargear, damaged profiles
2. Evaluating conditions
3. Aggregating modifiers
4. Computing final values
5. Formatting for display
6. Leader/enhancement bearer alive checks

**New Methods Added:**
- `collectFromEnhancement()` (line 361)
- `isEnhancementBearerAlive()` (line 393)

---

#### 5. Code Duplication

**A. State Aliases - STILL PRESENT**
```typescript
// CombatEngine.ts:604-615
case "isInCover":
case "inCover":
case "hasChargedThisTurn":
case "hasCharged":
case "hasFiredThisPhase":
case "hasShot":
```

**B. ANTI-X Regex - DUPLICATED**
- `weaponAttributes.ts:274` - `/^ANTI-(.+)\s+(\d)\+$/`
- `CombatEngine.ts:818` - Same pattern

**C. Entity Resolution - Called 20+ times per combat**

---

#### 6. NEW: ANTI-X Condition Bug

**Location:** `weaponAttributes.ts:284-290`

```typescript
conditions: [
    {
        entity: "targetUnit",
        keywords: [keyword],
        operator: "includes",
        value: keyword,  // <-- BUG: should be 'true'
    },
],
```

---

### Low Priority Issues

- `filterCombatRelevantMechanics()` in `abilityMechanics.ts:118-122` - Never called (dead code)
- No memoization of keyword lookups
- Linear search through mechanics for each step

---

## Engagements Module Analysis

### High Priority Issues

#### 1. Props Drilling

**Status:** STILL PRESENT  
**Location:** `Octagon.tsx:176-196`

- AttackerPanel: 8 props
- DefenderPanel: 9 props

No context extraction implemented.

---

#### 2. God Component - Octagon.tsx

**Status:** STILL PRESENT  
**Location:** `Octagon.tsx` - 202 lines

Still handles 7 responsibilities:
1. Unit selection state management
2. Weapon selection logic
3. Model selection validation
4. Precision targeting rules
5. Movement behavior constraints
6. Combat resolution integration
7. Phase-specific logic

---

#### 3. State Inconsistency - forceType Ignored

**Status:** STILL PRESENT  
**Location:** `EngagementManagerContext.tsx:342-365`

```typescript
const updateUnitCombatState = useCallback((engagementId, forceType, unitId, updates) => {
    // forceType parameter IGNORED - re-derived by searching both forces
    const unitInForceA = engagement.engagementForceA.items.some((item) => item.listItemId === unitId);
```

---

#### 4. Dead Code

| Issue | Status | Location |
|-------|--------|----------|
| Console.log in CombatStatusPanel | **FIXED** | Was line 80 |
| Unused stratagem state | PRESENT | `Octagon.tsx:41-42` |
| Unused `getFirstWeaponProfileForPhase` | NEW | `combatUtils.ts:55` |

---

### Medium Priority Issues

#### 5. Duplication

**A. Turn Flag Reset - STILL PRESENT**  
`EngagementManagerContext.tsx:436-466` and `468-497` have identical reset logic.

**B. Model Availability Checking - STILL PRESENT**  
Scattered across `CombatStatusPanel.tsx`, `DefenderPanel.tsx`, `CasualtyPanel.tsx`.

**C. Weapon Selection Logic - STILL PRESENT**  
Multiple similar callbacks in `Octagon.tsx:66-111`.

---

#### 6. Missing Memoization

| Issue | Status | Location |
|-------|--------|----------|
| Model sorting | **FIXED** | `DefenderPanel.tsx:39-44` |
| Inline callback in Dancefloor | PRESENT | `Dancefloor.tsx:14-16` |
| useMemo missing deps | NEW | `DefenderPanel.tsx:73-90` |

---

#### 7. combatUtils.ts Organization

**Status:** STILL PRESENT  
**Location:** `combatUtils.ts` - 446 lines, 15 exported functions

Mixed concerns - should split into:
- `unitSelection.ts`
- `weaponSelection.ts`
- `targetingRules.ts`
- `movementRules.ts`
- `abilityDisplay.ts`

---

## Types Analysis

### High Priority Issues

#### 1. Loose `mechanics` Types

**Status:** NEW  
**Locations:**
- `Enhancements.tsx:10` - `mechanics?: any[]`
- `Units.tsx:136` - `keywords?: any[]`
- `Units.tsx:138` - `unitComposition?: any[]`
- `Detachments.tsx:6` - `abilities?: any[]`

Should use `Mechanic[]` from game engine types.

---

#### 2. Mechanic Value Type Too Permissive

**Status:** STILL PRESENT  
**Location:** `Mechanic.ts:61`

```typescript
value: boolean | number | string;  // Allows invalid combinations
```

Should use discriminated union per effect type.

---

### Good Patterns Found

- `EngagementForceItem` uses proper `Omit` + intersection pattern (`Engagements.tsx:73-83`)
- `EngagementAbility` cleanly extends `Ability` (`Engagements.tsx:20-23`)
- No circular dependencies in type imports
- `resolveWargearAbilities()` has clean type signatures

---

## Summary Table

| Category | Severity | Count | Status vs Last Report |
|----------|----------|-------|----------------------|
| Type Safety (`any`) | High | 8+ | WORSENED (+2 new) |
| Dead Code | High | 3 | IMPROVED (1 fixed) |
| Architecture | High | 3 | WORSENED (CombatEngine +50%) |
| Duplication | Medium | 6 | UNCHANGED |
| Performance | Low | 4 | PARTIALLY FIXED (1 memoization) |
| New Type Issues | High | 4 | NEW (loose mechanics types) |

---

## Recommended Priority Order

### Short Term (Code Quality)
1. Fix `Enhancement.mechanics` type to use `Mechanic[]`
2. Remove unused stratagem state from Octagon.tsx
3. Add missing useMemo dependencies in DefenderPanel
4. Extract turn flag reset to shared helper
5. Fix ANTI-X condition bug - `value` should be `true` not keyword string

### Medium Term (Architecture)
1. Split CombatEngine into focused classes (now 895 lines)
2. Extract Octagon.tsx into focused hooks
3. Create context for attack/defense state (eliminate props drilling)
4. Reorganize combatUtils.ts into modules

### Long Term (Features)
1. Implement stratagem system
2. Apply critical hit/wound effects (currently informational only)
3. Add discriminated unions for Mechanic type

---

## Future Roadmap (Out of Current Scope)

The following features are tracked separately and not prioritized for current development:

1. **RAPID FIRE / MELTA support** - Requires `inHalfRange` state evaluation in CombatEngine
2. **Unimplemented effect types:**
   - `reroll` - Dice reroll mechanics
   - `mortalWounds` - Mortal wound application
   - `halveDamage` - Damage reduction
   - `minDamage` - Minimum damage floors

---

## Files Reference

### Game Engine
| File | Lines | Issues |
|------|-------|--------|
| `CombatEngine.ts` | 895 | 8 `any` types, missing inHalfRange, stratagem dead code |
| `weaponAttributes.ts` | 352 | ANTI-X bug, regex duplication |
| `abilityMechanics.ts` | 154 | Unused filter function |
| `types/Mechanic.ts` | 62 | Loose value type |

### Engagements Module
| File | Lines | Issues |
|------|-------|--------|
| `Octagon.tsx` | 202 | Props drilling, god component, unused state |
| `EngagementManagerContext.tsx` | 500+ | forceType ignored, turn flag duplication |
| `combatUtils.ts` | 446 | Mixed concerns, unused export |
| `DefenderPanel.tsx` | 200+ | Missing useMemo deps |
| `Dancefloor.tsx` | 50+ | Inline callback not memoized |

### Types
| File | Issues |
|------|--------|
| `Enhancements.tsx` | `mechanics?: any[]` |
| `Units.tsx` | `keywords?: any[]`, `unitComposition?: any[]` |
| `Detachments.tsx` | `abilities?: any[]` |
