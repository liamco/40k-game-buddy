# Loadout Options Pattern Report

Generated from 1656 wargear options across all factions.

## Targeting Patterns (WHO can take the option)

These patterns determine which models in a unit are eligible for the option.


### this-model (705 options)
The single model in the unit (single-model units)

Examples:
- **Canoness**: "This model's bolt pistol can be replaced with one of the following: 1 condemnor boltgun 1 inferno pistol 1 plasma pistol..."
- **Canoness**: "This model's hallowed chainsword can be replaced with one of the following: 1 blessed blade 1 power weapon..."

### the-model-type (30 options)
The specific named model (usually sergeant/leader)

Examples:
- **Ynnari Kabalite Warriors**: "The Sybarite's close combat weapon can be replaced with 1 Sybarite weapon...."
- **Ynnari Kabalite Warriors**: "The Sybarite can be equipped with 1 phantasm grenade launcher...."

### 1-model-specific (187 options)
Exactly 1 specific model type can take this option

Examples:
- **Battle Sisters Squad**: "1 Battle Sister's boltgun can be replaced with one of the following: 1 artificer-crafted storm bolter 1 meltagun 1 Ministorum flamer..."
- **Battle Sisters Squad**: "1 Battle Sister's boltgun can be replaced with one of the following: 1 artificer-crafted storm bolter 1 heavy bolter 1 meltagun 1 Ministorum flamer 1 ..."

### all-models (19 options)
Applies to every model in the unit equally

Examples:
- **Einhyr Hearthguard**: "All models in this unit can each have their EtaCarn plasma gun replaced with 1 volkanite disintegrator...."
- **Einhyr Hearthguard**: "All models in this unit can each have their concussion gauntlet replaced with 1 plasma blade gauntlet...."

### any-number (172 options)
Any number of eligible models can take this option

Examples:
- **Penitent Engines**: "Any number of models can each have their twin penitent buzz-blades replaced with one of the following: 1 penitent buzz-blade and 1 penitent flail 1 tw..."
- **Mortifiers**: "Any number of models can each have their 2 heavy bolters replaced with one of the following: 1 heavy bolter and 1 Mortifier flamer 2 Mortifier flamers..."

### for-every-N (122 options)
Ratio-based: for every N models, 1 can take option

Examples:
- **Serberys Sulphurhounds**: "For every 3 models in this unit, 1 Serberys Sulphurhound's 2 phosphor pistols can be replaced with 1 phosphor blast carbine and 1 phosphor pistol...."
- **Dire Avengers**: "For every 5 models in this unit, it can have 1 Aspect Shrine token...."

### for-every-N-up-to-M (43 options)
Ratio-based with cap: N models unlocks up to M can take option

Examples:
- **Seraphim Squad**: "For every 5 models in the unit, up to 2 Seraphim can each have their 2 bolt pistols replaced with one of the following: 2 inferno pistols 2 Ministorum..."
- **Cadian Shock Troops**: "For every 10 models in this unit, up to 2 Shock Troopers can each have their lasgun replaced with one of the following*: 1 flamer 1 grenade launcher 1..."

### up-to-N (29 options)
Fixed cap: up to N models can take this option

Examples:
- **Dominion Squad**: "Up to 4 Dominions can each have their boltgun replaced with one of the following: 1 artificer-crafted storm bolter 1 meltagun 1 Ministorum flamer..."
- **Sisters Novitiate Squad**: "Up to 2 Sisters Novitiate can each have their autogun replaced with 1 Ministorum flamer...."

### each-model-type (6 options)
Each model of a specific type

Examples:
- **Retributor Squad**: "Each Retributor's heavy bolter can be replaced with one of the following: 1 Ministorum heavy flamer 1 multi-melta..."
- **War Walkers**: "Each model can have each shuriken cannon it is equipped with replaced with one of the following: 1 missile launcher 1 bright lance 1 scatter laser 1 s..."

### if-equipped (5 options)
Conditional: only if model has specific equipment

Examples:
- **Canoness**: "If this model is equipped with a hallowed chainsword, it can be equipped with one of the following: 1 brazier of holy fire 1 null rod..."
- **Canoness**: "If this model is equipped with a plasma pistol and a power weapon, it can be equipped with: 1 rod of office..."

### other (338 options)
Examples:
- **Battle Sisters Squad**: "The Sister Superior's boltgun can be replaced with one of the following: 1 bolt pistol 1 combi-weapon 1 condemnor boltgun 1 inferno pistol 1 Ministoru..."
- **Battle Sisters Squad**: "The Sister Superior can be equipped with one of the following: 1 chainsword 1 power weapon..."


## Action Patterns (WHAT the option does)

These patterns determine what happens when the option is taken.


### replace-X-with-choice (289 options)
Replace weapon X with a choice from a list

Examples:
- **Canoness**: "This model's bolt pistol can be replaced with one of the following: 1 condemnor boltgun 1 inferno pistol 1 plasma pistol..."
- **Canoness**: "This model's hallowed chainsword can be replaced with one of the following: 1 blessed blade 1 power weapon..."

### replace-X-with-single (437 options)
Replace weapon X with exactly 1 specific weapon

Examples:
- **Exorcist**: "This model's Exorcist missile launcher can be replaced with 1 Exorcist conflagration rockets...."
- **Ministorum Priest**: "This model's zealot's vindictor can be replaced with 1 holy pistol and 1 power weapon...."

### replace-X-with-package (39 options)
Replace weapon X with multiple weapons (package deal)

Examples:
- **Sanctifiers**: "1 Sanctifier model can have its 1 Sanctifier melee weapon replaced with 1 Ministorum hand flamer and 1 close combat weapon...."
- **Sanctifiers**: "1 Sanctifier model can have its 1 Sanctifier melee weapon replaced with 1 close combat weapon and 1 simulacrum imperialis...."

### replace-X-and-Y-with-Z (3 options)
Replace multiple weapons (X and Y) with single weapon Z

Examples:
- **Tactical Squad**: "The Tactical Sergeant's bolt pistol and boltgun can be replaced with 1 twin lightning claws, or two different weapons from the following list:* 1 Asta..."
- **Captain In Gravis Armour**: "This model's master-crafted heavy bolt rifle and master-crafted power weapon can be replaced with: 1 boltstorm gauntlet, 1 power fist and 1 relic chai..."

### equip-with-choice (147 options)
Add one weapon from a choice list (no replacement)

Examples:
- **Canoness**: "If this model is equipped with a hallowed chainsword, it can be equipped with one of the following: 1 brazier of holy fire 1 null rod..."
- **Battle Sisters Squad**: "The Sister Superior can be equipped with one of the following: 1 chainsword 1 power weapon..."

### equip-with-single (284 options)
Add exactly 1 specific weapon (no replacement)

Examples:
- **Battle Sisters Squad**: "1 Battle Sister equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model's boltgun cannot be replaced)...."
- **Dominion Squad**: "1 Dominion equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model's boltgun cannot be replaced)...."

### equip-with-up-to (24 options)
Add up to N weapons from a list

Examples:
- **Wraithlord**: "This model can be equipped with up to two of the following: 1 missile launcher 1 bright lance 1 scatter laser 1 shuriken cannon 1 starcannon..."
- **Wraithknight**: "This model can be equipped with up to two of the following: 1 scatter laser 1 shuriken cannon 1 starcannon..."

### other (433 options)
Examples:
- **Penitent Engines**: "Any number of models can each have their twin penitent buzz-blades replaced with one of the following: 1 penitent buzz-blade and 1 penitent flail 1 tw..."
- **Canoness**: "If this model is equipped with a plasma pistol and a power weapon, it can be equipped with: 1 rod of office..."


## Special Constraints

Additional rules that modify how options work.


### has-restriction (32 options)
Examples:
- **Battle Sisters Squad**: "1 Battle Sister equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model's boltgun cannot be replaced)...."
- **Dominion Squad**: "1 Dominion equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model's boltgun cannot be replaced)...."

### no-duplicates (8 options)
Examples:
- **Nemesis Dreadknight**: "This model can be equipped with up to two of the following, but cannot take duplicates: 1 gatling psilencer 1 heavy incinerator 1 heavy psycannon..."
- **Grand Master In Nemesis Dreadknight**: "This model can be equipped with up to two of the following, but cannot take duplicates: 1 gatling psilencer 1 heavy incinerator 1 heavy psycannon 1 su..."

### two-different (2 options)
Examples:
- **Tactical Squad**: "The Tactical Sergeant's bolt pistol and boltgun can be replaced with 1 twin lightning claws, or two different weapons from the following list:* 1 Asta..."
- **Devastator Squad**: "The Devastator Sergeant's bolt pistol and boltgun can be replaced with two different weapons from the following list:* 1 Astartes chain sword 1 bolt p..."

### allow-duplicates (10 options)
Examples:
- **Commander In Coldstar Battlesuit**: "This model can be equipped with up to two of the following, and can take duplicates: 1 gun drone 1 marker drone 1 shield drone..."
- **Commander In Coldstar Battlesuit**: "This model can be equipped with up to three of the following, and can take duplicates: 1 airbursting fragmentation projector* 1 battlesuit support sys..."


## Summary Statistics

| Category | Pattern | Count |
|----------|---------|-------|
| **Targeting** | | |
| | this-model | 705 |
| | the-model-type | 30 |
| | 1-model-specific | 187 |
| | all-models | 19 |
| | any-number | 172 |
| | for-every-N | 122 |
| | for-every-N-up-to-M | 43 |
| | up-to-N | 29 |
| | each-model-type | 6 |
| | if-equipped | 5 |
| | other | 338 |
| **Action** | | |
| | replace-X-with-choice | 289 |
| | replace-X-with-single | 437 |
| | replace-X-with-package | 39 |
| | replace-X-and-Y-with-Z | 3 |
| | equip-with-choice | 147 |
| | equip-with-single | 284 |
| | equip-with-up-to | 24 |
| | other | 433 |
| **Special** | | |
| | has-restriction | 32 |
| | no-duplicates | 8 |
| | two-different | 2 |
| | allow-duplicates | 10 |
