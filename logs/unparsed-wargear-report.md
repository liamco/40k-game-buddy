# Unparsed Wargear Options Report

**Total Options:** 1699
**Parsed:** 1596 (93.9%)
**Unparsed:** 103 (6.1%)

---

## Summary by Root Cause

| Category | Count | Description |
|----------|-------|-------------|
| CAN_EACH_REPLACE | 15 | "can each replace" pattern not matched |
| MISC | 13 | Various edge cases requiring specific handling |
| CAN_REPLACE_WITH_N | 10 | "can replace X with N Y" pattern not matched |
| EQUIP_UP_TO_N_SIMPLE | 7 | "can be equipped with up to N X" (no "of the following") |
| CAN_EACH_BE_REPLACED | 6 | "can each be replaced" pattern not matched |
| FOR_EVERY_EQUIPPED | 5 | "For every N X in this unit" with model name |
| EQUIP_SINGLE_PERIOD | 5 | "can be equipped with 1 X." ending with period |
| CAN_REPLACE_ONE_OF | 5 | "can replace X with one of the following" |
| DOUBLE_SPACE_TYPO | 4 | Double space in "can be  replaced" |
| FOR_EACH_EQUIPPED | 4 | "For each X this model is equipped with" |
| EQUIPPED_WITH_CAN_EQUIP | 3 | "X equipped with Y can be equipped with" |
| IF_NOT_EQUIPPED | 3 | "If X is not equipped with" |
| IF_EQUIPPED_WITH | 3 | "If X is equipped with" conditional |
| CAN_EACH_EQUIP_UP_TO | 3 | "can each be equipped with up to" |
| ALL_CAN_EACH | 2 | "All X can each have" |
| IF_UNIT_CONTAINS | 2 | "If this unit contains N models" with non-standard action |
| NOT_EQUIPPED_CAN | 2 | "not equipped with X can replace" |
| MISSING_WITH_TYPO | 2 | "can be equipped 1" (missing "with") |
| CAN_EACH_EQUIP_ONE_OF | 2 | "can each be equipped with one of" |
| EQUIP_DRONE | 2 | Simple drone equipment options |
| EACH_CAN_HAVE | 1 | "Each model can have each X" |
| ANY_NUMBER_EACH_HAVE | 1 | "Any number can each have" |
| CANNOT_REPLACE_CONSTRAINT | 1 | "This weapon cannot be replaced" |
| REPLACE_WITH_LIST_NO_ONE_OF | 1 | "can be replaced with:" (no "one of") |
| EQUIP_ONE_OF_FOLLOWING | 1 | Unmatched "equip with one of the following" |

---

## Issues by Priority

### High Priority - Data Typos (8 options)

These are typos in the source data that should ideally be fixed upstream:

1. **DOUBLE_SPACE_TYPO** (4): "can be  replaced" has double space
   - Corsair Voidscarred (aeldari, drukhari)
   - Cadian Command Squad (astra-militarum, genestealer-cults)

2. **MISSING_WITH_TYPO** (2): "can be equipped 1" missing "with"
   - Catachan Command Squad (astra-militarum, genestealer-cults)

3. **REPLACED_WITH_EQUIPPED_TYPO** (2): "can be replaced with equipped"
   - Death Company Marines (space-marines)

### Medium Priority - New Patterns Needed (67 options)

These require new regex patterns to be added:

1. **CAN_EACH_REPLACE** (15): "Any number of X can each replace their Y with Z"
2. **CAN_REPLACE_WITH_N** (10): "For every N, 1 X can replace their Y with Z"
3. **CAN_EACH_BE_REPLACED** (6): "X's Y can each be replaced with"
4. **FOR_EVERY_EQUIPPED** (5): "For every N X in this unit, 1 X can be equipped"
5. **CAN_REPLACE_ONE_OF** (5): "X can replace its Y with one of the following"
6. **FOR_EACH_EQUIPPED** (4): "For each X this model is equipped with"
7. **EQUIPPED_WITH_CAN_EQUIP** (3): "X equipped with Y can be equipped with"
8. **IF_NOT_EQUIPPED** (3): "If X is not equipped with Y"
9. **IF_EQUIPPED_WITH** (3): "If X is equipped with Y, it can be equipped"
10. **CAN_EACH_EQUIP_UP_TO** (3): "can each be equipped with up to"
11. **ALL_CAN_EACH** (2): "All X can each have their Y replaced"
12. **CAN_EACH_EQUIP_ONE_OF** (2): "can each be equipped with one of"
13. **NOT_EQUIPPED_CAN** (2): "not equipped with X can replace"
14. **IF_UNIT_CONTAINS** (2): Unit size conditional with non-standard action

### Low Priority - Simple Additions (15 options)

1. **EQUIP_UP_TO_N_SIMPLE** (7): Simple "can be equipped with up to N X"
2. **EQUIP_SINGLE_PERIOD** (5): "can be equipped with 1 X." (trailing period)
3. **EQUIP_DRONE** (2): Simple drone equipment
4. **EQUIP_ONE_OF_FOLLOWING** (1): Standard pattern that somehow failed

### Constraints/Notes (2 options)

1. **CANNOT_REPLACE_CONSTRAINT** (1): "This weapon cannot be replaced" - constraint text
2. **DESIGNERS_NOTE** (in MISC): Designer's Note text

---

## Affected Units by Faction

### adeptus-mechanicus (1 unit)
- **Sicarian Ruststalkers** (1 unparsed)
  - `The Sicarian Ruststalker Princeps' transonic razor and chordclaw can be replaced with 1 transonic blades and chordclaw.`

### aeldari (2 units)
- **Corsair Voidscarred** (1 unparsed)
  - `If this unit contains 10 models, 1 Corsair Voidscarred's power sword can be  replaced with 1 fusion pistol.` [TYPO]
- **War Walkers** (1 unparsed)
  - `Each model can have each shuriken cannon it is equipped with replaced with one of the following:`

### astra-militarum (5 units)
- **Cadian Command Squad** (1 unparsed) [TYPO]
- **Catachan Command Squad** (2 unparsed) [TYPO]
- **Death Korps Of Krieg** (3 unparsed)
- **Krieg Command Squad** (1 unparsed)
- **Ratlings** (2 unparsed)

### chaos-daemons (1 unit)
- **Raptors** (1 unparsed)

### chaos-knights (1 unit)
- **Chaos Acastus Knight Porphyrion** (1 unparsed)

### chaos-space-marines (3 units)
- **Helbrute** (1 unparsed)
- **Noise Marines** (1 unparsed)
- **Raptors** (1 unparsed)

### death-guard (2 units)
- **Blightlord Terminators** (2 unparsed)
- **Helbrute** (1 unparsed)

### drukhari (6 units)
- **Corsair Voidscarred** (1 unparsed) [TYPO]
- **Hellions** (1 unparsed)
- **Ravager** (1 unparsed)
- **Scourges with Heavy Weapons** (1 unparsed)
- **Talos** (3 unparsed)
- **Wracks** (1 unparsed)

### emperor-s-children (1 unit)
- **Noise Marines** (1 unparsed)

### genestealer-cults (5 units)
- **Atalan Jackals** (2 unparsed)
- **Cadian Command Squad** (1 unparsed) [TYPO]
- **Catachan Command Squad** (2 unparsed) [TYPO]
- **Death Korps Of Krieg** (3 unparsed)
- **Krieg Command Squad** (1 unparsed)

### imperial-agents (6 units)
- **Exaction Squad** (1 unparsed)
- **Imperial Navy Breachers** (1 unparsed)
- **Inquisitorial Agents** (4 unparsed)
- **Inquisitorial Chimera** (1 unparsed)
- **Subductor Squad** (1 unparsed)
- **Vigilant Squad** (1 unparsed)

### imperial-knights (1 unit)
- **Knight Crusader** (1 unparsed)

### leagues-of-votann (1 unit)
- **Cthonian Beserks** (1 unparsed) - Designer's Note

### necrons (3 units)
- **Canoptek Wraiths** (1 unparsed)
- **Overlord** (1 unparsed)
- **Tomb Blades** (1 unparsed)

### orks (3 units)
- **Battlewagon** (2 unparsed)
- **Big'ed Bossbunka** (1 unparsed)
- **Deff Dread** (2 unparsed)

### space-marines (15 units)
- **Death Company Marines** (1 unparsed) [TYPO]
- **Deathwing Knights** (1 unparsed)
- **Deathwing Terminator Squad** (1 unparsed)
- **Eliminator Squad** (1 unparsed)
- **Fortis Kill Team** (5 unparsed)
- **Indomitor Kill Team** (2 unparsed)
- **Marshal** (1 unparsed)
- **Outrider Squad** (1 unparsed)
- **Ravenwing Black Knights** (1 unparsed)
- **Reiver Squad** (1 unparsed)
- **Spectrus Kill Team** (4 unparsed)
- **Talonstrike Kill Team** (3 unparsed)
- **Vanguard Veteran Squad With Jump Packs** (1 unparsed)
- **Wolf Guard Terminators** (1 unparsed)
- **Wulfen Dreadnought** (1 unparsed)

### t-au-empire (14 units)
- **AX-1-0 Tiger Shark** (1 unparsed)
- **Breacher Team** (1 unparsed)
- **Broadside Battlesuits** (2 unparsed)
- **Devilfish** (1 unparsed)
- **Ghostkeel Battlesuit** (1 unparsed)
- **Hammerhead Gunship** (1 unparsed)
- **Kroot Carnivores** (1 unparsed)
- **Kroot Farstalkers** (1 unparsed)
- **Pathfinder Team** (2 unparsed)
- **Piranhas** (1 unparsed)
- **Riptide Battlesuit** (1 unparsed)
- **Stealth Battlesuits** (4 unparsed)
- **Strike Team** (1 unparsed)
- **Tiger Shark** (1 unparsed)

### thousand-sons (1 unit)
- **Helbrute** (1 unparsed)

### world-eaters (1 unit)
- **Helbrute** (1 unparsed)

---

## Quick Wins

Adding these patterns would resolve the most issues:

1. **Normalize double spaces** before parsing (+6 options)
2. **Add "can each replace" targeting** (+15 options)
3. **Add "can replace X with N Y" action** (+10 options)
4. **Add simple "equip with up to N" action** (+7 options)
5. **Add "can each be replaced" action** (+6 options)

Total potential improvement: ~44 options (43% of unparsed)
