# Codebase Refactoring Audit

**Date:** 2026-01-31  
**Status:** Recommendations only - no changes made

---

## 1. Duplicated UI Patterns

### 1.1 WeaponProfileCard Duplication
- **Files:** 
  - `src/app/components/WeaponProfileCard/WeaponProfileCard.tsx` (189 lines)
  - `src/app/modules/Lists/ViewList/components/UnitDetailsView/WargearTab/WargearProfileCard.tsx` (168 lines)
- **Problem:** Nearly identical components with same types (`BonusAttribute`, `StatBonus`, `CounterControls`) and rendering logic for weapon stats with bonuses.
- **Suggestion:** Extract shared base component. Move common interfaces to shared types file.

### 1.2 Selected State Card Styling
- **Files:** ModelProfileCard, WeaponProfileCard, WargearProfileCard, EnhancementCard
- **Pattern:** All use similar selected state styling:
  ```tsx
  className={`${isSelected ? "bg-skarsnikGreen shadow-glow-green text-deathWorldForest" : "text-skarsnikGreen"} ...`}
  ```
- **Suggestion:** Create shared variant object or `useCardSelectedStyles()` hook:
  ```tsx
  const selectedVariants = {
    selected: "bg-skarsnikGreen shadow-glow-green text-deathWorldForest",
    unselected: "text-skarsnikGreen"
  }
  ```

### 1.3 Icon + Text Badge Pattern
- **Files:** UnitListItem.tsx, EnhancementCard.tsx, LeaderAttachmentCard.tsx
- **Pattern:** Repeated Badge with Icon inside
- **Suggestion:** Create `IconBadge` component combining Badge + BaseIcon + Icon.

---

## 2. Duplicated Logic & State Patterns

### 2.1 Model Instance Calculation
- **Files:** 
  - `ListManagerContext.tsx` (lines 82-104): `calculateTotalModels()`
  - `EngagementManagerContext.tsx` (lines 8-22): `calculateTotalModels()`
- **Problem:** Identical function implemented twice.
- **Suggestion:** Extract to `/src/app/utils/modelCalculations.ts`.

### 2.2 Weapon Parsing Functions
- **File:** `ListManagerContext.tsx`
- **Functions:**
  - `parseLoadoutWeapons()` (lines 199-207)
  - `parseLoadoutByModelType()` (lines 276-339)
  - `findWeaponIdByName()` (lines 342-351)
  - `parseOptionConstraint()` (lines 447-478)
  - `parseWeaponsFromOption()` (lines 481-512)
  - `parseOptionWeaponChanges()` (lines 549-642)
- **Problem:** 40+ line parsing utilities tightly coupled to context. Complex, difficult to test.
- **Suggestion:** Extract to `/src/app/utils/weaponParsing.ts` or create `WeaponParser` class.

### 2.3 Warlord Eligibility Calculation
- **File:** `ListManagerContext.tsx` (lines 105-135): `getWarlordEligibility()`
- **Problem:** Standalone utility mixed with context logic.
- **Suggestion:** Move to `/src/app/utils/warlordRules.ts`.

### 2.4 Leader Attachment Validation
- **File:** `ListManagerContext.tsx` (lines 56-103): `validateMultiLeaderAttachment()`
- **Problem:** Complex game rule logic mixed with state management.
- **Suggestion:** Extract to `/src/app/utils/leaderRules.ts` with tests.

### 2.5 String Normalization Patterns
- **Problem:** Multiple files repeat HTML stripping:
  ```tsx
  const normalized = description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  ```
- **Suggestion:** Create `normalizeHtmlText()` in `/src/app/utils/textProcessing.ts`.

---

## 3. Performance Issues

### 3.1 WeaponProfileCard Bonus Calculations
- **File:** `WeaponProfileCard.tsx` (lines 80-94)
- **Problem:** `getStatBonus()` and `getStatBonusSources()` recalculate on every render.
- **Suggestion:** Wrap in `useMemo()`:
  ```tsx
  const statBonusMap = useMemo(() => {
    if (!statBonuses) return new Map();
    // pre-calculate bonus map by attribute
  }, [statBonuses]);
  ```

### 3.2 Repeated Model Count Calculations
- **Problem:** `calculateTotalModels()` called multiple times per render in some components.
- **Suggestion:** Memoize at item level or cache in context.

### 3.3 List Item Re-renders
- **File:** `ListIndex.tsx`
- **Problem:** Missing memoization when rendering list items.
- **Suggestion:** Wrap list items in `React.memo()`.

---

## 4. Code Organization Issues

### 4.1 Monolithic ListManagerContext (1,385 lines)
- **File:** `/src/app/modules/Lists/ListManagerContext.tsx`
- **Concerns mixed:**
  - List CRUD operations (lines 1068-1170)
  - Leader attachment logic (lines 1260-1352)
  - Enhancement management (lines 1175-1210)
  - Wargear/loadout management (lines 1350-1395)
  - Complex parsing utilities (lines 199-642)
  - Game rules validation (lines 56-135)
- **Suggestion:** Split into:
  - `ListManagerContext.tsx` - state & basic CRUD only
  - `useListOperations.ts` - custom hook for list operations
  - `useLeaderAttachment.ts` - custom hook for leader logic
  - `useWargearManagement.ts` - custom hook for wargear logic
  - `/utils/listParsing.ts` - all parsing utilities
  - `/utils/gameRules.ts` - validation & rules

### 4.2 Large Component Files
- **WargearTab.tsx** (526 lines): Complex weapon swap logic mixed with rendering
- **ViewList.tsx** (265 lines): List display logic mixed with data loading
- **Octagon.tsx** (224 lines): SVG rendering mixed with event handling

### 4.3 Missing Shared Type System
- **Problem:** Multiple files define nearly identical bonus/enhancement types.
- **Suggestion:** Create `/src/app/types/Bonuses.ts`:
  ```tsx
  export interface BonusAttribute { ... }
  export interface StatBonus { ... }
  ```

---

## 5. Type Safety Issues

### 5.1 Excessive Use of `any`
- **Files:** 
  - `Units.tsx`: `abilities?: any[]`, `keywords?: any[]`, `options?: any[]` (lines 20-22)
  - `Enhancements.tsx`: `mechanics?: any[]` (line 10)
  - `Detachments.tsx`: `abilities?: any[]`, `[key: string]: any` (lines 5-7)
  - `Factions.tsx`: `mechanics?: any[]` (line 13)
- **Suggestion:** Create proper type definitions for Ability, Keyword, Option interfaces.

### 5.2 Weak Union Types for Abilities
- **Problem:** `ability.name?.toUpperCase() === "SUPREME COMMANDER"` is fragile.
- **Suggestion:** Create discriminated union:
  ```tsx
  type AbilityType = 'SupremeCommander' | 'LastSurvivor' | ...
  interface Ability { type: AbilityType; }
  ```

### 5.3 Keyword Handling Inconsistency
- **File:** `ListManagerContext.tsx` line 62
- **Problem:** Keywords can be `string | { keyword: string }` - forcing runtime type checks.
- **Suggestion:** Normalize keywords to consistent type on data load.

---

## 6. State Management & Prop Drilling

### 6.1 UnitDetailsView Prop Drilling
- **Files:** UnitDetailsView.tsx → OverviewTab, WargearTab, LeadersTab, EnhancementsTab
- **Problem:** All tab components receive `unit` and `list` props, then pass to children.
- **Suggestion:** Create `UnitDetailsContext`.

### 6.2 Combat Resolver Prop Drilling
- **File:** AttackResolver.tsx
- **Problem:** Creating new AttackerData/DefenderData objects on every render.
- **Suggestion:** Use React Context for combat state.

### 6.3 Callbacks Without useCallback
- **Problem:** Parent components may not memoize callbacks, causing child re-renders.
- **Suggestion:** Add `React.memo()` to children and verify parents use `useCallback`.

---

## 7. Code Quality Issues

### 7.1 Magic Strings
- **Examples:**
  - `"SUPREME COMMANDER"` in `getWarlordEligibility()`
  - `"CHARACTER"` keyword checks
  - `"codex"` in supplement filtering
- **Suggestion:** Create `/src/app/constants/gameTerms.ts`:
  ```tsx
  export const GameKeywords = {
    CHARACTER: "CHARACTER",
    SUPREME_COMMANDER: "SUPREME COMMANDER",
  } as const;
  ```

### 7.2 Naming Convention Inconsistency
- **Problem:** Mix of `get*`, `use*`, and `calculate*` prefixes.
- **Suggestion:** Standardize - `use*` for hooks, `get*` for pure functions, `calculate*` for math.

### 7.3 Inconsistent HTML Stripping
- **Problem:** Multiple variations of regex patterns.
- **Suggestion:** Create `sanitizeDescription()`, `stripHtmlTags()`, `stripTooltips()` utilities.

---

## Summary Table

| Category | Severity | Count | Impact |
|----------|----------|-------|--------|
| Duplicated Components | High | 2 | Maintenance burden, inconsistent changes |
| Duplicated Logic | High | 6+ | Bugs in multiple places, hard to fix |
| Performance (Missing Memoization) | Medium | 5+ | Unnecessary re-renders, sluggish UI |
| File Size/Organization | High | 3 large files | Hard to navigate, understand, test |
| Type Safety Issues | High | 4+ | Runtime errors, poor DX |
| State Management | Medium | 3+ | Prop drilling, harder to refactor |
| Magic Strings | Low | 10+ | Maintainability, refactoring risk |

---

## Top 5 Recommended Refactorings (by ROI)

### 1. Extract Weapon Parsing Utilities
- **Impact:** High
- **Effort:** Medium
- **Result:** Reduces ListManagerContext by ~400 lines, makes code testable and reusable

### 2. Create Shared Bonus/Enhancement Types
- **Impact:** High
- **Effort:** Low (~30 minutes)
- **Result:** Consolidates 3 near-identical type definitions, enables shared components

### 3. Split ListManagerContext
- **Impact:** High
- **Effort:** High (~4-6 hours)
- **Result:** Creates 3-4 smaller files under 300 lines each, enables better testing

### 4. Consolidate WeaponProfileCard & WargearProfileCard
- **Impact:** High
- **Effort:** Medium (~2-3 hours)
- **Result:** Eliminates ~100 lines of duplication

### 5. Add Game Rules Engine
- **Impact:** Medium
- **Effort:** Medium (~3-4 hours)
- **Result:** Extracts ~200 lines of validation logic, improves discoverability
