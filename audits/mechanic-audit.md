# Mechanic Audit Report

Generated: 2026-01-07T10:29:00.680Z

## Summary

Total entries analyzed: 1704

### Category Breakdown

- **leader Interactions**: 5 entries
- **range Based Effects**: 166 entries
- **hit Wound Modifiers**: 390 entries
- **weapon Ability Grants**: 46 entries
- **movement Deployment**: 76 entries
- **conditional Effects**: 377 entries
- **rerolls**: 58 entries
- **battleshock Leadership**: 35 entries
- **defensive Abilities**: 61 entries
- **limited Use**: 68 entries
- **stratagem Related**: 9 entries
- **unit Restoration**: 7 entries
- **aura Effects**: 12 entries
- **other**: 394 entries

---

## Leader Interactions (5 entries)

### Pattern: leaderGrantsAbility

**Total entries**: 2

**Unique entries**: 1

1. **Tempormortis** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002707.json, datasheets/000004179.json
   - Description: While this model is leading a unit, that unit has the Fights First ability.

---

### Pattern: rangeBasedBonus, battleshock, leadershipModifier, ocModifier, aura

**Total entries**: 1

**Unique entries**: 1

1. **Primarch of the XIII (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, add 1 to the Objective Control characteristic of models in that unit and you can re-roll Battle-shock and Leadership tests taken for that unit.

---

### Pattern: leaderGrantsAbility, precision

**Total entries**: 1

**Unique entries**: 1

1. **Grand Master of the Deathwing** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000219.json
   - Description: While this model is leading a unit, each time a model in that unit makes an attack, if a Critical Hit is scored, that attack has the [PRECISION] ability.

---

### Pattern: leaderGrantsAbility, leaderGrantsKeyword, hitBonus, woundBonus

**Total entries**: 1

**Unique entries**: 1

1. **Oathbound** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000297.json
   - Description: While this model is leading a unit, each time a model in that unit makes a melee attack, add 1 to the Hit roll. If that attack targets a unit that has this model’s Slayer’s Oath keyword (see above), add 1 to the Wound roll as well.

---

## Range Based Effects (166 entries)

### Pattern: rangeBasedBonus, ifDestroyed, ifWounded, ifInRange

**Total entries**: 104

**Unique entries**: 1

1. **Deadly Demise** (Unit Ability)
   - Count: 104 occurrence(s)
   - Sources: datasheets/000000065.json, datasheets/000000066.json, datasheets/000000067.json, datasheets/000000072.json, datasheets/000000084.json, ... and 99 more
   - Description: From detonating ammo stores to corrosive innards or frenzied death throes, some targets are deadly even in defeat. Some models have ‘Deadly Demise x’ listed in their abilities. When such a model is destroyed , roll one D6 before removing it from play (if such a model is a TRANSPORT , roll before any embarked models disembark ). On a 6, each unit within 6" of that model suffers a number of mortal wounds denoted by ‘x’ (if this is a random number, roll separately for each unit within 6"). Example: A TRANSPORT model with the Deadly Demise D3 ability is destroyed. Before any models disembark and before removing it from play, its controlling player rolls one D6, getting a 6. There are three units within 6" of that destroyed model, so its controlling player rolls one D3 for each of them, inflicting mortal wounds accordingly. Deadly Demise x: When this model is destroyed, roll one D6. On a 6, each unit within 6" suffers ‘x’ mortal wounds.

---

### Pattern: rangeBasedAbility, scout, ifInRange, aura

**Total entries**: 13

**Unique entries**: 1

1. **Scouts** (Unit Ability)
   - Count: 13 occurrence(s)
   - Sources: datasheets/000000137.json, datasheets/000000310.json, datasheets/000001154.json, datasheets/000001156.json, datasheets/000001159.json, ... and 8 more
   - Description: Scouts form the vanguard of many armies. Unnoticed by the enemy, they range ahead of the main force. Some units have ‘Scouts x"’ listed in their abilities. If every model in a unit has this ability, then at the start of the first battle round, before the first turn begins, it can make a Normal move of up to x", with the exception that, while making that move, the distance moved by each model in that unit can be greater than that model's Move characteristic, as long as it is not greater than x". DEDICATED TRANSPORT models can make use of any Scouts x" ability listed in their abilities, or a Scouts x" ability that a unit that starts the battle embarked within that DEDICATED TRANSPORT model has (provided only models with this ability are embarked within that DEDICATED TRANSPORT model), regardless of how that embarked unit gained this ability (e.g. listed in their abilities, conferred by an Enhancement or by an attached CHARACTER , etc.). A unit that moves using this ability must end that move more than 9" horizontally away from all enemy models. If both players have units that can do this, the player who is taking the first turn moves their units first. Example: A unit has the Scouts 6" ability. At the start of the first battle round, the controlling player can make a Normal move with that unit of up to 6". Scouts x": Unit can make a Normal move of up to x" before the first turn begins. If embarked in a DEDICATED TRANSPORT , that DEDICATED TRANSPORT can make this move instead. Must end this move more than 9" horizontally away from all enemy models.

---

### Pattern: rangeBasedAbility, aura

**Total entries**: 8

**Unique entries**: 6

1. **Techmarine** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000140.json, datasheets/000001527.json
   - Description: While this model is within 3" of one or more friendly ADEPTUS ASTARTES VEHICLE units, this model has the Lone Operative ability.

2. **Iron Priest** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000306.json, datasheets/000000308.json
   - Description: While this model is within 3" of one or more friendly ADEPTUS ASTARTES VEHICLE units, this model has the Lone Operative ability.

3. **Iron Father** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000127.json
   - Description: While this model is within 3" of one or more friendly ADEPTUS ASTARTES VEHICLE units, it has the Lone Operative ability.

4. **Ultramarines Bodyguard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: While this model is within 3" of one or more friendly ADEPTUS ASTARTES INFANTRY units, this model has the Lone Operative ability.

5. **Talonmaster** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001423.json
   - Description: While this model is within 3" of one or more other friendly ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES FLY VEHICLE units, this model has the Lone Operative ability.

6. **Dark Angels Bodyguard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: While this model is within 3" of one or more friendly ADEPTUS ASTARTES INFANTRY units, this model has the Lone Operative ability.

---

### Pattern: rangeBasedBonus, rangeBasedAbility, hitBonus, commandPhase, oncePerTurn

**Total entries**: 3

**Unique entries**: 2

1. **Blessing of the Omnissiah** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000308.json, datasheets/000001527.json
   - Description: In your Command phase, you can select one friendly ADEPTUS ASTARTES VEHICLE model within 3" of this model. That model regains up to D3 lost wounds and, until the start of your next Command phase, each time that VEHICLE model makes an attack, add 1 to the Hit roll. Each model can only be selected for this ability once per turn.

2. **Blessing of the Omnissiah** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000140.json
   - Description: In your Command phase, you can select one friendly ADEPTUS ASTARTES VEHICLE model within 3" of this model. That model regains up to D3 lost wounds and, until the start of your next Command phase, each time that Vehicle model makes an attack, add 1 to the Hit roll. Each model can only be selected for this ability once per turn.

---

### Pattern: rangeBasedAbility, feelNoPain, aura

**Total entries**: 3

**Unique entries**: 2

1. **Unbreakable Duty** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000148.json, datasheets/000002775.json
   - Description: While this model is within range of an objective marker and/or within 6" of the centre of the battlefield, this model has the Feel No Pain 4+ ability.

2. **Unbreakable Duty** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001182.json
   - Description: While this model is within range of an objective marker and/or within 6" of the centre of the battlefield, this model has the Feel No Pain 4+ ability

---

### Pattern: rangeBasedAbility, shootingPhase, ifInRange, oncePerTurn

**Total entries**: 3

**Unique entries**: 3

1. **Combat Support** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001156.json
   - Description: Once per turn, in your opponent’s Shooting phase, when a friendly ADEPTUS ASTARTES PHOBOS INFANTRY unit within 6" of this model is selected as the target of an attack, one model from your army with this ability can use it. If it does, after that enemy unit has finished making its attacks, that model can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit [and only if it is an eligible target).

2. **Outrider Escort** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001158.json
   - Description: Once per turn, in your opponent’s Shooting phase, when another friendly ADEPTUS ASTARTES MOUNTED unit within 6" of this model is selected as the target of an attack, one model from your army with this ability can use it. If it does, after that enemy unit has finished making its attacks, that model can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target).

3. **Outrider Escort** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002076.json
   - Description: Once per turn, in your opponent’s Shooting phase, when a friendly ADEPTUS ASTARTES MOUNTED unit within 6" of this unit is selected as the target of an attack, this unit can use this ability. If it does, after that enemy unit has finished making its attacks, this unit can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target).

---

### Pattern: rangeBasedBonus, woundBonus, ifInRange

**Total entries**: 2

**Unique entries**: 2

1. **Isolate and Destroy** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001168.json
   - Description: Each time this model makes an attack that targets an enemy unit, if there are no other units from your opponent’s army within 6" of that target, add 1 to the Wound roll.

2. **Deadly Stalkers** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004182.json
   - Description: Each time a model in this unit makes an attack that targets an enemy unit, if there are no other units from your opponent’s army within 6" of that target, add 1 to the Wound roll.

---

### Pattern: rangeBasedBonus, woundBonus, shootingPhase, fightPhase, ifInRange

**Total entries**: 2

**Unique entries**: 1

1. **CRUCIBLE OF BATTLE** (Stratagem (Firestorm Assault Force))
   - Count: 2 occurrence(s)
   - Sources: faction.json, faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack that targets the closest eligible target within 6", add 1 to the Wound roll.

---

### Pattern: rangeBasedAbility, lethalHits, commandPhase

**Total entries**: 2

**Unique entries**: 2

1. **Target Augury Web** (Enhancement (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: TECHMARINE model only. In your Command phase, select one ADEPTUS ASTARTES VEHICLE model within 6" of the bearer. Until the start of your next Command phase, weapons equipped by that VEHICLE model have the [LETHAL HITS] ability.

2. **Wolf Master** (Enhancement (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. In your Command phase, select one friendly SPACE WOLVES unit within 9" of the bearer. Until the start of your next Command phase, teeth and claws and Tyrnak and Fenrir weapons equipped by models in that unit have the [LETHAL HITS] ability.

---

### Pattern: rangeBasedBonus, hitBonus

**Total entries**: 2

**Unique entries**: 2

1. **Masters of Shadow** (Detachment Ability (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a ranged attack targets an ADEPTUS ASTARTES unit from your army, unless the attacking model is within 12", subtract 1 from the Hit roll and the target has the Benefit of Cover against that attack.

2. **Shadow Masters** (Detachment Ability (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a ranged attack targets an ADEPTUS ASTARTES unit from your army, unless the attacking model is within 12", subtract 1 from the Hit roll and the target has the Benefit of Cover against that attack.

---

### Pattern: rangeBasedAbility

**Total entries**: 1

**Unique entries**: 1

1. **Catechism of Fire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000094.json
   - Description: Each time this model’s unit is selected to shoot, you can select one enemy unit within 12" of and visible to this model. Until the end of the phase, ranged weapons equipped by models in this model’s unit have the [DEVASTATING WOUNDS] ability when targeting that enemy unit.

---

### Pattern: rangeBasedBonus, rangeBasedAbility, hitBonus, commandPhase

**Total entries**: 1

**Unique entries**: 1

1. **Master of the Forge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000127.json
   - Description: In your Command phase, select one friendly ADEPTUS ASTARTES VEHICLE model within 3" of this model. That model regains up to 3 lost wounds and, until the start of your next Command phase, each time that VEHICLE model makes an attack, add 1 to the Hit roll. You cannot select a unit for this ability that has already been selected for the Blessing of the Omnissiah ability this phase, and vice versa.

---

### Pattern: rangeBasedBonus, fightPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Feared Interrogator** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000225.json
   - Description: At the start of the Fight phase, each enemy CHARACTER unit within 6" of this model must take a Battle-shock test, subtracting 1 from that test when they do. In addition, each time this model destroys an enemy CHARACTER model with a melee attack, you gain 1CP.

---

### Pattern: rangeBasedBonus, rangeBasedAbility, commandPhase, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Gift of the Iron Wolf** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000306.json
   - Description: In your Command phase, you can select one friendly ADEPTUS ASTARTES VEHICLE model within 3" of this model. That model regains up to D3 lost wounds and, until the start of your next Command phase, select one ranged weapon equipped by that model to have the [RAPID FIRE 1] ability. Each model can only be selected for this ability or the Blessing of the Omnissiah ability once per turn.

---

### Pattern: rangeBasedBonus, fightPhase, ifDestroyed

**Total entries**: 1

**Unique entries**: 1

1. **Murder-maker (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000314.json
   - Description: In the Fight phase, each time an attack targets a friendly WULFEN unit within 6" of this model, if a model in that unit is destroyed as a result of that attack, if that model has not fought this phase, roll one D6: on a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.

---

### Pattern: rangeBasedBonus, hitBonus, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Skyfire Protocols** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002258.json
   - Description: Each time you target this model with the Overwatch Stratagem just after an enemy unit that can Fly starts or ends a Normal, Advance or Fall Back move, when resolving that Stratagem, in addition to shooting that enemy unit, you can select up to three additional enemy units within 24" of this model that can FLY ; this model can also shoot at each of those units with its Icarus stormcannons (provided each one is an eligible target), but when doing so, an unmodified Hit roll of 6 is required to score a hit.

---

### Pattern: rangeBasedBonus, hitBonus, shootingPhase, ifInRange, battleshock, psychic

**Total entries**: 1

**Unique entries**: 1

1. **Morkai’s Howl** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002806.json
   - Description: In your Shooting phase, you can select one enemy unit within 12" of this unit (if a Lieutenant in Reiver Armour is leading this unit, you can select one enemy unit within 18" instead). That unit must take a Battle-shock test, subtracting 1 from the result if it is a PSYKER unit. If that test is failed, in addition to being Battle-shocked, that unit is Stunned until the start of your next Shooting phase. While a unit is Stunned, each time a model in that unit makes a Psychic Attack, subtract 1 from the Hit roll.

---

### Pattern: rangeBasedBonus, commandPhase, fightPhase, ifDestroyed, ifInRange, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **TERRIFYING PROFICIENCY** (Stratagem (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that made a Charge move this turn and destroyed one or more enemy units this phase. EFFECT: In your opponent’s next Command phase, each enemy unit within 6" of your unit must take a Battle-shock test. If the unit taking that test is Below Half-strength, subtract 1 from that test. Enemy units affected by this Stratagem do not need to take any other Battle-shock tests in the same phase.

---

### Pattern: rangeBasedBonus, hitBonus, shootingPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Osseus Key** (Enhancement (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WATCH MASTER or TECHMARINE model only. At the start of your opponent’s Shooting phase, select one enemy VEHICLE unit (excluding TITANIC units) within 12" of and visible to the bearer. That unit must take a Leadership test . If that test is passed, until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll ; if that test is failed, that unit is not eligible to shoot this phase.

---

### Pattern: rangeBasedAbility, sustainedHits, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Drive Home the Blade** (Detachment Ability (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES unit from your army is selected to shoot, if one or more models from that unit are within 1" of an open Hatchway and every model in that unit is on the same side of that Hatchway, select one enemy unit on the opposite side of that Hatchway from your unit. Until the end of the phase, ranged weapons equipped by models in your unit have the [sustained hits 1] ability while targeting that enemy unit.

---

### Pattern: rangeBasedBonus, commandPhase, ifInRange, strengthModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **CHILLING HOWL** (Stratagem (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Command phase. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army. EFFECT: Each enemy unit within 6" of your unit must take a Battle-shock test, subtracting 1 from that test if that unit is Below Half-strength.

---

### Pattern: rangeBasedBonus, strengthModifier

**Total entries**: 1

**Unique entries**: 1

1. **Close-range Eradication** (Detachment Ability (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Ranged weapons equipped by ADEPTUS ASTARTES models from your army have the [ASSAULT] ability, and each time an attack made with such a weapon targets a unit within 12", add 1 to the Strength characteristic of that attack.

---

### Pattern: rangeBasedBonus, hitBonus, shootingPhase, ifDestroyed, ifInRange, attacksModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **ONSLAUGHT OF FIRE** (Stratagem (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that disembarked from a TRANSPORT this turn and has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a ranged attack that targets the closest eligible target within 12", add 1 to the Hit roll. If one or more enemy models are destroyed as the result of any of those attacks, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.

---

### Pattern: rangeBasedBonus, strengthModifier, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Vulkan’s Quest** (Detachment Ability (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Ranged weapons equipped by ADEPTUS ASTARTES models from your army have the [ASSAULT] ability, and each time an attack made with such a weapon targets a unit within 12", add 1 to the Strength characteristic of that attack. SEEKER’S COMPANIONS If your army includes VULKAN HE’STAN , during your turn, each INFERNUS SQUAD unit from your army is eligible to do one of the following: Start to perform an Action in a turn in which it Advanced . Shoot in a turn in which it started to perform an Action. RESTRICTIONS Your army can include SALAMANDERS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: rangeBasedBonus, hitBonus, woundBonus, rerollHit, rerollWound, rerollAll, strengthModifier, apModifier, psychic

**Total entries**: 1

**Unique entries**: 1

1. **Psychic Disciplines** (Detachment Ability (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of the battle round, select one of the following Psychic Disciplines. Until the end of the battle round, that Psychic Discipline is active and its effects apply to all ADEPTUS ASTARTES PSYKER units from your army. Biomancy Discipline Add 2" to the Move characteristic of models in this unit. Divination Discipline Each time a model in this unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. Pyromancy Discipline Each time a ranged attack made by a model in this unit targets an enemy unit within 12", improve the Armour Penetration characteristic of that attack by 1. Telekinesis Discipline Each time a ranged attack targets this unit, subtract 1 from the Strength characteristic of that attack. Telepathy Discipline Each time a model in this unit makes an attack, you can ignore any or all modifiers to that attack’s Weapon Skill or Ballistic Skill characteristics and/or any or all modifiers to the Hit roll.

---

### Pattern: rangeBasedBonus, commandPhase, ifInRange, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **SENSORY ASSAULT** (Stratagem (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Command phase. TARGET: One ADEPTUS ASTARTES PSYKER unit from your army. EFFECT: Select one enemy unit that is within 18" of and visible to one PSYKER model in your unit. Until the start of your next turn, that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit’s Move characteristic and subtract 2 from Charge rolls made for it. In addition, if the Telepathy Discipline is active for your army, that enemy unit must take a Battle-shock test, subtracting 1 from the result.

---

### Pattern: rangeBasedBonus, woundBonus, shootingPhase, ifWounded, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **ASSAIL** (Stratagem (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES PSYKER unit from your army that is eligible to shoot. EFFECT: Select one enemy unit within 18" of and visible to one or more PSYKER models in your unit (excluding units with the Lone Operative ability), and roll six D6, adding 1 to each result if the Telekinesis Discipline is active for your army: for each 4+, that enemy unit suffers 1 mortal wound.

---

### Pattern: rangeBasedBonus, fightPhase, ifInRange, strengthModifier, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **IRON ARM** (Stratagem (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that is within 18" of one or more ADEPTUS ASTARTES PSYKER models from your army and has not been selected to Fight this phase. EFFECT: Until the end of the phase, add 1 to the Strength characteristic of melee weapons equipped by models in your unit, or add 2 if the Biomancy Discipline is active for your army.

---

### Pattern: rangeBasedBonus, rangeBasedAbility, hitBonus, fightPhase, ifInRange, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **FIERY SHIELD** (Stratagem (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that is within 18" of one or more friendly ADEPTUS ASTARTES PSYKER models, and that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll, and if the Pyromancy Discipline is active for your army, weapons that target your unit have the [HAZARDOUS] ability.

---

### Pattern: rangeBasedBonus, woundBonus, shootingPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **ILLUMINATING FIRE** (Stratagem (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase, just after a RAVENWING unit from your army has selected its targets. TARGET: That RAVENWING unit. EFFECT: Select one enemy unit within 12" of your unit that was selected as the target of one or more of the attacking unit’s attacks. Until the end of the phase, each time a friendly DEATHWING unit makes an attack that targets that enemy unit, add 1 to the Wound roll.

---

### Pattern: rangeBasedBonus, strengthModifier, apModifier, aura

**Total entries**: 1

**Unique entries**: 1

1. **Sanguinary Tear (Aura)** (Enhancement (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While a friendly DEATH COMPANY unit is within 6" of the bearer, add 1 to the Strength characteristic of weapons equipped by models in that unit.

---

### Pattern: rangeBasedAbility, movementPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **THUNDEROUS PURSUIT** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES unit from your army that is within 9" of that enemy unit and not within Engagement Range of one or more enemy units. EFFECT: Your unit can make a Normal move of up to D6". If your unit has the SPACE WOLVES INFANTRY or THUNDERWOLF CAVALRY keywords, it can make a Normal move of up to 6" instead.

---

### Pattern: rangeBasedBonus, fightPhase, ifInRange, strengthModifier, apModifier, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **Hordeslayer** (Enhancement (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. At the start of the Fight phase, if there are more enemy models than friendly models wholly within 6" of the bearer, until the end of the phase, add 2 to the Attacks characteristic of melee weapons equipped by the bearer. If the bearer’s unit has achieved one or more Boasts , add 3 to the Attacks characteristic instead.

---

### Pattern: rangeBasedAbility, fightPhase, ifInRange, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **LOST TO RAGE** (Stratagem (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One DEATH COMPANY unit from your army that is below Starting Strength and has not been selected to fight this phase. EFFECT: Until the end of the phase, improve the Attacks, Stength and Armour Penetration characteristics of melee weapons equipped by models in your unit by 1 and, unless your unit is within 12" of one or more friendly CHAPLAIN models, until the end of the phase, those weapons have the [HAZARDOUS] ability.

---

## Hit Wound Modifiers (390 entries)

### Pattern: woundBonus, commandPhase, rerollHit, rerollWound, rerollAll

**Total entries**: 275

**Unique entries**: 1

1. **Oath of Moment** (Unit Ability)
   - Count: 275 occurrence(s)
   - Sources: datasheets/000000060.json, datasheets/000000061.json, datasheets/000000063.json, datasheets/000000064.json, datasheets/000000065.json, ... and 270 more
   - Description: If your Army Faction is ADEPTUS ASTARTES , at the start of your Command phase, select one unit from your opponent’s army. Until the start of your next Command phase, that enemy unit is your Oath of Moment target. Each time a model with this ability makes an attack that targets your Oath of Moment target: You can re-roll the Hit roll. If you are using a Codex: Space Marines Detachment and your army does not include one or more units with the BLACK TEMPLARS , BLOOD ANGELS , DARK ANGELS , DEATHWATCH or SPACE WOLVES keywords, add 1 to the Wound roll as well.

---

### Pattern: woundBonus, precision, commandPhase, ifInRange, ifOnObjective, rerollWound, rerollAll, aura

**Total entries**: 19

**Unique entries**: 1

1. **Templar Vows** (Unit Ability)
   - Count: 19 occurrence(s)
   - Sources: datasheets/000002786.json, datasheets/000002787.json, datasheets/000002788.json, datasheets/000002789.json, datasheets/000002790.json, ... and 14 more
   - Description: If your Army Faction is ADEPTUS ASTARTES , at the start of the first battle round, select one of the following Vows to be active for ADEPTUS ASTARTES units from your army. While a Vow is active for a unit from your army, that unit has the associated ability shown below. Abhor the Witch, Destroy the Witch Each time this unit declares a charge , if one or more targets of that charge have the PSYKER keyword, you can re-roll the Charge roll . Melee weapons equipped by models in this unit have the [PRECISION] ability while targeting PSYKER units. Accept Any Challenge, No Matter the Odds Each time a model in this unit makes a melee attack, if the Strength characteristic of that attack is less than or equal to the Toughness characteristic of the target, add 1 to the Wound roll . Suffer Not the Unclean to Live This unit is eligible to declare a charge in a turn in which it Fell Back , and each time a model in this unit makes a Pile-in or Consolidation move , it does not need to end that move closer to the closest enemy model, provided it ends that move as close as possible to the closest enemy unit. Uphold the Honour of the Emperor If this unit has the INFANTRY keyword: At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase. If the mission you are playing features Actions, this unit is eligible to start to perform an Action in a turn in which it Advanced .

---

### Pattern: hitBonus

**Total entries**: 18

**Unique entries**: 16

1. **Interceptor** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000084.json, datasheets/000002729.json
   - Description: Each time this model makes a ranged attack that targets a unit that can Fly, add 1 to the Hit roll.

2. **Strafing Run** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001190.json, datasheets/000001609.json
   - Description: Each time this model makes a ranged attack that targets a unit that cannot Fly, add 1 to the Hit roll.

3. **Ferocious Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000092.json
   - Description: Each time this model makes a ranged attack that targets the closest eligible MONSTER or VEHICLE unit, add 1 to the Hit roll.

4. **Fury of the First** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000104.json
   - Description: Each time a model in this unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill or Weapon Skill characteristic and/or to the Hit roll. In addition, each time a model in this unit makes an attack that targets the enemy unit you selected for the Oath of Moment ability this turn, add 1 to the Hit roll.

5. **Warden of the Imperium Nihilus** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000151.json
   - Description: While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit and each time a model in that unit makes an attack, add 1 to the Hit roll.

6. **Angelic Visage** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000165.json
   - Description: Each time a melee attack targets this unit, subtract 1 from the Hit roll.

7. **Pelt of the Doppegangrel** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000304.json
   - Description: While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll.

8. **Chosen Companions** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000315.json
   - Description: While a CHARACTER model is leading this unit, each time a model in this unit makes an attack, add 1 to the Hit roll.

9. **Voice of Experience** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001162.json
   - Description: While this model is leading a unit, improve the Objective Control characteristic of models in that unit by 1 and each time a model in that unit makes an attack, add 1 to the Hit roll.

10. **Fury of the First** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001183.json
   - Description: Each time a model in this unit makes an attack that targets your Oath of Moment target , add 1 to the Hit roll.

11. **Ferocious Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001825.json
   - Description: Each time this model makes an attack with its twin las-talon that targets the closest eligible MONSTER or VEHICLE unit, add 1 to the Hit roll.

12. **Executioner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002722.json
   - Description: Each time this model makes an attack that targets a unit that is Below Half-strength, add 1 to the Hit roll.

13. **Priority Target Acquisition** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002788.json
   - Description: Each time this model makes an attack with its twin las-talon that targets the closest eligible MONSTER or VEHICLE unit, add 1 to the Hit roll.

14. **Braziers of Judgement** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003698.json
   - Description: While a CHARACTER model is leading this unit, each time an attack targets this unit, subtract 1 from the Hit roll.

15. **Enmity for the Unworthy** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003698.json
   - Description: Each time a model in this unit makes an attack that targets a CHARACTER unit, add 1 to the Hit roll.

16. **Vengeful Onslaught** (Enhancement (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATH COMPANY model only. It the bearer is destroyed , until the end of your next turn, each time a friendly DEATH COMPANY model makes an attack, add 1 to the 1 Hit roll .

---

### Pattern: woundBonus

**Total entries**: 18

**Unique entries**: 13

1. **Litany of Hate** (Unit Ability)
   - Count: 6 occurrence(s)
   - Sources: datasheets/000000094.json, datasheets/000000112.json, datasheets/000000115.json, datasheets/000001174.json, datasheets/000004129.json, ... and 1 more
   - Description: While this model is leading a unit, each time a model in that unit makes a melee attack, add 1 to the Wound roll.

2. **Honour Guard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000095.json
   - Description: While a CAPTAIN or CHAPTER MASTER model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll.

3. **Heirs of Azkaellon** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000165.json
   - Description: While a CHARACTER model is leading this unit, each time a melee attack targets this unit, subtract 1 from the Wound roll.

4. **Legendary Tenacity** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000302.json
   - Description: Each time an attack targets this model, if the Strength characteristic of that attack is greater than this model’s Toughness characteristic, subtract 1 from the Wound roll.

5. **Rugged Resilience** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000318.json
   - Description: Each time an attack targets this unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of this unit, subtract 1 from the Wound roll.

6. **Thunderstrike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001610.json
   - Description: Each time this model has shot, select one enemy MONSTER or VEHICLE unit that was hit by one or more attacks made by this model this phase. Until the end of the phase, each time a friendly ADEPTUS ASTARTES unit makes a ranged attack that targets that enemy unit, add 1 to the Wound roll.

7. **Icon of Obstinacy** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002105.json
   - Description: Each time an attack targets this model’s unit, if the Strength characteristic of that attack is greater than or equal to the Toughness characteristic of that unit, subtract 1 from the Wound roll.

8. **The Emperor’s Shield** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: Each time an attack is allocated to this model, if the Strength characteristic of that attack is greater than the Toughness characteristic of this model, subtract 1 from the Wound roll.

9. **Command Squad** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002772.json
   - Description: While a CHARACTER model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll.

10. **Ultramarines Honour Guard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004185.json
   - Description: While a CAPTAIN or CHAPTER MASTER model is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll.

11. **Shield of the Imperium** (Detachment Ability (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Ranged weapons equipped by ADEPTUS ASTARTES models from your army have the [HEAVY] ability. If such a weapon already has this ability, each time an attack is made with that weapon, if the attacking model’s unit Remained Stationary this turn, add 1 to the Wound roll .

12. **Malodraxian Standard** (Enhancement (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES ANCIENT model only. Each time an attack targets the bearer’s unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of the bearer’s unit, subtract 1 from the Wound roll .

13. **Dutiful Tenacity** (Detachment Ability (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an attack targets an ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army, if the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll .

---

### Pattern: hitBonus, ifInRange

**Total entries**: 8

**Unique entries**: 1

1. **Stealth** (Unit Ability)
   - Count: 8 occurrence(s)
   - Sources: datasheets/000000076.json, datasheets/000000358.json, datasheets/000001162.json, datasheets/000001523.json, datasheets/000001668.json, ... and 3 more
   - Description: Some warriors are masters of disguise and concealment. If every model in a unit has this ability, then each time a ranged attack is made against it, subtract 1 from that attack’s Hit roll .

---

### Pattern: hitBonus, shootingPhase

**Total entries**: 5

**Unique entries**: 5

1. **Suppression Fire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000068.json
   - Description: In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks made with an accelerator autocannon. Until the start of your next turn, while this unit is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.

2. **Multi-spectrum Array** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001159.json
   - Description: In your Shooting phase, after this unit has shot, select one enemy unit that was hit by one or more attacks made by this unit this phase. Until the end of the phase, each time a friendly ADEPTUS ASTARTES unit makes an attack that targets that enemy unit, add 1 to the Hit roll.

3. **Suppression Fire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002700.json
   - Description: In your Shooting phase, after this model has shot, select one enemy unit hit by one or more attacks made with its twin macro-accelerator cannon this phase. Until the start of your next turn, while this model is on the battlefield, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.

4. **HIGH-SPEED FOCUS** (Stratagem (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One RAVENWING unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.

5. **RECITATION OF THE REVERED** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ANCIENT unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.

---

### Pattern: hitBonus, woundBonus

**Total entries**: 4

**Unique entries**: 4

1. **Lightning-fast Manoeuvres** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000239.json
   - Description: Each time a ranged attack targets this model, subtract 1 from the Hit roll. If that attack was made by a model that can Fly, subtract 1 from the Wound roll as well.

2. **Vanquish the Foe** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002468.json
   - Description: Each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll.

3. **Siege-breaker Protocols** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002706.json
   - Description: Each time this model makes a melee attack that targets a VEHICLE or FORTIFICATION unit, add 1 to the Hit roll and add 1 to the Wound roll.

4. **Close In for the Kill** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002805.json
   - Description: Each time this model makes an attack that targets an enemy unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll.

---

### Pattern: hitBonus, woundBonus, strengthModifier

**Total entries**: 4

**Unique entries**: 4

1. **Refuse to Accept Defeat** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000286.json
   - Description: While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength.

2. **Keep the Banner High** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002677.json
   - Description: While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength.

3. **To the Last** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002713.json
   - Description: While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength, and add 1 to the Wound roll as well if that unit is Below Half-strength.

4. **Fortis Doctrines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002780.json
   - Description: Each time a model in this unit makes an attack that targets a unit that is below its Starting Strength, add 1 to the Hit roll. If that attack targets a unit that is Below Half-strength, add 1 to the Hit roll and add 1 to the Wound roll instead.

---

### Pattern: woundBonus, ifDestroyed, ifWounded

**Total entries**: 3

**Unique entries**: 2

1. **Death Vision of Sanguinius** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000003832.json, datasheets/000003833.json
   - Description: If this model is destroyed by a melee attack, after the attacking unit has finished making its attacks, you can roll one D6, adding 2 to the result if the attacking unit contains the enemy WARLORD : on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6+, that enemy unit suffers D3+3 mortal wounds.

2. **Death Vision of Sanguinius** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000153.json
   - Description: If this model is destroyed by a melee attack, after the attacking unit has finished making its attacks, you can roll one D6, adding 2 to the result if the attacking unit contains the enemy WARLORD : on a 2-3, that enemy unit suffers 3 mortal wounds; on a 4-5, that enemy unit suffers D3+3 mortal wounds; on a 6+, that enemy unit suffers D6+3 mortal wounds.

---

### Pattern: hitBonus, woundBonus, shootingPhase, fightPhase, strengthModifier

**Total entries**: 3

**Unique entries**: 3

1. **HEROES OF THE CHAPTER** (Stratagem (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Hit roll. If your unit is Below Half-strength, add 1 to the Wound roll as well.

2. **FURY OF THE FIRST** (Stratagem (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Hit roll. If your unit is below its Starting Strength, add 1 to the Wound roll as well.

3. **RUTHLESS BUTCHERY** (Stratagem (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES DREADNOUGHT , TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Hit roll. If your unit is below Starting Strength, add 1 to the Wound roll as well.

---

### Pattern: woundBonus, fightPhase, strengthModifier, apModifier, attacksModifier, oncePerBattle

**Total entries**: 2

**Unique entries**: 1

1. **Finest Hour** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000073.json, datasheets/000003831.json
   - Description: Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [DEVASTATING WOUNDS] ability.

---

### Pattern: woundBonus, fightPhase

**Total entries**: 2

**Unique entries**: 2

1. **High Marshal** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002794.json
   - Description: At the start of the Fight phase, select one enemy unit within Engagement Range of this model’s unit and roll one D6, adding 1 to the result for every five models in this model’s unit: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6+, that enemy unit suffers D3+3 mortal wounds.

2. **UNBRIDLED FEROCITY** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One SPACE WOLVES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Wound roll.

---

### Pattern: woundBonus, shootingPhase, fightPhase

**Total entries**: 2

**Unique entries**: 2

1. **TACTICAL FORESIGHT** (Stratagem (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greater than or equal to the Toughness characteristic of that unit, subtract 1 from the Wound roll.

2. **TALON STRIKE** (Stratagem (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One RAVENWING MOUNTED unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack that targets an INFANTRY CHARACTER or MOUNTED CHARACTER unit, add 1 to the Wound roll.

---

### Pattern: woundBonus, shootingPhase

**Total entries**: 2

**Unique entries**: 2

1. **UNMATCHED FORTITUDE** (Stratagem (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One DEATHWING INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, if the Strength characteristic of that attack is greater than your unit’s Toughness characteristic, subtract 1 from the Wound roll.

2. **EYE OF THE PACK** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, you can add 1 to the Wound roll.

---

### Pattern: hitBonus, woundBonus, shootingPhase

**Total entries**: 2

**Unique entries**: 2

1. **EVASIVE MANOEUVRES** (Stratagem (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES FLY VEHICLE unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll and subtract 1 from the Wound roll.

2. **RIDE HARD, RIDE FAST** (Stratagem (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES FLY VEHICLE unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll and subtract 1 from the Wound roll.

---

### Pattern: hitBonus, ifInRange, apModifier, battleshock, aura

**Total entries**: 1

**Unique entries**: 1

1. **Fortification** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000097.json
   - Description: While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army: That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll. Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle-shocked, except for those that will move over enemy models when doing so.

---

### Pattern: woundBonus, ifWounded

**Total entries**: 1

**Unique entries**: 1

1. **Wrathful Rampage** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000167.json
   - Description: Each time this model is selected to fight, you can select one enemy unit within Engagement Range of it and roll one D6, adding 2 to the result if this model made a Charge move this turn: on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6+, that enemy unit suffers 3 mortal wounds.

---

### Pattern: woundBonus, feelNoPain, invulnerableSave, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **The Lion Helm** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000218.json
   - Description: Models in the bearer’s unit have a 4+ invulnerable save. In addition, once per battle, in any phase, the bearer can summon a Watcher in the Dark. When it does, until the end of the phase, models in the bearer’s unit have the Feel No Pain 4+ ability against mortal wounds.

---

### Pattern: hitBonus, commandPhase

**Total entries**: 1

**Unique entries**: 1

1. **Deathwing** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000230.json
   - Description: Each time a model in this unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill or Weapon Skill characteristics and/or to the Hit roll. In addition, each time a model in this unit makes an attack that targets the enemy unit you selected at the start of your Command phase for the Oath of Moment ability, add 1 to the Hit roll.

---

### Pattern: hitBonus, rerollHit

**Total entries**: 1

**Unique entries**: 1

1. **Headstrong** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000324.json
   - Description: You can re-roll Charge rolls made for this unit. Each time this unit makes a Charge move, until the end of the turn, each time a model in this unit makes a melee attack, add 1 to the Hit roll.

---

### Pattern: hitBonus, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Master of Prescience (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001611.json
   - Description: While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll. In addition, once per battle round, you can target that unit with one of the following Stratagems for OCP: Counter-offensive; Fire Overwatch; Go to Ground; Heroic Intervention

---

### Pattern: hitBonus, blast, ignoresCover, shootingPhase

**Total entries**: 1

**Unique entries**: 1

1. **Target Sighted** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002711.json
   - Description: At the start of your Shooting phase, select one enemy unit that is visible to this model. Until the end of the phase, each time a friendly Adeptus Astartes model makes an attack with a Blast weapon that targets that enemy unit, add 1 to the Hit roll and that attack has the [IGNORES COVER] ability.

---

### Pattern: woundBonus, ifInRange, apModifier, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Sigismund’s Heir** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002795.json
   - Description: Each time this model’s unit declares a charge, if one or more targets of that charge have the CHARACTER keyword, add 2 to the Charge roll. Once per battle, when this model’s unit is selected to fight, if that unit is within Engagement Range of one or more enemy CHARACTER units, this model can use this ability. If it does, until the end of the phase, melee weapons equipped by this model have the [DEVASTATING WOUNDS] ability.

---

### Pattern: hitBonus, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **Hammer Blow** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004132.json
   - Description: In the Fight phase, after this unit has fought, select one enemy MONSTER or VEHICLE unit hit by one or more of those attacks. Until the end of the next turn, that enemy unit is suppressed. While a unit is suppressed, each time a model in that unit makes an attack, subtract 1 from the Hit roll.

---

### Pattern: hitBonus, apModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Shock and Awe** (Detachment Ability (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES unit from your army declares a charge , if it disembarked from a TRANSPORT this turn, after selecting the targets of that charge, select one of those targets; that enemy unit must take a Battle-shock test . Each time a model in an ADEPTUS ASTARTES unit from your army makes a melee attack, if it disembarked from a TRANSPORT this turn, add 1 to the Hit roll . RESTRICTIONS Your army can include BLACK TEMPLARS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: woundBonus, movementPhase, ifInRange, ifOnObjective, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Vowed Target** (Detachment Ability (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of your Movement phase, select one of the following: Defensive Footing: Select one objective marker you control. Until the start of your next Movement phase, that objective marker is your Vowed objective marker. Aggressive Push: Select one or more objective markers you do not control. Until the start of your next Movement phase, each of those objective markers is one of your Vowed objective markers. If a rule refers to a unit or model being within range of your Vowed objective marker, that rule takes effect if that unit or model is within range of one or more of your Vowed objective markers. Each time a DEATHWING INFANTRY unit from your army makes an attack that targets a unit within range of one or more of your Vowed objective markers, add 1 to the Wound roll . RESTRICTIONS Your army can include DARK ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

---

### Pattern: woundBonus, chargePhase, ifWounded, ifInRange, ifOnObjective

**Total entries**: 1

**Unique entries**: 1

1. **WRATH OF THE LION** (Stratagem (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Charge phase. TARGET: One DEATHWING INFANTRY unit from your army that just ended a Charge move. EFFECT: Select one enemy unit within Engagement Range of your unit and roll one D6 for each model in your unit, adding 1 to the result if that enemy unit is within range of your Vowed objective marker: for each 4+, that enemy unit suffers 1 mortal wound (to a maximum of 3 mortal wounds).

---

### Pattern: hitBonus, commandPhase, ifOnObjective

**Total entries**: 1

**Unique entries**: 1

1. **ANCIENT FURY** (Stratagem (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES WALKER model from your army. EFFECT: Until the start of your next Command phase, improve your model’s Move, Toughness, Leadership and Objective Control characteristics by 1 and each time your model makes an attack, add 1 to the Hit roll.

---

### Pattern: hitBonus, woundBonus, fightPhase, ifInRange, strengthModifier

**Total entries**: 1

**Unique entries**: 1

1. **STRENGTH IN UNITY** (Stratagem (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: If that enemy unit is within Engagement Range of one or more RAVENWING units from your army, until the end of the phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll. If that enemy unit is within Engagement Range of one or more DEATHWING units from your army, until the end of the phase, each time a model in that enemy unit makes an attack, if the Strength characteristic of that attack is greater than the Toughness characteristic of the target, subtract 1 from the Wound roll. RESTRICTIONS: A unit cannot be targeted by this and the Armour of Contempt Stratagem in the same phase.

---

### Pattern: hitBonus, sustainedHits, lethalHits, commandPhase, rerollHit, apModifier, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Master of Wolves** (Detachment Ability (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of your Command phase, you can select one of the Hunting Packs listed below. Until the start of your next Command phase, that Hunting Pack is active and its effects apply to all ADEPTUS ASTARTES units from your army. You can only select each Hunting Pack once per battle. Encircling Jaws: This unit can re-roll Advance rolls and Charge rolls . Hunter’s Eye: Each time a model in this unit makes a ranged attack, add 1 to the Hit roll . Ferocious Strike: Each time this unit is selected to fight, select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in this unit have the selected ability.

---

### Pattern: hitBonus, woundBonus, ifDestroyed, ifInRange, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **Pack’s Quarry** (Detachment Ability (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a model in a SPACE WOLVES unit from your army makes a melee attack that targets an enemy unit, if that enemy unit is within Engagement Range of one or more other ADEPTUS ASTARTES units from your army, or if the attacking unit contains more models than that enemy unit: Add 1 to the Hit roll . If your Saga is completed (see below), add 1 to the Wound roll as well. Saga of the Hunter At the start of the first battle round, your Quarry tally is 0. Each time an ADEPTUS ASTARTES unit from your army fights, after all of those attacks have been resolved, add 1 to your Quarry tally for each enemy unit destroyed by those attacks. Once your Quarry tally is equal to or greater than the number shown in the table below (depending on the battle size), your Saga is completed. BATTLE SIZE QUARRY TALLY Incursion 2 Strike Force 3 Onslaught 4

---

### Pattern: hitBonus, fightPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **OVERWHELMING ONSLAUGHT** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: Two ADEPTUS ASTARTES units from your army within Engagement Range of that enemy unit, or one SPACE WOLVES BEASTS unit from your army within Engagement Range of that enemy unit. EFFECT: Until the end of the phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll.

---

### Pattern: hitBonus, woundBonus, strengthModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Stubborn Tenacity** (Enhancement (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, each time a model in that unit makes an attack, add 1 to the Hit roll if that unit is below its Starting Strength , and add 1 to the Wound roll as well if that unit is Battle-shocked and below its Starting Strength.

---

### Pattern: woundBonus, chargePhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **UNBREAKABLE LINES** (Stratagem (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase, just after an enemy unit ends a Charge move. TARGET: One ADEPTUS ASTARTES unit from your army within Engagement Range of that enemy unit. EFFECT: Until the end of the turn, each time an attack targets your unit, subtract 1 from the Wound roll.

---

### Pattern: hitBonus, lethalHits, shootingPhase, fightPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **UNFORGIVEN FURY** (Stratagem (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, weapons equipped by models in your unit have the [LETHAL HITS] ability. In addition, if one or more ADEPTUS ASTARTES units from your army are currently Battle-shocked, until the end of the phase, each time a model in your unit makes an attack, a successful unmodified Hit roll of 5+ scores a Critical Hit.

---

### Pattern: woundBonus, ifInRange, ifOnObjective, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Purge and Sanctify** (Detachment Ability (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an attack targets an ANCIENT unit from your army, if that unit is within range of one or more objective markers and the Strength characteristic of that attack is greater than the Toughness characteristic of that unit, subtract 1 from the Wound roll . Each time a CRUSADER SQUAD unit from your army makes a Righteous Zeal move, that unit can end that move as close as possible to the closest objective marker instead of as close as possible to the closest enemy unit. RESTRICTIONS Your army can include BLACK TEMPLARS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: hitBonus, shootingPhase, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **RECLAIM OUR HONOUR!** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit destroys an ANCIENT model from your army that has not been targeted with the Refusal to Yield Stratagem this phase. TARGET: One ADEPTUS ASTARTES unit from your army visible to that enemy unit. EFFECT: Until the end of the battle, each time an ADEPTUS ASTARTES model from your army makes an attack that targets that enemy unit, add 1 to the Hit roll. RESTRICTIONS: You cannot target that ANCIENT model with the Refusal to Yield Stratagem this phase.

---

### Pattern: hitBonus, commandPhase, ifInRange, ifOnObjective, ocModifier

**Total entries**: 1

**Unique entries**: 1

1. **LION’S WILL** (Stratagem (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Command phase. TARGET: One ADEPTUS ASTARTES unit from your army that is within Engagement Range of one or more enemy units. EFFECT: Until the start of your next Command phase, add 1 to the Objective Control characteristic of models in your unit. In addition, until the end of the turn, if your unit does not have the DEATHWING , RAVENWING or VEHICLE keyword, each time a model in your unit makes an attack, add 1 to the Hit roll.

---

## Weapon Ability Grants (46 entries)

### Pattern: sustainedHits, lethalHits, precision, commandPhase, oncePerBattle

**Total entries**: 11

**Unique entries**: 1

1. **Mission Tactics** (Unit Ability)
   - Count: 11 occurrence(s)
   - Sources: datasheets/000000358.json, datasheets/000002779.json, datasheets/000002780.json, datasheets/000002781.json, datasheets/000002783.json, ... and 6 more
   - Description: At the start of your Command phase, you can select one of the Mission Tactics listed below. Until the start of your next Command phase, that Mission Tactic is active and its effects apply to all units from your army with this ability. Each Mission Tactic can only be selected once per battle. FUROR TACTICS When the enemy horde grows close, the Deathwatch will be tasked with the decimation of their core. Aiming not for clinical kills but for maximum destruction over a wide area, they tear the heart from the enemy army. While this Mission Tactic is active, weapons equipped by ADEPTUS ASTARTES units from your army have the [SUSTAINED HITS 1] ability. MALLEUS TACTICS When the giants of war lumber forth, the Deathwatch will adopt Malleus tactics. Even the largest behemoth has a weak point, and the archives of the Deathwatch number them all. While this Mission Tactic is active, weapons equipped by ADEPTUS ASTARTES units from your army have the [LETHAL HITS] ability. PURGATUS TACTICS By adopting Purgatus tactics, the Deathwatch focus their deadly ire upon the commanders of the enemy host, assassinating them one after another with pitiless head shots and killing thrusts of the blade. While this Mission Tactic is active, each time an ADEPTUS ASTARTES unit from your army makes an attack, if a Critical Hit is scored, that attack has the [PRECISION] ability.

---

### Pattern: sustainedHits

**Total entries**: 6

**Unique entries**: 5

1. **An Honourable Death in Combat** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001997.json, datasheets/000003836.json
   - Description: Each time a model in this unit makes an attack, that attack has the [SUSTAINED HITS 1] ability if this unit is below its Starting Strength, or the [SUSTAINED HITS 2] ability if this unit is Below Half-strength.

2. **Rotating Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000123.json
   - Description: This model’s Punisher rotary cannon has the [SUSTAINED HITS 1] ability when targeting INFANTRY units.

3. **Rotating Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001667.json
   - Description: This model’s twin heavy onslaught gatling cannon has the [SUSTAINED HITS 2] ability when targeting INFANTRY units.

4. **Reaping Tally** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002789.json
   - Description: This model’s twin heavy onslaught gatling cannon has the [SUSTAINED HITS 2] ability while targeting INFANTRY units.

5. **Angel’s Fang** (Enhancement (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time the bearer makes a melee attack that targets a CHARACTER , MONSTER or VEHICLE unit, that attack has the [SUSTAINED HITS 2] ability.

---

### Pattern: precision, fightPhase

**Total entries**: 4

**Unique entries**: 4

1. **FOR THE EMPEROR'S HONOUR!** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.

2. **LAY LOW THE TYRANTS** (Stratagem (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.

3. **SURGICAL STRIKES** (Stratagem (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.

4. **CASTIGATE THE DEMAGOGUES** (Stratagem (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [PRECISION] ability.

---

### Pattern: lethalHits, fightPhase

**Total entries**: 3

**Unique entries**: 3

1. **FOCUSED FURY** (Stratagem (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability. If your unit is a CHARACTER unit, until the end of the phase, those weapons have the [LANCE] ability as well.

2. **INSPIRING PRESENCE** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES CHARACTER unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability.

3. **SPEAR THRUST AND SABRE SWING** (Stratagem (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Select either the [LANCE] or [LETHAL HITS] ability. Until the end of the phase, melee weapons equipped by models in your unit have the selected ability. If it is a MOUNTED unit, until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] and [LETHAL HITS] abilities instead.

---

### Pattern: sustainedHits, shootingPhase, ifInRange

**Total entries**: 3

**Unique entries**: 3

1. **STRIKE NOW FOR GLORY** (Stratagem (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability.

2. **BATTLE DRILL RECALL** (Stratagem (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability. If your unit Remained Stationary this turn, then until the end of the phase, each time a model in your unit makes a ranged attack, a successful unmodified Hit roll of 5+ scores a Critical Hit.

3. **BLITZING FUSILLADE** (Stratagem (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] ability. If such a weapon already has this ability, until the end of the phase, that weapon has the [SUSTAINED HITS 1] ability as well.

---

### Pattern: sustainedHits, lethalHits

**Total entries**: 2

**Unique entries**: 2

1. **Chainsword Doctrines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000061.json
   - Description: Each time this unit is selected to fight, select one of the following abilities to apply to all Astartes chainswords equipped by models in this unit until the end of the phase: [SUSTAINED HITS 1] [LETHAL HITS] [LANCE]

2. **Cold and Calculating** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004166.json
   - Description: Each time a model in this model’s unit makes an attack that targets a MONSTER or VEHICLE unit, that attack has the [LETHAL HITS] ability. Each time a model in this model’s unit makes an attack that targets any other unit, that attack has the [SUSTAINED HITS 1] ability.

---

### Pattern: lethalHits, shootingPhase

**Total entries**: 2

**Unique entries**: 2

1. **Powerful Volley** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000110.json
   - Description: Each time this model shoots in your Shooting phase, provided it Remained Stationary this turn, all [HEAVY] weapons equipped by models in this unit have the [LETHAL HITS] ability.

2. **Atomantic Arc-reactor** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001153.json
   - Description: Each time this unit shoots its Cerberus neutron pulse array in your Shooting phase, provided it Remained Stationary this turn, that weapon has the [LETHAL HITS] ability.

---

### Pattern: torrent, shootingPhase

**Total entries**: 2

**Unique entries**: 2

1. **IMMOLATION PROTOCOLS** (Stratagem (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, Torrent weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability.

2. **IMMOLATION PROTOCOLS** (Stratagem (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, Torrent weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability.

---

### Pattern: blast, shootingPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Incendiary Terror** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000126.json
   - Description: In your Shooting phase, after this unit has shot, you can select one enemy INFANTRY unit hit by one or more of those attacks made with a pyreblaster. That enemy unit must take a Battle-shock test, subtracting 1 from that test.

---

### Pattern: sustainedHits, lethalHits, precision

**Total entries**: 1

**Unique entries**: 1

1. **Guiding Hand** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001162.json
   - Description: While this model is leading a unit, each time that unit is selected to shoot or fight, select one of the following abilities to apply to weapons equipped by models in that unit until the end of the phase: [LETHAL HITS] [PRECISION] [SUSTAINED HITS 1]

---

### Pattern: blast, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Line-breaker** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001175.json
   - Description: When making ranged attacks, this model can target enemy units within Engagement Range of it with Blast weapons (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units.

---

### Pattern: torrent, shootingPhase, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **Forgefather** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002726.json
   - Description: In your Shooting phase, select one enemy unit within 24" of and visible to this model. Until the end of the phase, each time a friendly ADEPTUS ASTARTES model makes a ranged attack with a Torrent or Melta weapon that targets that enemy unit, you can re-roll the Wound roll.

---

### Pattern: sustainedHits, lethalHits, shootingPhase, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **PREYTAKER’S EYE** (Stratagem (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to shoot or fight this phase. EFFECT: Select either the [LETHAL HITS] or [SUSTAINED HITS 1] abilities. Until the end of the phase, weapons equipped by models in your unit have that ability.

---

### Pattern: torrent, chargePhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **BLAZING EARTH** (Stratagem (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Start of your opponent’s Charge phase. TARGET: One ADEPTUS ASTARTES unit from your army equipped with one or more Torrent weapons. EFFECT: Select one enemy unit (excluding MONSTERS and VEHICLES and units with the FLY keyword) within 12" of and visible to your unit. Until the end of the phase, each time that enemy unit declares a charge, subtract 2 from the Charge roll (this is not cumulative with any other negative modifiers to that Charge roll).

---

### Pattern: sustainedHits, lethalHits, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **COGITATED FEROCITY** (Stratagem (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Fight phase. TARGET: One ADEPTUS ASTARTES DREADNOUGHT , TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that has not been selected to fight this phase. EFFECT: Select either the [SUSTAINED HITS 1] or [LETHAL HITS] abilities. Until the end of the phase, melee weapons equipped by models in your unit have the selected ability.

---

### Pattern: sustainedHits, shootingPhase, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **MERCY IS WEAKNESS** (Stratagem (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack that targets a unit that is below its Starting Strength, that attack has the [SUSTAINED HITS 1] ability, and when making such an attack, if the attacking model is a VEHICLE , a successful unmodified Hit roll of 5+ scores a Critical Hit.

---

### Pattern: sustainedHits, fightPhase, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Rage-fuelled Warrior** (Enhancement (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, the bearers melee weapons have the [sustained hits 3] ability.

---

### Pattern: lethalHits, fightPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **RED RAMPAGE** (Stratagem (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Select either the [LANCE] or [LETHAL HITS] abilities. Until the end of the phase, melee weapons equipped by models in your unit have the selected ability. You can instead choose for your unit to give in to the Red Thirst ; if it does, then it becomes Battle-shocked (but the effects of this Stratagem still apply to it) and until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] and [LETHAL HITS] abilities.

---

### Pattern: lethalHits, ignoresCover, shootingPhase

**Total entries**: 1

**Unique entries**: 1

1. **PRESCIENT PRECISION** (Stratagem (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES PSYKER unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, that attack has the [LETHAL HITS] ability, and the [IGNORES COVER] ability as well if the Divination Discipline is active for your army.

---

### Pattern: lethalHits, ifDestroyed, ifInRange, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **Legendary Slayers** (Detachment Ability (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES model from your army makes an attack, if that attack targets a CHARACTER , MONSTER or VEHICLE unit or if your Saga is completed (see below), that attack has the [lethal hits] ability. Saga of the Beastslayer At the start of the first battle round, your Beastslayer tally is 0, and you determine your Beastslayer target by halving the number of units from your opponent’s army (including those embarked within TRANSPORTS ) that have one or more of the following keywords (rounding up): CHARACTER , MONSTER , VEHICLE . Each time an ADEPTUS ASTARTES unit from your army shoots or fights, after all of those attacks have been resolved, add 1 to your Beastslayer tally for each enemy unit with one or more of the following keywords destroyed by those attacks: CHARACTER , MONSTER , VEHICLE . Once your Beastslayer tally is equal to or greater than your Beastslayer target, your Saga is completed.

---

### Pattern: lethalHits, precision, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **MARTIAL EXEMPLARS** (Stratagem (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES JUMP PACK unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] and [PRECISION] abilities.

---

## Movement Deployment (76 entries)

### Pattern: deepStrike, movementPhase

**Total entries**: 64

**Unique entries**: 6

1. **Deep Strike** (Unit Ability)
   - Count: 59 occurrence(s)
   - Sources: datasheets/000000064.json, datasheets/000000068.json, datasheets/000000079.json, datasheets/000000083.json, datasheets/000000087.json, ... and 54 more
   - Description: Some units make their way to battle via tunnelling, teleportation, high-altitude descent or other extraordinary means that allow them to appear suddenly in the thick of the fighting. During the Declare Battle Formations step, if every model in a unit has this ability, you can set it up in Reserves instead of setting it up on the battlefield. If you do, in the Reinforcements step of one of your Movement phases you can set up this unit anywhere on the battlefield that is more than 9" horizontally away from all enemy models. If a unit with the Deep Strike ability arrives from Strategic Reserves, the controlling player can choose for that unit to be set up either using the rules for Strategic Reserves or using the Deep Strike ability. Unit can be set up in Reserves instead of on the battlefield. Unit can be set up in your Reinforcements step, more than 9" horizontally away from all enemy models.

2. **Meteoric Descent** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000125.json
   - Description: In your Movement phase, when this unit is set up on the battlefield using the Deep Strike ability, it can perform a meteoric descent. If it does, this unit can be set up anywhere on the battlefield that is more than 6" horizontally away from all enemy units, but until the end of the turn, it is not eligible to declare a charge.

3. **RELIC TELEPORTARIUM** (Stratagem (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One DEATHWING unit from your army that is arriving using the Deep Strike ability this phase. EFFECT: Your unit can be set up anywhere on the battlefield that is more than 6" horizontally away from all enemy models. RESTRICTIONS: Until the end of the turn, your unit is not eligible to declare a charge.

4. **FOCUSING SHRINE** (Stratagem (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, at the start of the Reinforcements step. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army that is in Reserves. EFFECT: Until the end of the phase, when setting up your unit on the battlefield using its Deep Strike ability, you can set it up unit anywhere on the battlefield that is more than 6" horizontally away from all enemy models (measure this distance as you would normally for the Deep Strike ability, ignoring Walls and closed Hatchways). RESTRICTIONS: Until the end of the turn, your unit is not eligible to declare a charge.

5. **Upon Wings of Fire** (Detachment Ability (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the end of your opponent s turn, you can select a number of ADEPTUS ASTARTES JUMP PACK units from your army (excluding units that are within Engagement Range of one or more enemy units). The maximum number of units you can select depends on the battle size, as follows: BATTLE SIZE UNITS Incursion Up to 1 units Strike Force Up to 2 units Onslaught Up to 3 units Once you have made your selections, remove those units from the battlefield and place them into Strategic Reserves. In the Reinforcements step of your next Movement phase, set each of those units up using their Deep Strike ability. RESTRICTIONS Your army can include BLOOD ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

6. **DESCENT OF ANGELS** (Stratagem (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES JUMP PACK unit from your army that is arriving using the Deep Strike ability this phase. EFFECT: Your unit can be set up anywhere on the battlefield that is more than 6" horizontally away from all enemy units. RESTRICTIONS: A unit targeted by this Stratagem is not eligible to declare a charge in the same turn.

---

### Pattern: deepStrike

**Total entries**: 2

**Unique entries**: 2

1. **Master of the Fleet** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000121.json
   - Description: During the Declare Battle Formations step, if your army includes this model, select one PHOBOS , GRAVIS or TACTICUS ADEPTUS ASTARTES INFANTRY unit from your army. That unit gains the Deep Strike ability.

2. **Reiver Grav-chute** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002718.json
   - Description: The bearer has the Deep Strike ability.

---

### Pattern: deepStrike, movementPhase, fightPhase, ifInRange

**Total entries**: 2

**Unique entries**: 2

1. **ORBITAL TELEPORTARIUM** (Stratagem (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves. It will arrive back on the battlefield in the Reinforcements step of your next Movement phase using the Deep Strike ability. RESTRICTIONS: You cannot select a unit that is within Engagement Range of one or more enemy units.

2. **SITE-TO-SITE TELEPORTATION** (Stratagem (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: Up to two KILL TEAM units from your army, or one other ADEPTUS ASTARTES INFANTRY unit from your army, if those units are not within Engagement Range of one or more enemy units. EFFECT: Remove those units from the battlefield and place them into Strategic Reserves. Until the end of your next Movement phase, models in those units that do not have the Deep Strike ability have the Deep Strike ability.

---

### Pattern: scout, infiltrators

**Total entries**: 1

**Unique entries**: 1

1. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002779.json
   - Description: If a CHARACTER from your army with the Leader ability can be attached to an INFILTRATOR SQUAD , it can be attached to this unit instead. If this unit has a Leader unit attached to it during the Declare Battle Formations step, that Leader unit gains the Infiltrators and Scouts 6" abilities.

---

### Pattern: scout

**Total entries**: 1

**Unique entries**: 1

1. **Cerebrex Logic Engine** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004166.json
   - Description: At the start of the Declare Battle Formations step, you can select one ADEPTUS ASTARTES INFANTRY unit from your army. Until the end of the battle, that unit gains the Scouts 6" ability. After both players have deployed their armies, you can select one ADEPTUS ASTARTES unit from your army and redeploy it. When doing so, you can set that unit up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.

---

### Pattern: scout, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Herald of Sacred Slaughter** (Enhancement (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. In the Declare Battle Formations step, if the bearer starts the battle embarked within a DEDICATED TRANSPORT , that DEDICATED TRANSPORT has the Scouts 9" ability.

---

### Pattern: scout, movementPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **RAPTORIAL VIGILANCE** (Stratagem (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that is within 9" of the enemy unit that just ended that move. You cannot target a unit that is within Engagement Range of one or more enemy units. EFFECT: Your unit can make a Normal move of up to D6", or up to 6" instead if it is a PHOBOS or SCOUT SQUAD unit.

---

### Pattern: scout, fightPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **INTO DARKNESS** (Stratagem (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: Up to two PHOBOS and/or SCOUT SQUAD units from your army, or one other ADEPTUS ASTARTES INFANTRY unit from your army. You cannot target a unit that is within Engagement Range of one or more enemy units. EFFECT: Remove those units from the battlefield and place them into Strategic Reserves.

---

### Pattern: scout, movementPhase

**Total entries**: 1

**Unique entries**: 1

1. **FEINT AND THRUST** (Stratagem (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back. If it is a PHOBOS or SCOUT SQUAD unit, it is also eligible to shoot and declare a charge in a turn in which it Advanced.

---

### Pattern: scout, chargePhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **CALCULATED FEINT** (Stratagem (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase, just after an enemy unit declares a charge. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that was selected as a target of that charge. EFFECT: Your unit can make a Normal move of up to D6", or up to 6" instead if it is a PHOBOS or SCOUT SQUAD unit. RESTRICTIONS: You cannot select a unit that is within Engagement Range of one or more enemy units.

---

### Pattern: scout, fightPhase

**Total entries**: 1

**Unique entries**: 1

1. **GUERRILLA TACTICS** (Stratagem (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: Up to two PHOBOS and/or SCOUT SQUAD units from your army, or one other ADEPTUS ASTARTES INFANTRY unit from your army. EFFECT: Remove those units from the battlefield and place them into Strategic Reserves. RESTRICTIONS: Each unit selected for this Stratagem must be more than 3" away from all enemy models.

---

## Conditional Effects (377 entries)

### Pattern: ifDestroyed

**Total entries**: 117

**Unique entries**: 15

1. **Leader** (Unit Ability)
   - Count: 103 occurrence(s)
   - Sources: datasheets/000000060.json, datasheets/000000063.json, datasheets/000000073.json, datasheets/000000079.json, datasheets/000000081.json, ... and 98 more
   - Description: Mighty heroes fight at the forefront of battle. Some CHARACTER units have ‘Leader’ listed on their datasheets. Such CHARACTER units are known as Leaders, and the units they can lead – known as their Bodyguard units – are listed on their datasheet. During the Declare Battle Formations step, for each Leader in your army, if your army also includes one or more of that Leader’s Bodyguard units, you can select one of those Bodyguard units. That Leader will then attach to that Bodyguard unit for the duration of the battle and is said to be leading that unit. Each Bodyguard unit can only have one Leader attached to it. While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed , it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack sucessfully wounds an Attached unit, that attack cannot be allocated to a CHARACTER model in that unit, even if that CHARACTER model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to CHARACTER models in that unit. Each time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit is no longer part of an Attached unit. It becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. Each time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit’s Bodyguard unit is no longer part of an Attached unit. It becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. Each time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed. Example: If you only destroy the Bodyguard unit that is part of an Attached unit, you have not destroyed a CHARACTER unit. If you only destroy the CHARACTER unit that is part of an Attached unit, or if you destroy the whole Attached unit, you have destroyed one CHARACTER unit. Before the battle, CHARACTER units with the Leader ability can be attached to one of their Bodyguard units to form an Attached unit. Attached units can only contain one Leader. Attacks cannot be allocated to CHARACTER models in Attached units.

2. **Gene-seed Recovery** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000063.json
   - Description: When this model’s Bodyguard unit is destroyed, roll one D6: on a 2+, you gain 1CP.

3. **Designer’s Note** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000087.json
   - Description: The highlighted portions of this model are the only parts that are considered to make up its hull. Models can be set up or end a move on any part of this model that is not highlighted in red. If any models are on non-highlighted sections of this model when it is destroyed, place those models as close to their original position as possible, on the battlefield, after removing this model. $000003426

4. **Redeemer of the Lost** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000157.json
   - Description: While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 4+, do not remove it from play; that destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.

5. **Anvil of Endurance** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000317.json
   - Description: While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6: on a 4+, do not remove the destroyed model from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

6. **Crewed Artillery** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001164.json
   - Description: If one model in this unit is destroyed, the remaining model in this unit is also destroyed.

7. **Designer’s Note** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002098.json
   - Description: This ability is triggered even when a model in this unit is destroyed as the result of failing a Hazardous test, meaning such a model may be able to shoot twice in the same phase

8. **Intractable Will** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002296.json
   - Description: While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 4+, do not remove it from play; that destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.

9. **Inspired Retribution** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002678.json
   - Description: While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 4+, do not remove it from play; that destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.

10. **COMPANY HEROES** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002772.json
   - Description: You must attach one CAPTAIN or CHAPTER MASTER model to this unit. If this is not possible, this unit does not take part in the battle and counts as having been destroyed.

11. **Gene-seed Recovery** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002773.json
   - Description: When this model’s Bodyguard unit is destroyed, roll one D6: on a 2+, you gain 1CP

12. **Honour of the Chapter** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003838.json
   - Description: If this model is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 2+, do not remove it from play. This model can fight after the attacking unit has finished making its attacks, and is then removed from play.

13. **Heroic Last Stand** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004130.json
   - Description: If this model is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 2+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

14. **Vengeful Exhortation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004136.json
   - Description: While this model is leading a unit, each time a model in that unit is destroyed by a melee attack, if it has not fought this phase, roll one D6: on a 4+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

15. **VENGEFUL ANIMUS** (Stratagem (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase, just after an ADEPTUS ASTARTES VEHICLE model from your army with the Deadly Demise ability is destroyed. TARGET: That ADEPTUS ASTARTES VEHICLE model. You can use this Stratagem on that model even though it was just destroyed. EFFECT: Do not roll one D6 to determine whether mortal wounds are inflicted by your model’s Deadly Demise ability. Instead, mortal wounds are automatically inflicted.

---

### Pattern: ifWounded, feelNoPain

**Total entries**: 25

**Unique entries**: 1

1. **Feel No Pain** (Unit Ability)
   - Count: 25 occurrence(s)
   - Sources: datasheets/000000076.json, datasheets/000000153.json, datasheets/000000155.json, datasheets/000000164.json, datasheets/000000166.json, ... and 20 more
   - Description: Some warriors refuse to be laid low, even by what should be fatal wounds. Some models have ‘Feel No Pain x+’ listed in their abilities. Each time a model with this ability suffers damage and so would lose a wound (including wounds lost due to mortal wounds ), roll one D6: if the result is greater than or equal to the number denoted by ‘x’, that wound is ignored and is not lost. If a model has more than one Feel No Pain ability, you can only use one of those abilities each time that model suffers damage and so would lose a wound. Feel No Pain x+: Each time this model would lose a wound, roll one D6: if the result equals or exceeds ‘x’, that wound is not lost.

---

### Pattern: ifInRange

**Total entries**: 15

**Unique entries**: 10

1. **Lone Operative** (Unit Ability)
   - Count: 6 occurrence(s)
   - Sources: datasheets/000000076.json, datasheets/000000155.json, datasheets/000000156.json, datasheets/000002708.json, datasheets/000002795.json, ... and 1 more
   - Description: Assassins and other covert agents are difficult to track and pinpoint in the swirling maelstrom of battle. Unless part of an Attached unit (see Leader ), this unit can only be selected as the target of a ranged attack if the attacking model is within 12".

2. **Death-hold** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000096.json
   - Description: When making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units.

3. **Outflank** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000137.json
   - Description: When this unit arrives from Strategic Reserves, it can be set up within your opponent’s deployment zone (all other restrictions still apply).

4. **Siege Shield** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001188.json
   - Description: When making ranged attacks with its demolisher cannon, this model can target enemy units within Engagement Range of it (provided no other friendly units are also within Engagement Range of that enemy unit). In addition, when making ranged attacks, this model does not suffer the penalty to its Hit rolls for being within Engagement Range of one or more enemy units.

5. **Concealed Positions** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001523.json
   - Description: This unit can only be selected as the target of a ranged attack if the attacking model is within 12".

6. **Echo of the Ravenspire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002708.json
   - Description: At the end of your opponent’s turn, if this model’s unit is not within Engagement Range of any enemy models, you can remove it from the battlefield and place it into Strategic Reserves.

7. **Exploit Their Cowardice** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002798.json
   - Description: Each time an enemy unit within Engagement Range of this unit is selected to Fall Back, after it ends that Fall Back move, if this unit is not within Engagement Range of one or more enemy units, this unit can make a Normal move.

8. **Kill Team** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: Each time an attack targets this unit, if it contains models with different Toughness characteristics, until the attacking unit has finished making its attacks, use the Toughness characteristic of the majority of the models in that unit when determining what roll is required for that attack to successfully wound. If two or more Toughness characteristics are tied for majority, use the highest value. For the purposes of determining which models in this unit can embark within a TRANSPORT , Kill Team Terminator models, Kill Team Outrider models, Kill Team Biker models and models equipped with a jump pack each take up the space of 2 models, but can otherwise embark within any TRANSPORT their unit can embark within, even though similar models in other units have the TERMINATOR , MOUNTED or JUMP PACK keywords. For the purposes of interacting with terrain features, all models in units with this ability are considered INFANTRY models, even though similar models in other units may have the MOUNTED or JUMP PACK keywords. Designer’s Note: While the abstractions in the above rule cause some models to behave differently to similar models in other units, they are designed to minimise complicated movement, TRANSPORT and Benefit of Cover rules.

9. **Bestial Rage** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004133.json
   - Description: Each time an enemy unit is selected to shoot, after that unit has shot, if this model lost one or more wounds as a result of those attacks, this model can make a Bestial Rage move. To do so, roll one D6, adding 2 to the result: this model can be moved a number of inches up to the result, but must finish that move as close as possible to the closest enemy unit (excluding AIRCRAFT ), When doing so, this model can be moved within Engagement Range of that enemy unit. Each model can only make one Bestial Rage move per phase.

10. **Obfuscation** (Enhancement (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES PSYKER model only. Enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit, and if the Telepathy Discipline is active for your army, the bearer’s unit cannot be targeted by ranged attacks unless the attacking model is within 18".

---

### Pattern: fightPhase, ifInRange

**Total entries**: 12

**Unique entries**: 11

1. **DROPSHIP EXTRACTION** (Stratagem (Emperor’s Shield))
   - Count: 2 occurrence(s)
   - Sources: faction.json, faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army. You cannot target a unit that is within Engagement Range of one or more enemy units. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

2. **UNTO THE BURNING SKIES** (Stratagem (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One ADEPTUS ASTARTES JUMP PACK unit from your army. You cannot target a unit that is within Engagement Range of one or more enemy units, unless it is THE SANGUINOR . EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

3. **ONRUSHING STORM** (Stratagem (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army that is not within Engagement Range of one or more enemy units. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

4. **RAPID REAPPRAISAL** (Stratagem (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One RAVENWING unit from your army that is not within Engagement Range of one or more enemy units. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

5. **RAPID EMBARKATION** (Stratagem (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of the Fight phase. TARGET: One ADEPTUS ASTARTES TRANSPORT unit from your army that has no models embarked within it, and one ADEPTUS ASTARTES INFANTRY unit from your army wholly within 6" of that TRANSPORT . EFFECT: Your INFANTRY unit can embark within that TRANSPORT . RESTRICTIONS: You cannot target an INFANTRY unit that is within Engagement Range of one or more enemy units, that cannot normally embark within that TRANSPORT , or that disembarked from a TRANSPORT this turn.

6. **A CEASELESS CAUSE** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of the Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that was eligible to fight this phase. EFFECT: If your unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6". It cannot embark within a TRANSPORT at the end of this move if it disembarked from a TRANSPORT this turn.

7. **COORDINATED STRIKE** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One SPACE WOLVES unit from your army that is wholly within 9" of one or more battlefield edges and not within Engagement Range of one or more enemy units. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

8. **WITHDRAW AND REGROUP** (Stratagem (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Fight phase. TARGET: One ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES FLY VEHICLE unit from your army that is not within Engagement Range of one or more enemy units. EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.

9. **ANGEL’S SACRIFICE** (Stratagem (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Start of the Fight phase. TARGET: One ADEPTUS ASTARTES JUMP PACK unit from your army. EFFECT: Until the end of the phase, each time an enemy model within Engagement Range of your unit selects its targets, it must select your unit as the target of all of its attacks.

10. **FURIOUS ONSLAUGHT** (Stratagem (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One DEATH COMPANY unit from your army, just before that unit Piles-in. EFFECT: Until the end of the phase, each time a model in your unit makes a Pile-in move, it can move up to D3+3" instead of up to 3". If your unit is within 12" of one or more friendly CHAPLAIN models, or if it is below Starting Strength, it can move up to 6" instead. In either case, it can only do so provided your unit ends that Pile-in move in Unit Coherency and within Engagement Range of one or more enemy units.

11. **RELENTLESS MOMENTUM** (Stratagem (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase and is within Engagement Range of one or more enemy units. EFFECT: Until the end of the phase, when determining which models in your unit are eligible to fight, any models in it that are within 3" of one or more enemy models are eligible to fight. When resolving those attacks, such models can target one of those enemy units that is within 3" of them and within Engagement Range of their unit.

---

### Pattern: ocModifier

**Total entries**: 10

**Unique entries**: 7

1. **Astartes Banner** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000001165.json, datasheets/000001182.json, datasheets/000002677.json, datasheets/000002775.json
   - Description: While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit.

2. **Astartes Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000095.json
   - Description: While this unit contains an ANCIENT , add 1 to the Objective Control characteristic of models in this unit.

3. **Sanguinary Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000165.json
   - Description: Add 1 to the Objective Control characteristic of models in the bearer’s unit.

4. **Astartes Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002103.json
   - Description: While this unit contains a Company Ancient, add 1 to the Objective Control characteristic of models in this unit.

5. **Astartes Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002302.json
   - Description: While this unit contains an Ancient, add 1 to the Objective Control characteristic of its models.

6. **Astartes Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002748.json
   - Description: While this unit contains an Ravenwing Ancient, add 1 to the Objective Control characteristic of models in this unit.

7. **Astartes Banner** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002772.json
   - Description: While this unit contains an Ancient, add 1 to the Objective Control characteristic of models in this unit.

---

### Pattern: strengthModifier, apModifier, attacksModifier

**Total entries**: 9

**Unique entries**: 9

1. **The Red Grail** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000160.json
   - Description: While this model is leading a unit, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit.

2. **Battle-lust** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000285.json
   - Description: Each time this model ends a Charge move, until the end of the turn, add 2 to the Attacks characteristic of this model’s Frostfang weapon.

3. **Crusade of Wrath** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002794.json
   - Description: While this model is leading a unit, add 1 to the Attacks and Strength characteristics of melee weapons equipped by models in that unit.

4. **Pious Fervour** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002796.json
   - Description: Each time this model’s unit is selected to fight, until the end of the phase, add 1 to the Attacks characteristic of this model’s master-crafted power weapon for each enemy unit within 6" of this model (to a maximum of +3).

5. **Oath of Macragge** (Enhancement (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. While the bearer is under the effects of the Assault Doctrine , add 2 to the Attacks and Strength characteristics of the bearer’s melee weapons instead.

6. **Immolator** (Enhancement (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks characteristics of Torrent weapons equipped by models in the bearer’s unit.

7. **The Honour Vehement** (Enhancement (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. While the bearer is under the effects of the Assault Doctrine , add 2 to the Attacks and Strength characteristics of the bearers melee weapons instead.

8. **Red Thirst** (Detachment Ability (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES unit from your army is selected to fight, if that unit made a Charge move this turn, until the end of the phase, add 1 to the Attacks characteristic and add 2 to the Strength characteristic of melee weapons equipped by models in that unit. RESTRICTIONS Your army can include BLOOD ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

9. **Feral Rage** (Enhancement (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks characteristic of melee weapons equipped by the bearer. Each time the bearer ends a Charge move , until the end of the turn, add an additional 1 to the Attacks characteristic of those weapons.

---

### Pattern: movementPhase, ifInRange

**Total entries**: 9

**Unique entries**: 9

1. **PRACTICAL TACTICS** (Stratagem (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that is not within Engagement Range of one or more enemy units and is within 9" of the enemy unit that just ended that move. EFFECT: Your unit can make a Normal move of up to D6", or a Normal move of up to 6" instead if it is under the effects of the Tactical Doctrine .

2. **Clavitine Reliquary** (Enhancement (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: In your Movement phase, each time the bearer is selected to make a Normal or Advance move , if it is within 1" of a Hatchway, it can attempt to operate that Hatchway. If it does, it cannot attempt to operate a Hatchway again this turn.

3. **HERESY BEGETS RETRIBUTION** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One CHAPLAIN or JUDICIAR unit from your army that is within 9" of that enemy unit and is not within Engagement Range of one or more enemy units. EFFECT: Your unit can make a Retribution move. To do so, roll one D6: models in your unit move a number of inches up to the result, but your unit must end that move as close as possible to the closest enemy unit (excluding AIRCRAFT ). When doing so, those models can be moved within Engagement Range of that enemy unit.

4. **SQUAD TACTICS** (Stratagem (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that is within 9" of the enemy unit that just ended that move. EFFECT: Your unit can make a Normal move of up to D6", or a Normal move of up to 6" instead if it is under the effects of the Tactical Doctrine . RESTRICTIONS: You cannot select a unit that is within Engagement Range of one or more enemy units.

5. **UNCOMPROMISING EGRESS** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One LAND RAIDER model from your army that has not been selected to move this phase. EFFECT: One ADEPTUS ASTARTES unit embarked within your LAND RAIDER can disembark. When doing so, models in that unit can be set up anywhere on the battlefield wholly within 6" of your LAND RAIDER and can be set up within Engagement Range of one or more enemy units.

6. **ENHANCED EFFICIENCY** (Stratagem (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to move this phase. EFFECT: Until the end of the phase, each time your unit is selected to make a Normal or Advance move, it can attempt to operate one Hatchway it is within 1” of either at the start or end of that move. If it does, it cannot attempt to operate a Hatchway again this turn.

7. **HUNTER’S INSTINCTS** (Stratagem (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES INFANTRY unit or ADEPTUS ASTARTES MOUNTED unit from your army that is within 9" of that enemy unit. You cannot target a unit that is within Engagement Range of one or more enemy units. EFFECT: Your unit can make a Normal move of up to 6".

8. **WIND-SWIFT EVASION** (Stratagem (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Movement phase, just after an enemy unit ends a Normal, Advance or Fall Back move. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that is within 9" of that enemy unit. EFFECT: Your unit can make a Normal move of up to 6". RESTRICTIONS: You cannot select a unit that is within Engagement Range of one or more enemy units.

9. **WRATHFUL RAMPAGE** (Stratagem (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after a DEATH COMPANY unit from your army Advances. TARGET: That DEATH COMPANY unit. EFFECT: Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced. If your unit is within 12" of one or more friendly CHAPLAIN models, or it is below its Starting Strength, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.

---

### Pattern: shootingPhase, ifInRange

**Total entries**: 8

**Unique entries**: 7

1. **Fire and Redeploy** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000107.json, datasheets/000002102.json
   - Description: In your Shooting phase, each time this model has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move of up to D6". If it does, until the end of the turn, this model is not eligible to declare a charge.

2. **Strategic Dispersal** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002530.json
   - Description: In your Shooting phase, after this model’s unit has shot, if it is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6". If it does, until the end of the turn, that unit is not eligible to declare a charge.

3. **Stabilised Disembarkation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002791.json
   - Description: In your opponent’s Shooting phase, each time an enemy unit is selected to shoot, after that unit has shot, if any of those attacks targeted this TRANSPORT , it can use this ability. If it does, any units embarked within it can disembark. When doing so, models in those units can be set up anywhere on the battlefield wholly within 6" of this TRANSPORT and not within Engagement Range of one or more enemy units.

4. **IN THE SHADOW OF GREAT WINGS** (Stratagem (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES CHARACTER unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, your unit can only be selected as the target of a ranged attack if the attacking model is within 18".

5. **HELLFIRE ROUNDS** (Stratagem (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One KILL TEAM unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons (excluding Devastating Wounds weapons) equipped by models in your unit have the [ANTI-INFANTRY 2+] and [ANTI-MONSTER 5+] abilities. RESTRICTIONS: You cannot select any units that have already been targeted with either the Kraken Rounds or Dragonfire Rounds Stratagems this phase.

6. **MASTER MARKSMEN** (Stratagem (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability.

7. **Execute and Redeploy** (Enhancement (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: PHOBOS model only. In your Shooting phase, after the bearer’s unit has shot, if that unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6". If it does, until the end of the turn, that unit is not eligible to declare a charge. This cannot allow the bearer’s unit to move more than once in your Shooting phase.

---

### Pattern: damageModifier

**Total entries**: 8

**Unique entries**: 6

1. **Armoured Resilience** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000113.json, datasheets/000001191.json
   - Description: Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack.

2. **Duty Eternal** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000131.json, datasheets/000002717.json
   - Description: Each time an attack is allocated to this model, subtract 1 from the Damage characteristic of that attack.

3. **Guardian of the Lost** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000164.json
   - Description: While this model is leading a unit, each time an attack is allocated to a model in that unit, subtract 1 from the Damage characteristic of that attack.

4. **Inner Circle** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000231.json
   - Description: Each time an attack is allocated to a model in this unit, subtract 1 from the Damage characteristic of that attack.

5. **Thunderous Charge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000322.json
   - Description: Each time a model in this unit makes a melee attack with its Wolf Guard weapon, if it made a Charge move this turn, add 1 to the Damage characteristic of that attack.

6. **Adamantine Mantle** (Enhancement (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack.

---

### Pattern: ifInRange, oncePerTurn

**Total entries**: 7

**Unique entries**: 7

1. **Evade and Survive** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000076.json
   - Description: Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9" of this unit, if this unit is not within Engagement Range of one or more enemy units, it can make a Normal move.

2. **Lightning Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000081.json
   - Description: Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9" of this model, if this model’s unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6".

3. **Predatory Instinct** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000323.json
   - Description: Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9" of this unit, it can make a Normal move of up to D6".

4. **Master of Manoeuvre** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001423.json
   - Description: Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9" of this model, if this model is not within Engagement Range of one or more enemy units, this model can make a Normal move of up to 6".

5. **Knight Champion of Macragge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004184.json
   - Description: Once per turn, when an enemy unit ends a Normal, Advance or Fall Back move within 9" of this model’s unit, if this unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6".

6. **Prescience** (Enhancement (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES PSYKER model only (excluding TERMINATOR models). Once per turn, when an enemy unit ends a Normal , Advance or Fall Back move within 9" of the bearer’s unit, the bearer’s unit can make a Normal move of up to D6", or up to 6" instead if the Divination Discipline is active for your army.

7. **Gleaming Pinions** (Enhancement (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES JUMP PACK model only. Once per turn, when an enemy unit ends a Normal , Advance or Fall Back move within 9" of the bearer, if this bearer’s unit is not within Engagement Range of one or more enemy units, it can make a Normal move of up to 6".

---

### Pattern: ifInRange, oncePerBattle, stratagemCostReduction

**Total entries**: 7

**Unique entries**: 4

1. **Teleport Homer** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000118.json, datasheets/000000230.json, datasheets/000000231.json
   - Description: At the start of the battle, you can set up one Teleport Homer token for this unit anywhere on the battlefield that is not in your opponent’s deployment zone. If you do, once per battle, you can target this unit with the Rapid Ingress Stratagem for 0CP, but when resolving that Stratagem, you must set this unit up within 3" horizontally of that token and not within 9" horizontally of any enemy models. That token is then removed.

2. **Teleport Homer** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001183.json, datasheets/000004138.json
   - Description: At the start of the battle, you can set up one Teleport Homer token for this unit anywhere on the battlefield that is not in your opponent’s deployment zone. If you do, once per battle, you can target this unit with the Rapid Ingress Stratagem for 0CP, but when resolving that Stratagem, you must set this unit up within 3" of that token and not within 9" of any enemy models. That token is then removed.

3. **Supreme Strategist** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: Once per battle round, one unit from your army with this ability can use it when a friendly ADEPTUS ASTARTES unit within 12" of that model is targeted with a Stratagem. If it does, reduce the CP cost of that usage of that Stratagem by 1CP.

4. **Teleport Homer** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003873.json
   - Description: At the start of the battle, you can set up one Teleport Homer token for this unit anywhere on the battlefield that is not within your opponent’s deployment zone. If you do, once per battle, you can target this unit with the Rapid Ingress Stratagem for 0CP, but when resolving that Stratagem, you must set this unit up within 3" of that token and not within 9" horizontally of one or more enemy units. That token is then removed.

---

### Pattern: strengthModifier, apModifier

**Total entries**: 5

**Unique entries**: 4

1. **War-tempered Artifice** (Enhancement (Firestorm Assault Force))
   - Count: 2 occurrence(s)
   - Sources: faction.json, faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. Add 3 to the Strength characteristic of the bearer’s melee weapons.

2. **Angel’s Wrath** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000083.json
   - Description: While this model is leading a unit, each time that unit ends a Charge move, until the end of the turn, add 1 to the Strength characteristic of melee weapons equipped by models in that unit.

3. **Spearpoint Paragon** (Enhancement (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Improve the Strength and Armour Penetration characteristics of the bearer’s melee weapons by 1. Each time the bearer ends a Charge move , until the end of the turn, improve the Strength and Armour Penetration characteristics of the bearer’s melee weapons by 2 instead.

4. **Fury of the Storm** (Enhancement (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES MOUNTED model only. Improve the Strength and Armour Penetration characteristics of the bearer’s melee weapons by 1. Each time the bearer ends a Charge move , until the end of the turn, improve the Strength and Armour Penetration characteristics of the bearers melee weapons by 2 instead.

---

### Pattern: ifOnObjective, battleshock

**Total entries**: 5

**Unique entries**: 5

1. **INSPIRING COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000127.json
   - Description: If you include this model in your army, until the end of the battle, non- CHARACTER models in HEAVY INTERCESSOR SQUAD units from your army have an Objective Control characteristic of 3 while they are not Battle-shocked.

2. **INSPIRING COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002105.json
   - Description: If you include this model in your army, until the end of the battle, non- CHARACTER models in TERMINATOR ASSAULT SQUAD and TERMINATOR SQUAD units from your army have an Objective Control characteristic of 2 while they are not Battle-shocked.

3. **INSPIRING COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002708.json
   - Description: If you include this model in your army, until the end of the battle, non- CHARACTER models in ASSAULT INTERCESSORS WITH JUMP PACKS units from your army have an Objective Control characteristic of 2 while they are not Battle-shocked.

4. **INSPIRING COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002709.json
   - Description: If you include this model in your army, until the end of the battle, non- CHARACTER models in OUTRIDER SQUAD units from your army have an Objective Control characteristic of 3 while they are not Battle-shocked.

5. **INSPIRING COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002713.json
   - Description: If you include this model in your army, until the end of the battle, non- CHARACTER models in STERNGUARD VETERAN SQUAD units from your army have an Objective Control characteristic of 2 while they are not Battle-shocked.

---

### Pattern: ifDestroyed, ifInRange

**Total entries**: 5

**Unique entries**: 4

1. **Vengeance of the Omnissiah** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000140.json, datasheets/000001527.json
   - Description: If a friendly ADEPTUS ASTARTES VEHICLE model is destroyed within 12" of this model, until the end of the battle, this model’s Omnissian power axe has an Attacks characteristic of 7.

2. **Vengeance of the Omnissiah** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000308.json
   - Description: If a friendly ADEPTUS ASTARTES VEHICLE model is destroyed within 12" of this model, until the end of the battle, this model’s Iron Priest hammer has an Attacks characteristic of 6.

3. **TANK COMMANDER** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001524.json
   - Description: If your army includes one or more of the VEHICLE models listed below, Sergeant Chronus must start the battle embarked within one of those models as if it were a Transport. Sergeant Chronus can only disembark from that VEHICLE if it is destroyed. While embarked in this way, Sergeant Chronus is said to be commanding that VEHICLE . HUNTER PREDATOR ANNIHILATOR

4. **Assigned Agents** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: If your Army Faction is AGENTS OF THE IMPERIUM , then in the Select Detachment Rules step, you can select one of the available Detachments from this book as normal. If your Army Faction is not AGENTS OF THE IMPERIUM , but every model in your army has the IMPERIUM keyword, you can include AGENTS OF THE IMPERIUM units in your army even if they do not have the Faction keyword you selected in the Select Army Faction step. In this case, the maximum number of AGENTS OF THE IMPERIUM units you can include in your army depends on the battle size, as shown below. BATTLE SIZE RETINUE UNITS CHARACTER UNITS REQUISITIONED UNITS Incursion 1 1 1 Strike Force 2 2 1 Onslaught 3 3 2 Note that you can include AGENTS OF THE IMPERIUM DEDICATED TRANSPORT units in such an army as normal, but each unit must start the battle with one or more units embarked within it, or it cannot be deployed for that battle and will count as having been destroyed during the first battle round.

---

### Pattern: ignoresCover, shootingPhase, ifInRange

**Total entries**: 5

**Unique entries**: 5

1. **DRAGONFIRE ROUNDS** (Stratagem (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One KILL TEAM unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [ASSAULT] and [IGNORES COVER] abilities. RESTRICTIONS: You cannot select any units that have already been targeted with either the Kraken Rounds or Hellfire Rounds Stratagems this phase.

2. **EXEMPLARY VIGILANCE** (Stratagem (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability. If your unit is under the effects of the Devastator Doctrine , until the end of the phase, improve the Armour Penetration characteristic of such weapons by 1 as well.

3. **DISCIPLINED EXTERMINATION** (Stratagem (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability and improve the Armour Penetration characteristic of such weapons by 1.

4. **STORM OF FIRE** (Stratagem (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability. If your unit is under the effects of the Devastator Doctrine , until the end of the phase, improve the Armour Penetration characteristic of such weapons by 1 as well.

5. **FIRE DISCIPLINE** (Stratagem (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in that unit have the [ASSAULT] , [HEAVY] and [IGNORES COVER] abilities.

---

### Pattern: chargePhase, ifInRange

**Total entries**: 5

**Unique entries**: 5

1. **FOCUSED HATRED** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Charge phase, just after you make a Charge roll for an ADEPTUS ASTARTES unit from your army that disembarked from a TRANSPORT this turn. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the phase, each time your unit makes a Charge move, models in your unit can move through models (when doing so, its models can move within Engagement Range of enemy models, but they can only end that move within Engagement Range of enemy models if those enemy models belong to a unit that your unit declared a charge against this turn).

2. **INESCAPABLE WRATH** (Stratagem (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Charge phase. TARGET: One DEATHWING INFANTRY or DEATHWING WALKER unit from your army that is within 6" of one or more enemy units and would be eligible to declare a charge against one or more of those enemy units if it were your Charge phase. EFFECT: Your unit now declares a charge that only targets one or more of those enemy units, and you resolve that charge. RESTRICTIONS: Note that even if this charge is successful, your unit does not receive any Charge bonus this turn.

3. **COUNTERCHARGE** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Charge phase. TARGET: One ADEPTUS ASTARTES CHARACTER unit from your army that is within 6" of one or more enemy units and would be eligible to declare a charge against one or more of those enemy units if it were your Charge phase. EFFECT: Your unit now declares a charge that targets only one or more of those enemy units, and you resolve that charge as if it were your Charge phase. Note that even if this charge is successful, your unit does not receive any Charge bonus this turn.

4. **PERFERVID INTERVENTION** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Charge phase. TARGET: One ADEPTUS ASTARTES unit from your army that is within 6" of one or more enemy units and would be eligible to declare a charge against one or more of those enemy units if it were your Charge phase. EFFECT: Your unit now declares a charge that only targets one or more of those enemy units, and you resolve that charge. RESTRICTIONS: Note that even if this charge is successful, your unit does not receive any Charge bonus this turn.

5. **LEONINE AGGRESSION** (Stratagem (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your opponent’s Charge phase. TARGET: One ADEPTUS ASTARTES unit from your army within 3" of one or more enemy units, or one DEATHWING unit from your army within 6" of one or more enemy units. EFFECT: Your unit now declares a charge that only targets one or more of those enemy units, and you resolve that charge. RESTRICTIONS: Note that even if this charge is successful, your unit does not receive any Charge bonus this turn.

---

### Pattern: ifOnObjective, battleshock, ocModifier, aura

**Total entries**: 4

**Unique entries**: 1

1. **Curse of the Wulfen** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000000311.json, datasheets/000000314.json, datasheets/000004132.json, datasheets/000004133.json
   - Description: While this unit is within 6" of one or more friendly SPACE WOLVES CHARACTER models (excluding WULFEN models) or within 12" of one or more friendly WOLF PRIEST models, if it is not Battle-shocked, add 1 to the Objective Control characteristic of INFANTRY models in it and add 3 to the Objective Control characteristic of VEHICLE models in it.

---

### Pattern: strengthModifier, apModifier, attacksModifier, oncePerBattle

**Total entries**: 4

**Unique entries**: 4

1. **Deeds of Heroism** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001165.json
   - Description: Once per battle, when this model is selected to fight, it can use this ability. If it does, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in this model’s unit.

2. **The Imperium’s Sword** (Enhancement (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks characteristic of the bearers melee weapons. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by all other models in the bearer’s unit as well.

3. **Champion of the Feast** (Enhancement (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks characteristic of the bearer’s melee weapons. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by other models in the bearer’s unit as well.

4. **Spiritus Ferrum** (Enhancement (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks characteristic of the bearer’s melee weapons. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by all other models in the bearer’s unit as well.

---

### Pattern: damageModifier, apModifier

**Total entries**: 4

**Unique entries**: 4

1. **Adamantine Mantle** (Enhancement (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack. If that attack was made with a Melta or Torrent weapon, change the Damage characteristic of that attack to 1 instead.

2. **Adamantine Mantle** (Enhancement (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack. If that attack was made with a Melta or Torrent weapon , change the Damage characteristic of that attack to 1 instead.

3. **Calibanite Armaments** (Enhancement (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Damage characteristic of the bearer’s melee weapons.

4. **Ancient Weapons** (Enhancement (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Improve the Strength characteristic of melee weapons equipped by the bearer by 2, and improve the Armour Penetration and Damage characteristics of those weapons by 1.

---

### Pattern: ifInRange, ifOnObjective, rerollHit

**Total entries**: 3

**Unique entries**: 2

1. **Armoured Spearhead** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001185.json, datasheets/000002268.json
   - Description: Each time this model makes an attack that targets an enemy unit, re-roll a Hit roll of 1 and, if that unit is within range of an objective marker you do not control, you can re-roll the Hit roll instead.

2. **Decimator Protocols** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001193.json
   - Description: Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead.

---

### Pattern: ocModifier, oncePerBattle

**Total entries**: 3

**Unique entries**: 3

1. **Rites of War** (Enhancement (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. Improve the Objective Control characteristic of the bearer by 1. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Objective Control characteristic of all other models in the bearer’s unit as well.

2. **Disciple of Rhetoricus** (Enhancement (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. Improve the Objective Control characteristic of the bearer by 1. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Objective Control characteristic of other models in the bearer’s unit as well.

3. **Iron Laurel** (Enhancement (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Improve the Objective Control characteristic of the bearer by 1. Once per battle, at the start of any phase, the bearer can use this Enhancement. If it does, until the end of the phase, add 1 to the Objective Control characteristic of all other models in the bearer’s unit as well.

---

### Pattern: movementPhase, ifInRange, ifOnObjective, aura

**Total entries**: 3

**Unique entries**: 3

1. **DUTY AND HONOUR** (Stratagem (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army within range of an objective marker you control. EFFECT: That objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.

2. **WRATHFUL CONQUERORS** (Stratagem (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army within range of an objective marker you control. EFFECT: That objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any phase.

3. **DOMINATOR BEACON** (Stratagem (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES DREADNOUGHT , TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army within range of an objective marker you control. EFFECT: That objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the end of a phase.

---

### Pattern: fightPhase, ifDestroyed

**Total entries**: 3

**Unique entries**: 3

1. **OBDURATE VENGEANCE** (Stratagem (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6: on a 3+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

2. **ONLY IN DEATH DOES DUTY END** (Stratagem (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking model’s unit has finished making its attacks, and is then removed from play.

3. **DEATHLESS DUTY** (Stratagem (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One DEATH COMPANY unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

---

### Pattern: movementPhase, chargePhase, ifInRange

**Total entries**: 3

**Unique entries**: 3

1. **SHOCK CAVALRY** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase or your Charge phase. TARGET: One THUNDERWOLF CAVALRY unit from your army that has not been selected to move or declared a charge this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a Normal, Advance, Fall Back or Charge move, it can move through models (excluding TITANIC models) and sections of terrain features that are 4" or less in height. When doing so, it can move within Engagement Range of enemy models, but unless it is making a Charge move, it cannot end that move within Engagement Range of them.

2. **FENRISIAN FEROCITY** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase or your Charge phase. TARGET: One ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES WALKER unit from your army that has not been selected to move or charge this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a Normal, Advance, Fall Back or Charge move, it can move horizontally through models (excluding TITANIC models) and terrain features. When doing so, it can move within Engagement Range of enemy models, but cannot end a Normal, Advance or Fall Back move within Engagement Range of them.

3. **BOUNDING ADVANCE** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase or your Charge phase. TARGET: One SPACE WOLVES INFANTRY or SPACE WOLVES BEASTS unit from your army that has not been selected to move or declared a charge this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a Normal, Advance, Fall Back or Charge move, it can move through models (excluding TITANIC models). When doing so, it can move within Engagement Range of enemy models, but unless it is making a Charge move, it cannot end that move within Engagement Range of them.

---

### Pattern: ifInRange, stratagemCostReduction

**Total entries**: 2

**Unique entries**: 2

1. **Unorthodox Strategist (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000121.json
   - Description: Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12" of this model, increase the cost of that use of that Stratagem by 1CP (this is not cumulative with any other rules that would increase the CP cost of that Stratagem).

2. **Guile of the Wolf (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000282.json
   - Description: Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12" of this model, increase the cost of that usage of that Stratagem by 1CP (this is not cumulative with any other rules that increase the CP cost of that Stratagem).

---

### Pattern: ifInRange, ifOnObjective, rerollWound

**Total entries**: 2

**Unique entries**: 2

1. **Cunning Hunters** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000305.json
   - Description: Each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target is within range of an objective marker, you can re-roll the Wound roll instead.

2. **Shock Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001606.json
   - Description: Each time a model in this unit targets an enemy unit with a melee attack, re-roll a Wound roll of 1. If that enemy unit is within range of an objective marker, you can re-roll the Wound roll instead.

---

### Pattern: commandPhase, ifInRange, ifOnObjective, aura

**Total entries**: 2

**Unique entries**: 2

1. **Objective Secured** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001157.json
   - Description: If you control an objective marker at the end of your Command phase and this unit is within range of that objective marker, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.

2. **HUNTERS’ TRAIL** (Stratagem (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Command phase. TARGET: One RAVENWING MOUNTED unit from your army that is within range of an objective marker you control. EFFECT: That objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.

---

### Pattern: strengthModifier, attacksModifier

**Total entries**: 2

**Unique entries**: 2

1. **Target Elimination** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001157.json
   - Description: Each time this unit is selected to shoot, it can use this ability. If it does, until the end of the phase, add 2 to the Attacks characteristic of bolt rifles equipped by models in this unit and you can only select one enemy unit as the target of all of this unit’s attacks.

2. **Silent Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002707.json
   - Description: Each time this model destroys an enemy CHARACTER model, until the end of the battle, add 1 to the Attacks characteristic of its executioner relic blade.

---

### Pattern: apModifier, battleshock

**Total entries**: 2

**Unique entries**: 2

1. **Cut Off Their Escape** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002291.json
   - Description: Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of this model’s unit is selected to Fall Back, models in that enemy unit must take Desperate Escape tests as if their unit was Battle-shocked. When doing so, if that enemy unit is also Battle-shocked by other means, subtract 1 from each of those Desperate Escape tests.

2. **Icon of the Angel** (Enhancement (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of the bearer’s unit is selected to Fall Back , models in that enemy unit must take Desperate Escape tests as if their unit was Battle-shocked . When doing so, if that enemy unit is also Battle-shocked by other means, subtract 1 from each of those Desperate Escape tests.

---

### Pattern: shootingPhase, ifDestroyed, ifInRange, battleshock, aura

**Total entries**: 2

**Unique entries**: 2

1. **Righteous Zeal** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002799.json
   - Description: In your opponent’s Shooting phase, each time an enemy unit has shot, if any models in this unit were destroyed as a result of those attacks, this unit can make a Righteous Zeal move. To do so, roll one D6 and add 2 to the result: models in this unit move a number of inches up to this result, but this unit must end that move as close as possible to the closest enemy unit (excluding AIRCRAFT ). When doing so, those models can be moved within Engagement Range of that enemy unit. This unit cannot make a Righteous Zeal move while it is Battle-shocked or within Engagement Range of one or more enemy units, and can only make one Righteous Zeal move per phase.

2. **Glory of Ultramar** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004185.json
   - Description: In your opponent’s Shooting phase, each time an enemy unit has shot, if any models from this unit were destroyed as a result of those attacks, this unit can make a Surge move. To do so, roll one D6: models in this unit move a number of inches up to the result, but this unit must end that move as close as possible to the closest enemy unit (excluding AIRCRAFT ). When doing so, those models can be moved within Engagement Range of that enemy unit. This unit cannot make a Surge move while it is Battle-shocked or within Engagement Range of one or more enemy units, and can only make one Surge move per phase.

---

### Pattern: battleshock, ocModifier

**Total entries**: 2

**Unique entries**: 2

1. **Martial Honour** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004136.json
   - Description: The first time a model in this model’s unit makes a melee attack that destroys one or more enemy units, until the end of the battle, while this model’s unit is not Battle-shocked, add 5 to this model’s Objective Control characteristic.

2. **Stalwart Champion** (Enhancement (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CAPTAIN , CHAPLAIN or LIEUTENANT model only. While the bearer’s unit is not Battle-shocked , add 1 to the Objective Control characteristic of models in the bearer’s unit.

---

### Pattern: ifDestroyed, battleshock, oncePerBattle, aura

**Total entries**: 2

**Unique entries**: 2

1. **Fear Made Manifest (Aura)** (Enhancement (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While an enemy unit (excluding MONSTERS and VEHICLES ) is within 6" of the bearer, each time that unit fails a Battle-shock test , one model in that unit is destroyed (chosen by its controlling player). Once per battle, when such an enemy unit fails a Battle-shock test, you can choose for D3 models in that unit to be destroyed in this way instead.

2. **Medusan Roar (Aura)** (Enhancement (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While an enemy unit (excluding MONSTERS and VEHICLES ) is within 6" of the bearer, each time that unit fails a Battle-shock test , one model in that unit is destroyed (chosen by its controlling player). Once per battle, when such an enemy unit fails a Battle-shock test, you can choose for D3 models in that unit to be destroyed in this way instead.

---

### Pattern: chargePhase, ifInRange, damageModifier

**Total entries**: 2

**Unique entries**: 2

1. **LEGENDARY FORTITUDE** (Stratagem (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase, just after an enemy unit ends a Charge move. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army within Engagement Range of that enemy unit. EFFECT: Until the end of the turn, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.

2. **AUGMETIC FORTITUDE** (Stratagem (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase, just after an enemy unit ends a Charge move. TARGET: One ADEPTUS ASTARTES TERMINATOR , BLADEGUARD VETERAN SQUAD , STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD unit from your army within Engagement Range of that enemy unit. EFFECT: Until the end of the turn, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.

---

### Pattern: commandPhase, ifInRange, ifOnObjective

**Total entries**: 2

**Unique entries**: 2

1. **NOT ONE BACKWARDS STEP** (Stratagem (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army within range of an objective marker. EFFECT: Until the end of the turn, double the Objective Control characteristic of models in your unit, but it must Remain Stationary this turn.

2. **RUNES OF CLAIMING** (Stratagem (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of your Command phase. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES WALKER unit from your army. EFFECT: Select one objective marker you control that your unit is within range of. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.

---

### Pattern: fightPhase, ifInRange, ifOnObjective

**Total entries**: 2

**Unique entries**: 2

1. **RIGID DISCIPLINE** (Stratagem (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: End of the Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that is within Engagement Range of one or more enemy units. EFFECT: Your unit can immediately make a Fall Back move of up to 6". RESTRICTIONS: When making that move, your unit must end that move either wholly within your deployment zone or within range of an objective marker.

2. **LITANIES OF PURGATION** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, if that model’s unit is within range of one or more objective markers or the target unit is within range of one or more objective markers, improve the Armour Penetration characteristic of that attack by 1.

---

### Pattern: shootingPhase, ifDestroyed

**Total entries**: 2

**Unique entries**: 2

1. **HAIL OF VENGEANCE** (Stratagem (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has resolved its attacks. TARGET: One ADEPTUS ASTARTES unit from your army that had one or more of its models destroyed as a result of the attacking unit’s attacks. EFFECT: Your unit can shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

2. **GRIM RETRIBUTION** (Stratagem (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot. TARGET: One ADEPTUS ASTARTES unit from your army that had one or more models destroyed as a result of the attacking unit’s attacks. EFFECT: Your unit can shoot as if it were your Shooting phase, but it must target the enemy unit that just attacked it, and can only do so if that enemy unit is an eligible target.

---

### Pattern: movementPhase, shootingPhase, ifInRange

**Total entries**: 2

**Unique entries**: 2

1. **BURNING VENGEANCE** (Stratagem (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has resolved its attacks. TARGET: One ADEPTUS ASTARTES TRANSPORT unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: One unit embarked within that TRANSPORT can disembark as if it were your Movement phase, and can then shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

2. **BURNING VENGEANCE** (Stratagem (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot. TARGET: One ADEPTUS ASTARTES TRANSPORT unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: One unit embarked within that TRANSPORT can disembark as if it were your Movement phase, and can then shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

---

### Pattern: strengthModifier, damageModifier, apModifier

**Total entries**: 2

**Unique entries**: 2

1. **Paragon of Fury** (Enhancement (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 2 to the Strength characteristic of melee weapons equipped by the bearer. Each time a melee attack made by the bearer is allocated to an enemy model, if the bearer disembarked from a TRANSPORT this turn, add 1 to the Damage characteristic of that attack.

2. **Braggart’s Steel** (Enhancement (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. Add 2 to the Strength characteristic of melee weapons equipped by the bearer. If the bearer’s unit has achieved one or more Boasts , add 1 to the Damage characteristic of those weapons as well.

---

### Pattern: shootingPhase, damageModifier

**Total entries**: 2

**Unique entries**: 2

1. **BLESSED HULL** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES VEHICLE unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.

2. **HEROIC RESOLVE** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One SPACE WOLVES CHARACTER unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time an attack is allocated to a model in your unit, subtract 1 from the Damage characteristic of that attack.

---

### Pattern: ifInRange, ifOnObjective

**Total entries**: 2

**Unique entries**: 2

1. **Champion of the Deathwing** (Enhancement (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATHWING model only. Melee weapons equipped by the bearer have the [lethal hits] ability, and each time the bearer makes a melee attack, if it is within range of your Vowed objective marker , a Critical Hit is scored on an unmodified Hit roll of 5+.

2. **Eye of the Unseen** (Enhancement (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATHWING model only. Each time you target the bearer’s unit with a Stratagem, roll one D6, adding 1 if the bearer is within range of your Vowed objective marker : on a 5+, you gain 1CP

---

### Pattern: ifDestroyed, ifInRange, ifOnObjective, aura

**Total entries**: 2

**Unique entries**: 2

1. **A GRIM WARNING** (Stratagem (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase. TARGET: One BLOOD ANGELS unit from your army that was just destroyed while it was within range of one or more objective markers you controlled at the end of the previous phase. You can use this Stratagem on that unit even though it was just destroyed. EFFECT: Select one of those objective markers. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.

2. **GLORIOUS SACRIFICE** (Stratagem (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase. TARGET: One DEATH COMPANY unit from your army that was just destroyed while it was within range of an objective marker you controlled. You can use this Stratagem on that unit even though it was just destroyed. EFFECT: That objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.

---

### Pattern: ifInRange, stratagemCostReduction, aura

**Total entries**: 2

**Unique entries**: 2

1. **Coronal Susurrant** (Enhancement (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: PHOBOS model only. The bearer has the following ability: Lord of Deceit (Aura): Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12" of this model, increase the cost of that usage of that Stratagem by 1CP.

2. **Shadow War Veteran** (Enhancement (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: PHOBOS model only. Gain following ability: Lord of Deceit (Aura): Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12" of this model, increase the cost of that use of that Stratagem by 1CP.

---

### Pattern: shootingPhase, ifDestroyed, ifInRange, attacksModifier, battleshock

**Total entries**: 2

**Unique entries**: 2

1. **STUNNING FUSILLADE** (Stratagem (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit that is more than 12" away, improve the Ballistic Skill and Armour Penetration characteristics of that attack by 1. If one or more enemy models are destroyed as a result of those attacks, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.

2. **STRIKE FROM THE SHADOWS** (Stratagem (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit that is more than 12" away, improve the Ballistic Skill and Armour Penetration characteristics of that attack by 1. If one or more enemy models are destroyed as a result of those attacks, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.

---

### Pattern: ifInRange, ifOnObjective, rerollWound, aura

**Total entries**: 1

**Unique entries**: 1

1. **Priority Objective Identified** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000076.json
   - Description: At the start of the first battle round, if your army includes one or more models with this ability, you can select one objective marker on the battlefield. Until the end of the battle, while one or more models with this ability are on the battlefield, each time a friendly ADEPTUS ASTARTES model makes an attack that targets an enemy unit that is within range of that objective marker, re-roll a Wound roll of 1.

---

### Pattern: strengthModifier, damageModifier

**Total entries**: 1

**Unique entries**: 1

1. **Sunderer of Fortresses** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000093.json
   - Description: Each time this model makes an attack that targets a VEHICLE , improve the Strength and Damage characteristic of that attack by 1 (if that attack targets a FORTIFICATION unit, improve the Strength and Damage characteristics of that attack by 2 instead).

---

### Pattern: commandPhase, ifDestroyed

**Total entries**: 1

**Unique entries**: 1

1. **Master of Battle** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: At the start of your Command phase, after you have selected your Oath of Moment target, select a second enemy unit. Until the start of your next Command phase, if your Oath of Moment target is destroyed, that second enemy unit becomes your Oath of Moment target until you select a new one.

---

### Pattern: movementPhase, ifWounded, ifInRange, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Wings of Sanguinius (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000154.json
   - Description: Once per turn, at the end of your Movement phase, one PSYKER from your army with this ability can use it. If it does, roll one D6: on a 1, that PSYKER suffers D3 mortal wounds; on a 2+, select one friendly ADEPTUS ASTARTES INFANTRY unit within 12" of that PSYKER and remove the selected unit from the battlefield, then set it up again anywhere on the battlefield that is more than 9" horizontally away from all enemy models.

---

### Pattern: chargePhase, ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Miraculous Saviour** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000156.json
   - Description: Once per battle, at the end of your opponent’s Charge phase, if this model is still in Reserves, you can select one enemy unit that made a Charge move this phase. Set this model up on the battlefield within Engagement Range of that enemy unit.

---

### Pattern: shootingPhase, ifInRange, battleshock, aura

**Total entries**: 1

**Unique entries**: 1

1. **Driven by Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000166.json
   - Description: In your opponent’s Shooting phase, each time an enemy unit has shot, if this model was hit by one or more of those attacks, it can make a Driven by Fury move. To do so, roll one D6 and add 2 to the roll: this model moves a number of inches up to the result, but must finish as close as possible to the closest enemy unit (excluding AIRCRAFT ). When doing so, this model can be moved within Engagement Range of that enemy unit. A model cannot make a Driven by Fury move while it is Battle-shocked or within Engagement Range of one or more enemy units, and can only make one Driven by Fury move per phase.

---

### Pattern: strengthModifier, attacksModifier, aura

**Total entries**: 1

**Unique entries**: 1

1. **Whirlwind of Gore** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000169.json
   - Description: Each time this model fights, until that fight is resolved, add 1 to the Attacks characteristic of this model’s Blood Reaver for every 5 enemy models within 6" of this model.

---

### Pattern: ifDestroyed, ifInRange, strengthModifier, apModifier, attacksModifier, battleshock, aura

**Total entries**: 1

**Unique entries**: 1

1. **Book of Salvation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000226.json
   - Description: While this model is leading a unit, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit. When this model is destroyed, each friendly ADEPTUS ASTARTES unit within 6" of this model must take a Battle-shock test.

---

### Pattern: movementPhase, ifWounded, oncePerBattle, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Stasis Bomb** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000240.json
   - Description: Once per turn, one model from your army with this ability can use it after it ends a Normal move. If it does, you can select one enemy unit (excluding AIRCRAFT ) that model moved over this phase. That unit suffers D3 mortal wounds and you must roll one D6: on a 1-3, that unit cannot Advance or Fall Back in your opponent’s next Movement phase; on a 4-6, that unit must Remain Stationary in your opponent’s next Movement phase. Each model can only use this ability once per battle.

---

### Pattern: shootingPhase, ifDestroyed, ifInRange, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Storm of Vengeance** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000242.json
   - Description: Once per turn, in your opponent’s Shooting phase, when a friendly Adeptus Astartes unit within 6" of this model is destroyed, this model can use this ability (it cannot use this ability when it is itself destroyed). If it does, after the attacking unit has finished making its attacks, this model can shoot as if it were your Shooting phase, but when resolving those attacks it can only target that enemy unit (and only if it is an eligible target).

---

### Pattern: shootingPhase, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Tempest’s Wrath (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000292.json
   - Description: In your Shooting phase, after this model’s unit has shot, select one enemy unit (excluding MONSTERS and VEHICLES ) hit by one or more of those attacks made with this model’s Living Lightning weapon. Until the start of your next turn, that enemy unit is stormwracked. While a unit is stormwracked, subtract 6" from the Range characteristic of ranged weapons equipped by models in that unit (to a minimum of 12").

---

### Pattern: shootingPhase, ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Aggressive Hunter** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000301.json
   - Description: Once per battle, in your opponent’s Shooting phase, after an enemy unit has finished making its attacks, if this model’s unit was targeted by one or more of those attacks, this model’s unit can make a Normal move of up to D6", but must end that move as close as possible to the closest enemy unit. When doing so, models in this model’s unit can be moved within Engagement Range of that enemy unit.

---

### Pattern: ifDestroyed, ifWounded, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Last Laugh** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000304.json
   - Description: If this model is destroyed by a melee attack, after the attacking unit has finished making its attacks, roll one D6: on a 4+, the attacking unit suffers D6 mortal wounds and is Battle-shocked.

---

### Pattern: ifInRange, rerollHit

**Total entries**: 1

**Unique entries**: 1

1. **Fire Discipline** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000326.json
   - Description: Each time this unit Remains Stationary, if it includes a Long Fang Pack Leader, you can select one enemy unit that is visible to that model. Until the end of the turn, each time a model in this unit makes a ranged attack that targets that enemy unit, re-roll a Hit roll of 1.

---

### Pattern: commandPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Mist-wreathed Shadow Realms** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: In your Command phase, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves.

---

### Pattern: commandPhase, strengthModifier, apModifier, attacksModifier, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Oath of Rynn** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002713.json
   - Description: Once per battle, at the start of either player’s Command phase, this model can use this ability. When it does, until the end of the turn, add 1 to the Attacks characteristic of weapons equipped by models in this model’s unit.

---

### Pattern: ocModifier, aura

**Total entries**: 1

**Unique entries**: 1

1. **Terror Troops (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002718.json
   - Description: While an enemy unit (excluding MONSTERS and VEHICLES ) is within 3" of one or more units with this ability, subtract 1 from the Objective Control characteristic of models in that enemy unit.

---

### Pattern: strengthModifier

**Total entries**: 1

**Unique entries**: 1

1. **Column from the Major Altar** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002792.json
   - Description: Add 1 to the Toughness characteristic of models in this unit.

---

### Pattern: apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Talonstrike Doctrines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003874.json
   - Description: Each time this unit is set up on the battlefield, until the end of the turn: Improve the Armour Penetration characteristic of weapons equipped by models in this unit by 1. Melee weapons equipped by models in this unit have the [LANCE] ability.

---

### Pattern: ifInRange, aura

**Total entries**: 1

**Unique entries**: 1

1. **Headhunters** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004131.json
   - Description: At the start of the battle, select one unit from your opponent’s army to be this unit’s quarry. Weapons equipped by HEADTAKERS models in this unit have the [DEVASTATING WOUNDS] and [PRECISION] abilities while targeting its quarry. Each time this unit’s quarry is destroyed, select one new enemy unit to be this unit’s quarry. This ability can be used even if this unit is embarked within a TRANSPORT .

---

### Pattern: ifDestroyed, ifInRange, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Condemnatory Annihilation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004135.json
   - Description: Each time this model’s unit has fought, if one or more enemy units were destroyed as a result of those attacks, each enemy unit within 6" of this model must take a Battle-shock test.

---

### Pattern: fightPhase, strengthModifier, apModifier, attacksModifier, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Banner of Macragge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004185.json
   - Description: Once per battle, at the start of the Fight phase, the bearer can use this ability. If it does, until the end of the phase, add 1 to the Strength and Attacks characteristics of melee weapons equipped by models in the bearer’s unit.

---

### Pattern: shootingPhase, ifInRange, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **NO THREAT TOO GREAT** (Stratagem (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a ranged attack that targets a MONSTER or VEHICLE unit, you can re-roll the Wound roll.

---

### Pattern: fightPhase, ifDestroyed, strengthModifier, damageModifier, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Thief of Secrets** (Enhancement (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Improve the Strength, Damage and Armour Penetration characteristics of the bearer’s melee weapons by 1. At the end of the Fight phase, if one or more enemy models were destroyed as a result of a melee attack made by the bearer this phase, until the end of the battle, improve the Strength, Damage and Armour Penetration characteristics of the bearer’s melee weapons by 2 instead.

---

### Pattern: shootingPhase, ifInRange, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **KRAKEN ROUNDS** (Stratagem (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One KILL TEAM unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, improve the Armour Penetration characteristic of ranged weapons equipped by models in your unit by 1 and improve the Range characteristic of those weapons by 6". RESTRICTIONS: You cannot select any units that have already been targeted with either the Dragonfire Rounds or Hellfire Rounds Stratagems this phase.

---

### Pattern: fightPhase, strengthModifier, apModifier, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **CERAMITE BULWARK** (Stratagem (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES BATTLELINE unit from your army that has not been selected to fight this phase. EFFECT: Select any number of models in your unit. Until the end of the phase, add 1 to the Attacks and Strength characteristics of melee weapons equipped by the selected models and each time you select targets for attacks made by those models, they must target an enemy unit that is wholly on the opposite side of a Hatchway from them.

---

### Pattern: shootingPhase, fightPhase, ifInRange, ifOnObjective, feelNoPain

**Total entries**: 1

**Unique entries**: 1

1. **IN THE EMPEROR’S NAME** (Stratagem (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES BATTLELINE unit from your army that is within range of an objective marker and was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.

---

### Pattern: fightPhase, ifDestroyed, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **DUTY AND DEFIANCE** (Stratagem (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if your unit has the BATTLELINE keyword: on a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.

---

### Pattern: chargePhase, ifOnObjective, apModifier, battleshock, ocModifier

**Total entries**: 1

**Unique entries**: 1

1. **The Great Wolf Watches** (Detachment Ability (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the end of your opponent’s Charge phase, each ADEPTUS ASTARTES INFANTRY and ADEPTUS ASTARTES WALKER unit from your army that is within 3" of one or more enemy units and would be eligible to declare a charge against one or more of those units can declare a charge against one or more of those units, and you resolve that charge as if it were your Charge phase. If that charge is successful, your unit does not receive any Charge bonus this turn. While ADEPTUS ASTARTES TERMINATOR units from your army are not Battle-shocked , add 1 to the Objective Control characteristic of models in those units. RESTRICTIONS Your army can include SPACE WOLVES units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: shootingPhase, ifInRange, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **DEATH ON THE WIND** (Stratagem (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One RAVENWING unit from your army that has just shot. EFFECT: Select one enemy unit that was hit by one or more of those attacks. That unit must take a Battle-shock test. When doing so, if one or more RAVENWING units from your army are within 6" of that enemy unit, subtract 1 from the test.

---

### Pattern: fightPhase, ifInRange, ifOnObjective, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **MARTIAL MASTERY** (Stratagem (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One DEATHWING INFANTRY unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, re-roll a Wound roll of 1. If your unit is within range of your Vowed objective marker, you can re-roll the Wound roll instead.

---

### Pattern: fightPhase, ifDestroyed, ifInRange, ifOnObjective, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **DUTY UNTO DEATH** (Stratagem (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One DEATHWING unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 if your unit is within range of your Vowed objective marker. On a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.

---

### Pattern: ifInRange, feelNoPain, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Adept of the Omnissiah** (Enhancement (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: TECHMARINE model only. Once per battle round, when a saving throw is failed for a friendly ADEPTUS ASTARTES VEHICLE model within 6" of the bearer, you can change the Damage characteristic of that attack to 0.

---

### Pattern: chargePhase, strengthModifier, damageModifier, apModifier, attacksModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **SAVAGE ECHOES** (Stratagem (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase. TARGET: One ADEPTUS ASTARTES unit from your army that was just charged by an enemy unit. EFFECT: Select either the Strength or Attacks characteristic of melee weapons equipped by models in your unit. Until the end of the turn, add 1 to the selected characteristic. You can instead choose for your unit to give in to the Red Thirst ; if it does, it becomes Battle-shocked (but the effects of this Stratagem still apply to it) and until the end of the turn, add 1 to the Strength and Attacks characteristics of melee weapons equipped by models in your unit.

---

### Pattern: ifInRange, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **Fusillade** (Enhancement (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES PSYKER model only. Ranged weapons equipped by models in the bearer’s unit have the [ANTI-MONSTER 5+] and [ANTI-VEHICLE 5+] abilities, and: The [SUSTAINED HITS 1] ability if the Pyromancy Discipline is active for your army. Add 6" to the Range characteristic of those weapons if the Telekinesis Discipline is active for your army.

---

### Pattern: ifInRange, apModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **In The Lion’s Claws** (Detachment Ability (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of one or more RAVENWING units from your army Falls Back, all models in that enemy unit must take a Desperate Escape test . When doing so, if that enemy unit is Battle-shocked , subtract 1 from each of those tests. Each time a DEATHWING unit from your army declares a charge, if one or more targets of that charge are within Engagement Range of one or more RAVENWING units from your army, add 2 to the Charge roll . RESTRICTIONS Your army can include DARK ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

---

### Pattern: ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Fulgus Magna** (Enhancement (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATHWING model only. Once per battle, at the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, the bearer can use this Enhancement. If it does, remove the bearer’s unit from the battlefield and place it into Strategic Reserves.

---

### Pattern: commandPhase, fightPhase, ifInRange, battleshock, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **OVERPOWERING EXACTION** (Stratagem (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Command phase or the start of the Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Select one enemy unit within Engagement Range of your unit. That enemy unit must take a Battle-shock test. When doing so, if your unit has the DEATHWING or RAVENWING keyword, subtract 1 from the result. RESTRICTIONS: You can only use this Stratagem once per battle round.

---

### Pattern: movementPhase, ifWounded, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **FIGHTING RETREAT** (Stratagem (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES unit from your army is selected to Fall Back. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Select one enemy unit within Engagement Range of your unit and roll one D6: on a 2-4, that enemy unit suffers 1 mortal wound; on a 5+, that enemy unit suffers 2 mortal wounds.

---

### Pattern: rerollWound, strengthModifier, apModifier, attacksModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Maddened Ferocity** (Detachment Ability (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES model from your army makes a melee attack, re-roll a Wound roll of 1. Each time an ADEPTUS ASTARTES unit from your army is selected to fight, if that unit made a Charge move this turn, until the end of the phase, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit. If your unit is Battle-shocked , add 2 to the Attacks characteristic of melee weapons equipped by models in that unit instead. Restrictions Your army can include BLOOD ANGELS units, but it cannot include ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: fightPhase, strengthModifier, damageModifier, apModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **LIMB FROM LIMB** (Stratagem (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that made a Charge move this turn. EFFECT: Select either the Strength or Armour Penetration characteristic of melee weapons equipped by models in your unit. Until the end of the phase, add 1 to the selected characteristic. You can instead choose for your unit to give in to the Red Thirst; if it does, it becomes Battle-shocked (but the effects of this Stratagem still apply to it), and until the end of the phase, add 1 to the Strength and Armour Penetration characteristics of melee weapons equipped by models in your unit.

---

### Pattern: shootingPhase, ifDestroyed, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **IMPETUOSITY** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One WULFEN INFANTRY or BLOOD CLAWS unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, after that enemy unit has shot, if one or more models in your unit were destroyed as a result of those attacks, your unit can make an Impetuous move. To do so, roll one D6: your unit can be moved a number of inches up to the result, but your unit must end that move as close as possible to the closest enemy unit (excluding AIRCRAFT ). When doing so, those models can be moved within Engagement Range of that enemy unit.

---

### Pattern: commandPhase, ifDestroyed, ifInRange, ifOnObjective, rerollHit, rerollWound, rerollAll

**Total entries**: 1

**Unique entries**: 1

1. **Heroes All** (Detachment Ability (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time an ADEPTUS ASTARTES unit from your army is selected to shoot or fight, apply one of the following when resolving those attacks: If your Saga is completed (see below), you can re-roll one Hit roll , one Wound roll and one Damage roll. Otherwise, if that unit is a SPACE WOLVES CHARACTER unit, you can re-roll one Hit roll, one Wound roll or one Damage roll. Saga of the Bold Each time a SPACE WOLVES CHARACTER unit from your army does one of the following, that unit achieves that Boast. Once three or more different Boasts have been achieved by units from your army, your Saga is completed. Your Hide as a Trophy: That unit destroys your Oath of Moment target . Slay Them All: That unit destroys your Oath of Moment target, and that is the second Oath of Moment target destroyed by that unit in this battle. Overrun Their Position: At the end of either player’s turn, that unit is wholly within your opponent’s deployment zone. Hold the Line: From the second battle round onwards, at the end of your Command phase, that unit is within range of an objective marker you control that is not within your deployment zone.

---

### Pattern: fightPhase, ifDestroyed, ifInRange, ifOnObjective

**Total entries**: 1

**Unique entries**: 1

1. **TERRITORIAL ADVANTAGE** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit is destroyed by an ADEPTUS ASTARTES unit from your army. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Select one objective marker you control that your unit is within range of. That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.

---

### Pattern: fightPhase, ifDestroyed, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **Wrath of the First Khan** (Detachment Ability (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the end of the Fight phase, if a SUBODEN KHAN unit from your army destroyed one or more enemy units this phase and is not within Engagement Range of one or more enemy units, that unit can make a Normal move of up to 6".

---

### Pattern: commandPhase, ifOnObjective, ocModifier

**Total entries**: 1

**Unique entries**: 1

1. **TOWER OF STRENGTH** (Stratagem (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Start or end of any phase. TARGET: One ADEPTUS ASTARTES TERMINATOR unit from your army. EFFECT: Until the end of your next Command phase, add 1 to the Objective Control characteristic of models in your unit. RESTRICTIONS: Each time you use this Stratagem, you cannot use it again until after your next Command phase.

---

### Pattern: movementPhase, chargePhase, ifInRange, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **CARVE A PATH** (Stratagem (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase or your Charge phase. TARGET: One TERMINATOR ASSAULT SQUAD unit from your army that has not been selected to move this phase and has not declared a charge this phase. EFFECT: Until the end of the phase, when making a Normal, Advance or Charge move, your unit can move through a single closed Hatchway as if it was open. When doing so, that Hatchway is opened and cannot be closed for the rest of the battle. This can allow that unit to declare a charge against enemy units that are not visible to it, but to do so those enemy units must be within 1" of that Hatchway and wholly on the opposite side of it from your unit. RESTRICTIONS: You cannot use this Stratagem more than once per turn.

---

### Pattern: ifDestroyed, rerollHit, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **UNBRIDLED ARDOUR** (Stratagem (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase. TARGET: One ADEPTUS ASTARTES unit from your army that was just destroyed. You can use this Stratagem on that unit even though it was just destroyed. EFFECT: Until the end of the battle, each time a friendly SANGUINARY GUARD unit makes an attack that targets the enemy unit that just destroyed your unit, you can re-roll the Hit roll and you can re-roll the Wound roll.

---

### Pattern: fightPhase, ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Sanguinius’ Grace** (Enhancement (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATH COMPANY model only. Once per battle, at the end of the Fight phase, if the bearer is within Engagement Range of three or more enemy models, the bearer can fight one additional time.

---

### Pattern: fightPhase, ifWounded, ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **To Slay the Warmaster** (Enhancement (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATH COMPANY model only. Once per battle, at the start of the Fight phase, if the bearer is within Engagement Range of one or more enemy CHARACTER units, you can select one of those CHARACTER units and roll six D6: for each 4+, one CHARACTER model in that unit suffers 1 mortal wound .

---

### Pattern: fightPhase, ifDestroyed, ifInRange, apModifier, attacksModifier

**Total entries**: 1

**Unique entries**: 1

1. **FINAL RETRIBUTION** (Stratagem (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just after an enemy unit has selected its targets. TARGET: One DEATH COMPANY unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6, adding 1 to the result if your unit is within 12" of one or more friendly CHAPLAIN models; on a 4+, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.

---

### Pattern: commandPhase, apModifier, battleshock, ocModifier

**Total entries**: 1

**Unique entries**: 1

1. **Grim Resolve** (Detachment Ability (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: While an ADEPTUS ASTARTES unit from your army is Battle-shocked , change the Objective Control characteristic of models in that unit to 1, instead of 0. In your Command phase, select one ADEPTUS ASTARTES unit from your army; until the start of your next Command phase, add 1 to the Objective Control characteristic of models in that unit. RESTRICTIONS Your army can include DARK ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

---

### Pattern: ifDestroyed, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Shroud of Heroes** (Enhancement (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The first time the bearer is destroyed , roll one D6 at the end of the phase. On a 2+, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining (if the bearer was Battle-shocked when it was destroyed, it is instead returned with its full wounds remaining).

---

### Pattern: strengthModifier, damageModifier, apModifier, attacksModifier, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Weapons of the First Legion** (Enhancement (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Add 1 to the Attacks, Strength and Damage characteristics of the bearer’s melee weapons. While the bearer is Battle-shocked , add 2 to the Attacks, Strength and Damage characteristics of the bearer s melee weapons instead.

---

### Pattern: commandPhase, ifWounded, ifInRange, ifOnObjective, aura

**Total entries**: 1

**Unique entries**: 1

1. **A DEADLY PRIZE** (Stratagem (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Start of the Command phase. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army within range of an objective marker you control. EFFECT: That objective marker is said to be Sabotaged, and remains under your control even if you have no models within range of it, until your opponent controls it at the start or end of any turn. While an objective marker is Sabotaged and under your control, each time an enemy unit ends a Normal, Advance, Fall Back or Charge move within range of that objective marker, roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds.

---

### Pattern: ignoresCover, shootingPhase, fightPhase, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **SPOOR OF THE UNHOLY** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, ranged weapons equipped by models in your unit have the [IGNORES COVER] ability and each time a model in your unit makes an attack, you can ignore any or all modifiers to the following: that attack’s Ballistic Skill or Weapon Skill characteristic; the Hit roll.

---

### Pattern: ifDestroyed, ifInRange, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **REFUSAL TO YIELD** (Stratagem (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase, just after an ANCIENT model from your army is destroyed. TARGET: That ANCIENT model. You can use this Stratagem on that model even though it was just destroyed. EFFECT: At the end of the phase, set your model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with its full wounds remaining. RESTRICTIONS: You cannot target the same model with this Stratagem more than once per battle.

---

### Pattern: commandPhase, ifDestroyed, ifInRange

**Total entries**: 1

**Unique entries**: 1

1. **INESCAPABLE JUSTICE** (Stratagem (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase, just after your Oath of Moment target is destroyed. TARGET: One ADEPTUS ASTARTES CHARACTER unit that is on the battlefield. EFFECT: Select one enemy unit within 12" and visible to your unit. That enemy unit becomes your Oath of Moment target until the start of your next Command phase.

---

### Pattern: shootingPhase, ifInRange, strengthModifier, apModifier

**Total entries**: 1

**Unique entries**: 1

1. **RELICS OF THE DARK AGE** (Stratagem (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, add 2 to the Strength characteristic of ranged weapons equipped by models in your unit.

---

### Pattern: saveBonus, ifInRange, strengthModifier, apModifier, attacksModifier, invulnerableSave

**Total entries**: 1

**Unique entries**: 1

1. **Zealous Litanies** (Detachment Ability (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of the battle round, you can select one of the Litanies listed below. If you do, until the end of the battle round, that Litany is active and its effects apply to all ADEPTUS ASTARTES INFANTRY and ADEPTUS ASTARTES MOUNTED units from your army. Chorus of Relentless Hate Add 2" to the Move characteristic of models in this unit and add 1 to Advance rolls made for it. Rite of Perfervid Wrath Add 1 to the Strength characteristic of melee weapons equipped by models in this unit. CHANT OF DEATHLESS DEVOTION Models in this unit have a 5+ invulnerable save against ranged attacks. RESTRICTIONS Your army can include BLACK TEMPLARS units, but it cannot include ADEPTUS ASTARTES units drawn from any other Chapter .

---

## Rerolls (58 entries)

### Pattern: rerollHit, aura

**Total entries**: 13

**Unique entries**: 3

1. **Black Rage** (Unit Ability)
   - Count: 10 occurrence(s)
   - Sources: datasheets/000000153.json, datasheets/000000166.json, datasheets/000001997.json, datasheets/000002285.json, datasheets/000002737.json, ... and 5 more
   - Description: Each time this model makes a melee attack, you can re-roll the Hit roll. While this model’s unit is not within 6" of one or more friendly BLOOD ANGELS CHARACTER models, or 12" of one or more friendly CHAPLAIN models, it cannot be selected to Fall Back and its Objective Control characteristic is 0.

2. **Wisdom of the Ancients (Aura)** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000117.json, datasheets/000000120.json
   - Description: While a friendly ADEPTUS ASTARTES INFANTRY unit is within 6" of this model, each time a model in that unit makes an attack, re-roll a Hit roll of 1.

3. **Tempered Ferocity** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004130.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability and, each time a model in that unit makes an attack that targets an enemy unit within 6", re-roll a Hit roll of 1.

---

### Pattern: rerollHit

**Total entries**: 11

**Unique entries**: 9

1. **Death Totem** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000311.json, datasheets/000004132.json
   - Description: Each time the bearer makes a melee attack, re-roll a Hit roll of 1.

2. **Death to the Alien** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002783.json, datasheets/000004175.json
   - Description: Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack does not have the IMPERIUM or CHAOS keywords, you can re-roll the Hit roll instead.

3. **Ballistus Strike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000091.json
   - Description: Each time this model makes a ranged attack that targets a unit that is not Below Half-strength, you can re-roll the Hit roll.

4. **Mortis Strike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000111.json
   - Description: Each time this model makes a ranged attack that targets a unit that is not Below Half-strength, you can re-roll the Hit roll.

5. **Exemplar of Hate** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000225.json
   - Description: While this model is leading a unit, each time a model in that unit makes a melee attack, you can re-roll the Hit roll.

6. **Deredeo Strike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002269.json
   - Description: Each time this model makes a ranged attack that targets a unit that is not Below Half-strength, you can re-roll the Hit roll.

7. **Interception Strike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002790.json
   - Description: Each time this model makes a ranged attack that targets an enemy unit within 12" of one or more ADEPTUS ASTARTES units from your army, you can re-roll the Hit roll.

8. **Litanies of the Devout** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002792.json
   - Description: While this unit is leading a unit and contains a Chaplain Grimaldus model, each time a model in that unit makes a melee attack, you can re-roll the Hit roll.

9. **Merciless Denunciation** (Enhancement (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CHAPLAIN or JUDICIAR model only. Each time a model in the bearer’s unit makes a melee attack, you can re-roll the Hit roll .

---

### Pattern: rerollWound

**Total entries**: 8

**Unique entries**: 8

1. **War Howl** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000285.json
   - Description: While this model is leading a BLOOD CLAWS unit, each time a model in that unit makes a melee attack, you can re-roll the Wound roll. While this model is leading a WOLF GUARD HEADTAKERS unit, that unit is eligible to declare a charge in a turn in which it Advanced.

2. **Judgement of the Omnissiah** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000306.json
   - Description: Each time this model makes an attack that targets an enemy unit within Engagement Range of one or more friendly ADEPTUS ASTARTES VEHICLE units, you can re-roll the Wound roll.

3. **Unto the Anvil** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002100.json
   - Description: While this model is leading a unit, each time a model in that unit makes a melee attack, you can re-roll the Wound roll.

4. **Sternguard Focus** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002255.json
   - Description: Each time a model in this unit makes an attack that targets your Oath of Moment target , you can re-roll the Wound roll.

5. **Virtuous Onslaught** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004137.json
   - Description: Each time a model in this unit makes an attack that targets the closest eligible target, re-roll a Wound roll of 1.

6. **Wrath of Dorn** (Detachment Ability (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a model from your army with the Oath of Moment ability makes an attack that targets your Oath of Moment target, you can re-roll a Wound roll of 1. Each time a model in a DARNATH LYSANDER unit from your army makes an attack that targets your Oath of Moment target, you can re-roll the Wound roll. RESTRICTIONS Your army can include IMPERIAL FISTS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

7. **Calculated Annihilation** (Detachment Ability (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a model from your army with the Oath of Moment ability makes an attack that targets your Oath of Moment target, you can re-roll a Wound roll of 1.

8. **A Noble Death in Combat** (Detachment Ability (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Each time a DEATH COMPANY model from your army makes a melee attack, re-roll a Wound roll of 1 if that model’s unit is below its Starting Strength ; if that model’s unit is Below Half-strength , you can re-roll the Wound roll instead. KEYWORDS If you select this Detachment, DEATH COMPANY MARINES and DEATH COMPANY MARINES WITH BOLT RIFLES units from your army have the BATTLELINE keyword. RESTRICTIONS Your army can include BLOOD ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter.

---

### Pattern: rerollHit, rerollWound

**Total entries**: 6

**Unique entries**: 5

1. **Martial Superiority** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001167.json, datasheets/000002234.json
   - Description: Each time this model makes a melee attack that targets a CHARACTER unit, you can re-roll the Hit roll and you can re-roll the Wound roll.

2. **Total Obliteration** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000103.json
   - Description: Each time a ranged attack made by a model in this unit targets a MONSTER or VEHICLE model, you can re-roll the Hit roll, you can re-roll the Wound roll and you can re-roll the Damage roll.

3. **Champion of the Kingsguard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000317.json
   - Description: Each time this model makes a melee attack that targets a CHARACTER unit, you can re-roll the Hit roll and you can re-roll the Wound roll.

4. **Overwhelming Short-range Firepower** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001163.json
   - Description: Each time this model makes an attack that targets the closest eligible enemy unit, re-roll a Hit roll of 1 and re-roll a Wound roll or 1.

5. **Legacy of the Angel** (Detachment Ability (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of the first battle round, select two of the Angelic Legacy abilities listed below. Until the end of the battle, those Angelic Legacy abilities are active and their effects apply to all ADEPTUS ASTARTES CHARACTER units from your army. Sanguinary Grace: This unit is eligible to shoot and declare a charge in a turn in which it Fell Back . Carmine Wrath: Each time a model in this unit makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1. Their Appointed Hour: You can re-roll Advance and Charge rolls made for this unit. Restrictions Your army can include BLOOD ANGELS units, but it cannot include ADEPTUS ASTARTES units drawn from any other Chapter .

---

### Pattern: shootingPhase, rerollWound

**Total entries**: 3

**Unique entries**: 3

1. **Fire Support** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000129.json
   - Description: In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks, Until the end of the phase, each time a friendly model that disembarked from this Transport this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll.

2. **Fire Support** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002720.json
   - Description: In your Shooting phase, after this model has shot, select one enemy unit it scored one or more hits against this phase. Until the end of the phase, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, you can re-roll the Wound roll.

3. **MARKED FOR DESTRUCTION** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: Two ADEPTUS ASTARTES units from your army (excluding BEASTS ) that have not been selected to shoot this phase. EFFECT: Select one enemy unit visible to both of your units. Until the end of the phase, models in your units can only target that enemy unit (and only if it is an eligible target) and each time a model in one of your units makes an attack, re-roll a Wound roll of 1.

---

### Pattern: rerollHit, rerollWound, rerollAll

**Total entries**: 2

**Unique entries**: 2

1. **Aquilon Optics** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002705.json
   - Description: Each time this model is selected to shoot, you can re-roll one Hit roll, you can re-roll one Wound roll and you can re-roll one Damage roll when resolving those attacks.

2. **Aquilon Optics** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002787.json
   - Description: Each time this model is selected to shoot, you can re-roll one Hit roll, you can re-roll one Wound roll and you can re-roll one Damage roll when resolving its attacks.

---

### Pattern: commandPhase, rerollWound, oncePerBattle

**Total entries**: 2

**Unique entries**: 2

1. **Extremis-level Threat** (Detachment Ability (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle, in your Command phase, you can use this ability. If you do, until the start of your next Command phase, each time a model from your army with the Oath of Moment ability makes an attack that targets your Oath of Moment target, you can re-roll the Wound roll as well.

2. **Sacred Oath** (Detachment Ability (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle, at the start of your Command phase, when you select a target for Oath of Moment , you can use this Detachment rule. If you do, until the start of your next Command phase, each time an ADEPTUS ASTARTES model from your army makes an attack that targets your Oath of Moment target, you can re-roll the Wound roll .

---

### Pattern: fightPhase, rerollHit, rerollSave, feelNoPain, invulnerableSave

**Total entries**: 1

**Unique entries**: 1

1. **Bladeguard** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000071.json
   - Description: At the start of the Fight phase, you can select one of the following abilities to apply to models in this unit until the end of the phase: Swords of the Chapter: Each time a model in this unit makes a melee attack, re-roll a Hit roll of 1. Shields of the Chapter: Each time an invulnerable saving throw is made for a model in this unit, re-roll a saving throw of 1.

---

### Pattern: chargePhase, rerollHit, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **High King of Fenris** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000283.json
   - Description: Once per battle, in your Charge phase, this model can use this ability. If it does, until the end of the turn, you can re-roll Charge rolls made for ADEPTUS ASTARTES units from your army and, until the end of the turn, each time an ADEPTUS ASTARTES model from your army makes a melee attack, you can re-roll the Hit roll.

---

### Pattern: rerollWound, rerollAll

**Total entries**: 1

**Unique entries**: 1

1. **Tank Commander** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001524.json
   - Description: While this model is commanding a VEHICLE model (see below): Ranged weapons equipped by that VEHICLE model have a Ballistic Skill characteristic of 2+. Each time that VEHICLE model is selected to shoot, you can re-roll one Wound roll when resolving those attacks.

---

### Pattern: rerollHit, oncePerTurn, stratagemCostReduction

**Total entries**: 1

**Unique entries**: 1

1. **Visions of Heresy** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002285.json
   - Description: Once per turn, you can target this unit with the Fire Overwatch or the Heroic Intervention Stratagem for 0CP. While resolving that Stratagem, each time a model in this unit makes a ranged attack you can re-roll the Hit roll, or you can re-roll the Charge roll made for this unit (whichever applies).

---

### Pattern: rerollHit, rerollWound, aura

**Total entries**: 1

**Unique entries**: 1

1. **Martial Exemplar (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, each time a model in that unit makes a melee attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.

---

### Pattern: rerollHit, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Vehement Aggression** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002793.json
   - Description: While this model is leading a unit, each time that unit is selected to fight, take a Leadership test for that unit: if passed, until the end of the phase, each time a model in that unit makes an attack, you can re-roll the Hit roll; if failed, until the end of the phase, each time a model in that unit makes an attack, re-roll a Hit roll of 1.

---

### Pattern: shootingPhase, rerollHit, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **Legacy of Jerulas** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004139.json
   - Description: In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly model that disembarked from this TRANSPORT this turn makes an attack that targets that enemy unit, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.

---

### Pattern: rerollHit, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **The Tome of Ectoclades** (Enhancement (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WATCH MASTER or CAPTAIN model only. Once per battle, after you have selected your Oath of Moment target , the bearer can use this Enhancement. If it does, select a second enemy unit to be an Oath of Moment target. Designer’s Note: This means that each time a model with the Oath of Moment ability makes an attack that targets either of your Oath of Moment targets, you can re-roll the Hit roll .

---

### Pattern: fightPhase, rerollHit, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **PIOUS ENMITY** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One CHAPLAIN or JUDICIAR unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a melee attack that targets an enemy unit, re-roll a Hit roll of 1. If that target is a MONSTER or VEHICLE unit, re-roll a Wound roll of 1 as well.

---

### Pattern: fightPhase, rerollWound

**Total entries**: 1

**Unique entries**: 1

1. **CONDEMNATORY INFO-SCREED** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, if it disembarked from a TRANSPORT this turn, re-roll a Wound roll of 1. If that TRANSPORT has the LAND RAIDER keyword, you can re-roll the Wound roll instead.

---

### Pattern: rerollHit, rerollWound, rerollAll, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Armoured Wrath** (Detachment Ability (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per phase for each ADEPTUS ASTARTES unit in your army, you can re-roll one Hit roll , one Wound roll or one Damage roll made for a model in that unit.

---

### Pattern: shootingPhase, fightPhase, rerollHit

**Total entries**: 1

**Unique entries**: 1

1. **CHAMPION’S GUIDANCE** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase or the Fight phase. TARGET: One SPACE WOLVES CHARACTER unit from your army that has not been selected to shoot or fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, you can re-roll the Hit roll.

---

### Pattern: fightPhase, rerollHit, rerollWound, rerollAll

**Total entries**: 1

**Unique entries**: 1

1. **BRUTE FERVOUR** (Stratagem (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack, re-roll a Hit roll of 1 and you can ignore any or all modifiers to the following: that attack’s Weapon Skill characteristic; the Hit roll; the Wound roll.

---

## Battleshock Leadership (35 entries)

### Pattern: battleshock

**Total entries**: 7

**Unique entries**: 7

1. **Savage Frenzy** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000311.json
   - Description: Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of this unit Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests.

2. **Terminatus Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003873.json
   - Description: You can re-roll Charge rolls made for this unit. Each time this unit ends a Charge move, each enemy unit within Engagement Range of this unit must take a Battle-shock test. If that enemy unit does not have the IMPERIUM or CHAOS keywords, subtract 1 from that test.

3. **Unflinching** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: You can re-roll Battle-shock tests for this unit.

4. **Judgement of the Weak** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004138.json
   - Description: Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of this unit Falls Back, all models in that enemy unit must take a Desperate Escape test. When doing so, if that enemy unit is Battle-shocked, subtract 1 from each of those tests.

5. **Foes’ Fate** (Enhancement (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. Each time an enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of the bearer’s unit Falls Back , all models in that enemy unit must take Desperate Escape tests . When doing so, if that enemy unit is Battle-shocked , subtract 1 from each of those tests.

6. **Battle-psalm Precentor** (Enhancement (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time the bearer’s unit declares a charge , if an enemy unit takes a Battle-shock test as a result of the Shock and Awe Detachment rule, subtract 1 from that Battle-shock test.

7. **Carmine Reliquary** (Enhancement (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CHAPLAIN model only. Models in the bearer’s unit have the Scouts 6" ability. Each time you take a Battle-shock test for an ADEPTUS ASTARTES unit within 6" of the bearer, you can re-roll the result.

---

### Pattern: battleshock, aura

**Total entries**: 6

**Unique entries**: 6

1. **Transfixing Gaze (Aura, Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000155.json
   - Description: While an enemy unit is within 6" of this model, each time that unit is selected to Fall Back, it must take a Leadership test. If that test is failed, that unit must Remain Stationary this phase instead.

2. **Aura of Fervour (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000156.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, you can re-roll Battle-shock and Leadership tests taken for that unit.

3. **Hunting Hounds** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000323.json
   - Description: While this unit is within 6" of one or more friendly SPACE WOLVES CHARACTER models (excluding WULFEN models), if this unit is not Battle-shocked, models in it have an Objective Control characteristic of 1.

4. **Hunting Hounds** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004131.json
   - Description: While this unit is within 6" of one or more friendly SPACE WOLVES CHARACTER models (excluding WULFEN models), if this unit is not Battle-shocked, HUNTING WOLVES models in it have an Objective Control characteristic of 1.

5. **Hunting Hounds** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004182.json
   - Description: While this unit is within 6" of one or more friendly SPACE WOLVES CHARACTER models (excluding WULFEN models), if this unit is not Battle-shocked, Hunting Wolves models in this unit have an Objective Control characteristic of 1.

6. **Tempered in Battle (Aura)** (Enhancement (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While a friendly ADEPTUS ASTARTES unit is within 6" of this model, you can re-roll Battle-shock and Leadership tests taken for that unit.

---

### Pattern: fightPhase, battleshock

**Total entries**: 5

**Unique entries**: 5

1. **Terminatus Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000118.json
   - Description: At the start of the Fight phase, each enemy unit within Engagement Range of this unit must take a Battle-shock test.

2. **Death Mask of Sanguinius** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000151.json
   - Description: At the start of the Fight phase, each enemy unit within 6" of this model must take a Battle-shock test, subtracting 1 from that test when they do.

3. **Fearsome Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002718.json
   - Description: At the start of the Fight phase, each enemy unit within Engagement Range of one or more units with this ability must take a Battle-shock test, subtracting 1 from that test.

4. **Howlmaw** (Enhancement (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WOLF PRIEST model only. At the start of the Fight phase, you can select one enemy unit within 6" of the bearer. That unit must take a Battle-shock , subtracting 1 from the result.

5. **Taramond’s Censer** (Enhancement (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: BLACK TEMPLARS model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer’s unit must take a Battle-shock test . When doing so, subtract 1 from the result.

---

### Pattern: battleshock, oncePerBattle

**Total entries**: 5

**Unique entries**: 2

1. **Inspiring Leader** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000002802.json, datasheets/000002803.json, datasheets/000002804.json
   - Description: While this model is leading a unit, once per battle, when a Battle-shock test is taken for that unit, you can re-roll that test.

2. **Spiritual Leader** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001174.json, datasheets/000001192.json
   - Description: Once per battle, at the start of any phase, you can select one friendly ADEPTUS ASTARTES unit that is Battle-shocked and within 12" of this model. That unit is no longer Battle-shocked.

---

### Pattern: shootingPhase, battleshock

**Total entries**: 4

**Unique entries**: 4

1. **Engulfing Fear (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000226.json
   - Description: In your Shooting phase, you can select one enemy unit within 18" of this model. That enemy unit must take a Battle-shock test.

2. **The Fierce Eye** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000286.json
   - Description: In your Shooting phase, you can select one enemy INFANTRY unit within 12" of and visible to this model. That enemy unit must take a Battle-shock test.

3. **Pinning Bombardment** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002727.json
   - Description: In your Shooting phase, after this model has shot, if one or more of those attacks made with its Whirlwind vengeance launcher scored a hit against an enemy INFANTRY unit, that unit must take a Battle-shock test.

4. **Pinning Bombardment** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002728.json
   - Description: In your Shooting phase, after this model has shot, if one or more of those attacks made with its Scorpius multi-launcher scored a hit against an enemy INFANTRY unit, that unit must take a Battle-shock test.

---

### Pattern: movementPhase, battleshock

**Total entries**: 3

**Unique entries**: 3

1. **AGGRESSIVE ONSLAUGHT** (Stratagem (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an Adeptus Astartes unit from your army has Advanced. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the turn, your unit is eligible to either shoot or declare a charge, even though it Advanced. You can instead choose for your unit to give in to the Red Thirst; if it does, it becomes Battle-shocked (but the effects of this Stratagem still apply to it) and until the end of the turn, your unit is eligible to both shoot and declare a charge, even though it Advanced.

2. **RELENTLESS ASSAULT** (Stratagem (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES unit from your army Falls Back. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the turn, your unit is eligible to either shoot or declare a charge even though it Fell Back. You can instead choose for your unit to give in to the Red Thirst ; if it does, it becomes Battle-shocked (but the effects of this Stratagem still apply to it) and until the end of the turn, your unit is eligible to both shoot and declare a charge, even though it Fell Back.

3. **RED WRATH** (Stratagem (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES unit from your army Advances. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the turn, your unit is eligible to either shoot or declare a charge in a turn in which it Advanced. You can instead choose for your unit to give in to the Red Thirst; if it does, it becomes Battle-shocked (but the effects of this Stratagem still apply to it), and until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced.

---

### Pattern: chargePhase, battleshock

**Total entries**: 2

**Unique entries**: 2

1. **VOX-AMPLIFIED ROAR** (Stratagem (Boarding Strike))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Charge phase, just after an ADEPTUS ASTARTES unit from your army declares a charge. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Each target of that charge must take a Battle-shock test.

2. **DREAD CRUSADERS** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Charge phase, just after an enemy unit declares a charge. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that was selected as one of the targets of that charge. EFFECT: That enemy unit must take a Battle-shock test, subtracting 1 from the result.

---

### Pattern: battleshock, feelNoPain, aura

**Total entries**: 1

**Unique entries**: 1

1. **Stoic Defender** (Enhancement (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, models in that unit have the Feel No Pain 6+ ability while they are within range of an objective marker you control and, while that unit is Battle-shocked , halve the Objective Control characteristic of models in that unit instead of changing it to 0.

---

### Pattern: commandPhase, battleshock

**Total entries**: 1

**Unique entries**: 1

1. **Visage of Death** (Enhancement (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES JUMP PACK model only. In the Battle-shock step of your opponents Command phase, each enemy unit (excluding MONSTERS and VEHICLES ) within Engagement Range of the bearer must take a Battle-shock test.

---

### Pattern: battleshock, feelNoPain

**Total entries**: 1

**Unique entries**: 1

1. **Pennant of Remembrance** (Enhancement (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ANCIENT model only. While the bearer is leading a unit, models in that unit have the Feel No Pain 6+ ability. While that unit is Battle-shocked , models in that unit have the Feel No Pain 4+ ability instead.

---

## Defensive Abilities (61 entries)

### Pattern: invulnerableSave

**Total entries**: 22

**Unique entries**: 6

1. **Storm Shield** (Unit Ability)
   - Count: 10 occurrence(s)
   - Sources: datasheets/000000147.json, datasheets/000000301.json, datasheets/000000315.json, datasheets/000000322.json, datasheets/000001154.json, ... and 5 more
   - Description: The bearer has a 4+ invulnerable save.

2. **Astartes Shield** (Unit Ability)
   - Count: 5 occurrence(s)
   - Sources: datasheets/000000061.json, datasheets/000000064.json, datasheets/000002103.json, datasheets/000002783.json, datasheets/000004175.json
   - Description: The bearer has a 4+ invulnerable save.

3. **Mental Fortress (Psychic)** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001348.json, datasheets/000002266.json
   - Description: While this model is leading a unit, models in that unit have a 4+ invulnerable save.

4. **Shield Dome** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002568.json, datasheets/000002786.json
   - Description: The bearer has a 5+ invulnerable save.

5. **Blizzard Shield** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002801.json, datasheets/000004133.json
   - Description: The bearer has a 4+ invulnerable save.

6. **Consecrating Aura** (Enhancement (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Models in the bearer’s unit have a 5+ invulnerable save .

---

### Pattern: feelNoPain

**Total entries**: 16

**Unique entries**: 12

1. **Sanguinary Priest** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000000158.json, datasheets/000000159.json, datasheets/000000160.json, datasheets/000002738.json
   - Description: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability.

2. **Helix Gauntlet** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000128.json, datasheets/000002779.json
   - Description: Models in the bearer’s unit have the Feel No Pain 6+ ability.

3. **Recitation of Faith** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000115.json
   - Description: While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against mortal wounds.

4. **Rites of Tempering** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000127.json
   - Description: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability.

5. **Huskarl to the Jarl** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000300.json
   - Description: While this model is attached to a unit that contains another CHARACTER model, all CHARACTER models in that unit have the Feel No Pain 4+ ability.

6. **Honour Guard of Macragge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002199.json
   - Description: While this unit contains one or more Victrix Honour Guard models, this unit’s MARNEUS CALGAR model has the Feel No Pain 4+ ability.

7. **Armour of Antoninus** (Enhancement (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has a Save characteristic of 2+ and the Feel No Pain 5+ ability.

8. **Artificer Armour** (Enhancement (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has a Save characteristic of 2+ and the Feel No Pain 5+ ability.

9. **The Flesh is Weak** (Enhancement (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has the Feel No Pain 4+ ability.

10. **ANGELIC GRACE** (Stratagem (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase, just after an ADEPTUS ASTARTES unit from your army has a mortal wound allocated to it. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds.

11. **Fenrisian Grit** (Enhancement (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has the Feel No Pain 4+ ability.

12. **FUELLED BY FAITH** (Stratagem (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Any phase, just after a mortal wound is allocated to an ADEPTUS ASTARTES unit from your army. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds.

---

### Pattern: feelNoPain, psychic

**Total entries**: 9

**Unique entries**: 4

1. **Psychic Hood** (Unit Ability)
   - Count: 6 occurrence(s)
   - Sources: datasheets/000000079.json, datasheets/000000119.json, datasheets/000000226.json, datasheets/000001344.json, datasheets/000001348.json, ... and 1 more
   - Description: While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against Psychic Attacks.

2. **Hood of Hellfire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001611.json
   - Description: While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against Psychic Attacks and mortal wounds.

3. **The Spiritshield Helm** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002296.json
   - Description: This model has the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds.

4. **Psychic Hood** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: Models in the bearer’s unit have the Feel No Pain 4+ ability against Psychic Attacks.

---

### Pattern: feelNoPain, oncePerBattle

**Total entries**: 4

**Unique entries**: 3

1. **Watcher in the Dark** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000230.json, datasheets/000000231.json
   - Description: Once per battle, in any phase, just after a mortal wound is allocated to an ADEPTUS ASTARTES model in this unit, this unit can summon a Watcher in the Dark. When it does, until the end of the phase, models in this unit have the Feel No Pain 4+ ability against mortal wounds. Designer’s Note: Place a Watcher in the Dark token next to the unit, removing it when this ability has been used.

2. **Iron Resolve** (Enhancement (1st Company Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. The bearer has the Feel No Pain 5+ ability. Once per battle, after the bearer’s unit is selected as the target of one or more attacks, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Feel No Pain 5+ ability.

3. **Gift of Foresight** (Enhancement (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle round, just after making a Hit roll , a Wound roll or a saving throw for the bearer, you can treat the result as an unmodified roll of 6 instead.

---

### Pattern: feelNoPain, oncePerTurn

**Total entries**: 4

**Unique entries**: 3

1. **Forged in Battle** (Enhancement (Firestorm Assault Force))
   - Count: 2 occurrence(s)
   - Sources: faction.json, faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, once per turn, after making a Hit roll or a saving throw for a model in that unit, you can change the result of that roll to an unmodified 6.

2. **Mantle of the Troll King** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000287.json
   - Description: Once per phase, when resolving an attack made against this model, after you make a saving throw for this model, you can change the Damage characteristic of that attack to 0.

3. **Armour of Faith** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002795.json
   - Description: Once per phase, when an attack is allocated to this model and the saving throw is failed, you can change the Damage characteristic of that attack to 0.

---

### Pattern: invulnerableSave, oncePerBattle

**Total entries**: 2

**Unique entries**: 2

1. **Rampart** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002105.json
   - Description: Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, this model has a 2+ invulnerable save.

2. **Seal of Indomitability** (Enhancement (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle, when the bearer’s unit is selected as the target of one or more attacks, it can use this Enhancement. If it does, until the end of the phase, the bearer has a 3+ invulnerable save .

---

### Pattern: feelNoPain, aura

**Total entries**: 2

**Unique entries**: 2

1. **No Hiding From the Watchers (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, models in that unit have the Feel No Pain 4+ ability against mortal wounds.

2. **Seeker of Lost Relics** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002726.json
   - Description: The first time this model is set up on the battlefield, select one objective marker on the battlefield. While this model is within range of that objective marker, this model has an Objective Control characteristic of 10, a Leadership characteristic of 5+ and the Feel No Pain 4+ ability.

---

### Pattern: feelNoPain, aura, psychic

**Total entries**: 1

**Unique entries**: 1

1. **Shield of Sanguinius (Aura, Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000154.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, models in that unit have the Feel No Pain 5+ ability against mortal wounds and Psychic Attacks.

---

### Pattern: shootingPhase, fightPhase, feelNoPain

**Total entries**: 1

**Unique entries**: 1

1. **INSENSATE RAMPAGE** (Stratagem (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets. TARGET: One DEATH COMPANY unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 5+ ability.

---

## Limited Use (68 entries)

### Pattern: oncePerBattle

**Total entries**: 43

**Unique entries**: 7

1. **One Shot** (Unit Ability)
   - Count: 36 occurrence(s)
   - Sources: datasheets/000000065.json, datasheets/000000066.json, datasheets/000000067.json, datasheets/000000085.json, datasheets/000000092.json, ... and 31 more
   - Description: The bearer can only shoot with this weapon once per battle.

2. **Haywire Mine** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001159.json, datasheets/000004182.json
   - Description: Once per battle, at the start of any phase, you can select one enemy unit within 3" of the bearer and roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds, or 2D3 mortal wounds instead if it is a VEHICLE unit.

3. **Armorium Cherub** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000326.json
   - Description: Once per battle, after making a Hit roll for a model in this unit, you can change that roll to an unmodified 6. Designer’s Note: Place an Armorium Cherub token next to the unit, removing it once this ability has been used.

4. **Inviolable Transport** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001189.json
   - Description: Once per battle round, when an attack is allocated to this model, you can change the Damage characteristic of that attack to 0.

5. **Armorium Cherub** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002202.json
   - Description: Once per battle, after making a Hit roll for a model in this unit, you can change that roll to an unmodified 6.

6. **Recalculating** (Detachment Ability (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle round, after your Oath of Moment target is destroyed, if a CAANOK VAR model from your army is on the battlefield, select one enemy unit visible to that model. That enemy unit becomes your Oath of Moment target until you select a new one.

7. **Howling Onslaught** (Detachment Ability (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle, when selecting a Hunting Pack for the Master of Wolves Detachment rule, if a LOGAN GRIMNAR model from your army is on the battlefield, you can select a Hunting Pack you have already selected this battle.

---

### Pattern: oncePerBattle, stratagemCostReduction

**Total entries**: 13

**Unique entries**: 4

1. **Rites of Battle** (Unit Ability)
   - Count: 10 occurrence(s)
   - Sources: datasheets/000000067.json, datasheets/000000073.json, datasheets/000000083.json, datasheets/000000096.json, datasheets/000000135.json, ... and 5 more
   - Description: Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.

2. **Watch Master** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003871.json
   - Description: Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.

3. **Grimnar’s Mark** (Enhancement (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR CAPTAIN model only. Once per battle round, from the second battle round onwards, you can target the bearer’s unit with the Rapid Ingress or Heroic Intervention Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this turn. In the Declare Battle Formations step, the bearer can be attached to a WOLF GUARD TERMINATORS unit.

4. **Unparalleled Tactician** (Detachment Ability (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Once per battle round, if an AETHON SHAAN model from your army is on the battlefield, you can use the Into Darkness Stratagem for 0CP.

---

### Pattern: fightPhase, oncePerBattle

**Total entries**: 4

**Unique entries**: 4

1. **Speed of the Primarch** (Enhancement (Liberator Assault Group))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Fights First ability.

2. **Master of the Red Thirst** (Enhancement (Rage-cursed Onslaught))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Fights First ability.

3. **Elder’s Guidance** (Enhancement (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. Once per battle, at the start of the Fight phase, if the bearer is leading a BLOOD CLAWS unit, the bearer can use this Enhancement. If it does, until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.

4. **Sacred Rage** (Enhancement (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle, at the start of the Fight phase, the bearer can use this Enhancement. If it does, until the end of the phase, models in the bearer’s unit have the Fights First ability.

---

### Pattern: oncePerTurn, stratagemCostReduction

**Total entries**: 2

**Unique entries**: 2

1. **Defensive Array** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000097.json
   - Description: You can target this FORTIFICATION with the Fire Overwatch Stratagem for 0CP, and can do so even if you have already targeted another unit with that Stratagem this turn. This FORTIFICATION can only be targeted with that Stratagem once per turn.

2. **Sentry Programming** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000099.json
   - Description: You can target this model with the Fire Overwatch Stratagem for 0CP, and can do so even if you have already targeted a different unit with that Stratagem this turn. This model can only be targeted with that Stratagem once per turn.

---

### Pattern: commandPhase, oncePerBattle

**Total entries**: 2

**Unique entries**: 2

1. **Troubling Visions** (Enhancement (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Once per battle, in your Command phase, the bearer can use this Enhancement. When it does, until the start of your next Command phase, all Angelic Legacy abilities are active for the bearer’s unit, instead of only two of them.

2. **Combat Doctrines** (Detachment Ability (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of your Command phase, you can select one of the Combat Doctrines listed below. Until the start of your next Command phase, that Combat Doctrine is active and its effects apply to all ADEPTUS ASTARTES units from your army. You can only select each Combat Doctrine once per battle. Devastator Doctrine The Codex Astartes details the strategic value of overwhelming firepower applied to key targets while advancing into position to eliminate threats. This unit is eligible to shoot in a turn in which it Advanced . Tactical Doctrine As the warring armies close upon one another and vicious fire-fights erupt, the Codex lays out strategies for swiftly seizing the initiative and combining versatility with firepower. This unit is eligible to shoot and declare a charge in a turn in which it Fell Back . Assault Doctrine The Codex Astartes leaves no doubt that the killing blow in most engagements must be delivered with a decisive close-quarters strike. It presents plentiful tactical means to achieve this end. This unit is eligible to declare a charge in a turn in which it Advanced .

---

### Pattern: oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Hailstrike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000124.json
   - Description: Each time this model has shot, select one enemy unit (excluding MONSTERS and VEHICLES ) hit by one or more of those attacks. Until the end of the phase, each time a friendly ADEPTUS ASTARTES unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per phase.

---

### Pattern: movementPhase, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **High King of Fenris** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000282.json
   - Description: Once per battle round, in your Movement phase, you can select one friendly SPACE WOLVES unit that is in Reserves. If you do, until the end of the phase, for the purpose of setting up that unit on the battlefield, treat the current battle round number as being one higher than it actually is.

---

### Pattern: chargePhase, oncePerTurn

**Total entries**: 1

**Unique entries**: 1

1. **Emergency Combat Embarkation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002721.json
   - Description: Once per turn, in your opponent’s Charge phase, after an enemy unit has selected targets for its charge but before it makes a Charge move, you can select one ADEPTUS ASTARTES unit from your army that was selected as a target of that charge. Provided that unit is not within Engagement Range of one or more enemy units and every model in that unit is within 3" of this TRANSPORT , it can embark within this TRANSPORT . The charging unit can then select new targets for its charge.

---

### Pattern: shootingPhase, oncePerBattle

**Total entries**: 1

**Unique entries**: 1

1. **Fleet Commander** (Enhancement (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CAPTAIN model only. Once per battle, at the start of your Shooting phase, you can select one point on the battlefield and place a marker on that point. At the start of your next Shooting phase, place another marker on the battlefield within 12" of the centre of the first marker, then draw a straight line between the centre of each of these markers. Roll one D6 for each unit that line passes over or through: on a 3+, that unit suffers D3 mortal wounds . Both markers are then removed.

---

## Stratagem Related (9 entries)

### Pattern: stratagemCostReduction

**Total entries**: 9

**Unique entries**: 8

1. **Honour or Death** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000001167.json, datasheets/000002234.json
   - Description: While this model is leading a unit, add 1 to Advance and Charge rolls made for that unit and you can target that unit with the Heroic Intervention Stratagem for 0CP, even if you have already used that Stratagem on a different unit this phase.

2. **Honour or Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000095.json
   - Description: While this unit contains a CHAPTER CHAMPION , add 1 to Advance and Charge rolls made for this unit and you can target this unit with the Heroic Intervention Stratagem for 0CP.

3. **Honour or Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002103.json
   - Description: While this unit contains a Company Champion, add 1 to Advance and Charge rolls made for this unit and you can target this unit with the Heroic Intervention Stratagem for 0CP, even if you have already used that Stratagem on a different unit this phase.

4. **Honour or Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002302.json
   - Description: While this unit contains a Company Champion, add 1 to Advance and Charge rolls made for this unit and you can target this unit with the Heroic Intervention Stratagem for 0CP.

5. **Honour or Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002748.json
   - Description: While this unit contains a Ravenwing Champion, add 1 to Advance and Charge rolls made for this unit and you can target this unit with the Heroic Intervention Stratagem for 0CP.

6. **Blackwing Mantle** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004148.json
   - Description: You can target this model’s unit with the Rapid Ingress and Heroic Intervention Stratagems for 0CP, even if you have already used that Stratagem on a different unit this phase.

7. **Honour or Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004184.json
   - Description: You can target this unit with the Heroic Intervention Stratagem for 0CP, even if you have already used that Stratagem on a different unit this phase.

8. **Beacon Angelis** (Enhancement (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Models in the bearer’s unit have the Deep Strike ability. In addition, you can target the bearer’s unit with the Rapid Ingress Stratagem for 0CP.

---

## Unit Restoration (7 entries)

### Pattern: commandPhase, restoreModels

**Total entries**: 7

**Unique entries**: 6

1. **Narthecium** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000063.json, datasheets/000002773.json
   - Description: While this model is leading a unit, in your Command phase, you can return 1 destroyed model (excluding CHARACTER models) to that unit.

2. **Narthecium** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002103.json
   - Description: While this unit contains an APOTHECARY , in your Command phase, you can return 1 destroyed model (excluding CHARACTER models) to this unit.

3. **Narthecium** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002302.json
   - Description: While this unit contains an Apothecary, in your Command phase, you can return 1 destroyed model (excluding CHARACTER models) to this unit.

4. **Narthecium** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002748.json
   - Description: While this unit contains a Ravenwing Apothecary, in your Command phase, you can return 1 destroyed model (excluding CHARACTER and INVADER ATV models) to this unit.

5. **Healing Balms** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004129.json
   - Description: While this model is leading a unit, in your Command phase, you can return 1 destroyed model (excluding CHARACTER models) to that unit.

6. **Steel Font** (Enhancement (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. While the bearer is leading a unit, in your Command phase, you can return 1 destroyed Bodyguard model to that unit.

---

## Aura Effects (12 entries)

### Pattern: aura

**Total entries**: 10

**Unique entries**: 8

1. **Orbital Comms Array (Aura)** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000085.json, datasheets/000002568.json, datasheets/000002786.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of the bearer, each time you target that unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.

2. **Shrouding (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000119.json
   - Description: While this model is leading a unit, models in that unit have the Stealth ability and that unit cannot be targeted by ranged attacks unless the attacking model is within 12".

3. **Icon of Old Caliban (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000238.json
   - Description: While a friendly ADEPTUS ASTARTES unit is within 6" of this model, models in that unit have the Stealth ability and each time a ranged attack targets that unit, that unit has the Benefit of Cover against that attack.

4. **Nowhere to Hide** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001423.json
   - Description: While a friendly ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES FLY VEHICLE unit is within 6" of this model, ranged weapons equipped by models in that unit have the [IGNORES COVER] ability.

5. **Lord of the Pyroclasts** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002100.json
   - Description: While an enemy unit is within Engagement Range of this model, halve the Objective Control characteristic of models in that enemy unit.

6. **Shadowmaster** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002708.json
   - Description: While this model is leading a unit, models in this unit cannot be targeted by ranged attacks unless the attacking model is within 12".

7. **Fervour of the Ancients (Aura)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002801.json
   - Description: While a friendly SPACE WOLVES unit is within 6" of this model, add 1 to Advance and Charge rolls made for that unit.

8. **Forlorn Hero** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003832.json
   - Description: While this model is leading a unit, unless that unit starts the battle embarked within a TRANSPORT , models in that unit have the Scouts 6" ability.

---

### Pattern: saveBonus, aura

**Total entries**: 1

**Unique entries**: 1

1. **Unyielding in the Face of the Foe** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001177.json
   - Description: While this unit is within range of an objective marker you control, each time an attack with a Damage characteristic of 1 is allocated to a model in this unit, add 1 to any armour saving throw made against that attack.

---

### Pattern: commandPhase, aura

**Total entries**: 1

**Unique entries**: 1

1. **Master of Shadows** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004148.json
   - Description: In your Command phase, you can select one unit from your opponent’s army. Until the start of your next Command phase, each time an ADEPTUS ASTARTES unit from your army declares a charge while it is within 12" of that enemy unit, you can re-roll the Charge roll, but it must declare that enemy unit as a target of that charge (if possible).

---

## Other (394 entries)

### Pattern: No specific pattern

**Total entries**: 299

**Unique entries**: 229

1. **Hover** (Unit Ability)
   - Count: 13 occurrence(s)
   - Sources: datasheets/000000072.json, datasheets/000000113.json, datasheets/000000139.json, datasheets/000000239.json, datasheets/000000240.json, ... and 8 more
   - Description: Some aircraft can use vectored thrusters or anti-grav technology to hover over the battlefield, the better to hunt their prey or deploy embarked troops. Some AIRCRAFT models have ‘Hover’ listed in their abilities. When you are instructed to Declare Battle Formations, before doing anything else, you must first declare which models from your army with this ability will be in Hover mode. If a model is in Hover mode, then until the end of the battle, its Move characteristic is changed to 20", it loses the AIRCRAFT keyword and it loses all associated rules for being an AIRCRAFT model. Models in Hover mode do not start the battle in Reserves, but you can choose to place them into Strategic Reserves following the normal rules if you wish.

2. **Infiltrators** (Unit Ability)
   - Count: 12 occurrence(s)
   - Sources: datasheets/000000076.json, datasheets/000000119.json, datasheets/000000128.json, datasheets/000000310.json, datasheets/000001160.json, ... and 7 more
   - Description: Many armies employ reconnaissance units who can sit concealed, waiting for the right moment to strike. During deployment, if every model in a unit has this ability, then when you set it up, it can be set up anywhere on the battlefield that is more than 9" horizontally away from the enemy deployment zone and all enemy models.

3. **Assault Ramp** (Unit Ability)
   - Count: 11 occurrence(s)
   - Sources: datasheets/000000065.json, datasheets/000000066.json, datasheets/000000067.json, datasheets/000001184.json, datasheets/000001347.json, ... and 6 more
   - Description: Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn.

4. **Storm Shield** (Unit Ability)
   - Count: 5 occurrence(s)
   - Sources: datasheets/000000118.json, datasheets/000000318.json, datasheets/000002302.json, datasheets/000002803.json, datasheets/000003873.json
   - Description: The bearer has a Wounds characteristic of 4.

5. **Tactical Precision** (Unit Ability)
   - Count: 5 occurrence(s)
   - Sources: datasheets/000000301.json, datasheets/000001345.json, datasheets/000001346.json, datasheets/000002468.json, datasheets/000002530.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.

6. **Relic Shield** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000000073.json, datasheets/000000083.json, datasheets/000000115.json, datasheets/000000300.json
   - Description: The bearer has a Wounds characteristic of 6.

7. **ATTACHED UNIT** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000002780.json, datasheets/000002798.json, datasheets/000002799.json, datasheets/000004175.json
   - Description: If a CHARACTER from your army with the Leader ability can be attached to an INTERCESSOR SQUAD , it can be attached to this unit instead.

8. **Vanguard Assault** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000147.json, datasheets/000001154.json, datasheets/000001166.json
   - Description: Each time this unit ends a Charge move, until the end of the turn, melee weapons equipped by models in this unit have the [LETHAL HITS] ability.

9. **Fights First** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000155.json, datasheets/000000156.json, datasheets/000002682.json
   - Description: Some warriors attack with blinding speed, landing their blows before their foes can react. Units with this ability that are eligible to fight do so in the Fights First step, provided every model in the unit has this ability.

10. **Blood Chalice** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000158.json, datasheets/000000159.json, datasheets/000002738.json
   - Description: While this model is leading a unit, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.

11. **ATTACHED UNIT** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000000230.json, datasheets/000000231.json, datasheets/000002302.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a TERMINATOR SQUAD , it can be attached to this unit instead.

12. **Conversion** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000001527.json, datasheets/000002268.json, datasheets/000002719.json
   - Description: Each time an attack made with this weapon targets a unit more than 12" from the bearer, an unmodified successful Hit roll of 4+ scores a Critical Hit.

13. **Pack Leader** (Unit Ability)
   - Count: 3 occurrence(s)
   - Sources: datasheets/000002802.json, datasheets/000002803.json, datasheets/000002804.json
   - Description: This model cannot be your Warlord and cannot be given Enhancements.

14. **ATTACHED UNITS** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000061.json, datasheets/000001154.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to an ASSAULT INTERCESSOR SQUAD , it can also be attached to this unit.

15. **Sentinel Protocols** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000086.json, datasheets/000000098.json
   - Description: Each time you select this unit for the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 4+ when resolving that Stratagem.

16. **Infiltrator Comms Array** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000128.json, datasheets/000002779.json
   - Description: Each time you target the bearer’s unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.

17. **SUPREME COMMANDER** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000138.json, datasheets/000002682.json
   - Description: If this model is in your army, it must be your Warlord.

18. **Aerial Assault** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000139.json, datasheets/000001179.json
   - Description: Each time a unit with the Deep Strike ability disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn.

19. **Swift Assault** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000148.json, datasheets/000002702.json
   - Description: While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability.

20. **TYCHO** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000152.json, datasheets/000000153.json
   - Description: Your army cannot contain both CAPTAIN TYCHO and TYCHO THE LOST .

21. **Relic Shield** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000284.json, datasheets/000002702.json
   - Description: The bearer has a Wounds characteristic of 7.

22. **Guerrilla Tactics** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000310.json, datasheets/000001160.json
   - Description: At the end of your opponent’s turn, if this unit is more than 6" away from all enemy models, you can remove this unit from the battlefield and place it into Strategic Reserves.

23. **Storm Shield** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002468.json, datasheets/000004130.json
   - Description: The bearer has a Wounds characteristic of 6.

24. **Assault Vehicle** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000002568.json, datasheets/000002786.json
   - Description: Units can disembark from this TRANSPORT after it has Advanced. Units that do so count as having made a Normal move, and cannot declare a charge that turn.

25. **Surgical Precision** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000060.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.

26. **Vivispectrum** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000060.json
   - Description: If this model’s unit destroys an enemy unit as the result of a melee attack, until the end of the battle, this model has an Objective Control characteristic of 9.

27. **Hammer of Wrath** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000064.json
   - Description: Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound.

28. **ATTACHED UNITS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000064.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to ASSAULT INTERCESSORS WITH JUMP PACKS , it can also be attached to this unit.

29. **Combat Squads** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000070.json
   - Description: At the start of the Declare Battle Formations step, before any units have been set up, this unit can be split into two units, each containing five models.

30. **Into the Foe** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000072.json
   - Description: If a unit disembarks from this TRANSPORT before it moves, until the end of the turn, that unit is eligible to charge in a turn in which it Advanced.

31. **LAST SURVIVOR** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000076.json
   - Description: This model cannot be selected as your Warlord.

32. **Veil of Time (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000079.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.

33. **Lead From the Front** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000081.json
   - Description: While this model is leading a unit, models in that unit have the Scouts 6" ability and ranged weapons equipped by models in that unit have the [ASSAULT] ability.

34. **Combat Disembarkation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000087.json
   - Description: Each time a unit disembarks from this model after it has been set up on the battlefield, that unit is still eligible to declare a charge this turn.

35. **Deployment Complete** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000087.json
   - Description: Once this unit is set up on the battlefield and all units within it have disembarked, until the end of the battle, units cannot embark within this TRANSPORT .

36. **HONOUR GUARD OF MACRAGGE** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000095.json
   - Description: MARNEUS CALGAR can be attached to this unit. If a CAPTAIN model from your army with the LEADER ability can be attached to a COMMAND SQUAD , it can be attached to this unit instead.

37. **Ceramite Cover** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000097.json
   - Description: Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION , that model has the Benefit of Cover against that attack.

38. **Grenade Harness** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000104.json
   - Description: The bearer has the GRENADES keyword.

39. **ATTACHED UNITS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000104.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a TERMINATOR SQUAD , it can also be attached to this unit.

40. **Exhortation of Rage** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000112.json
   - Description: Each time this model’s unit is selected to fight, you can select one enemy unit within Engagement Range of this model’s unit and roll one D6: on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers 3 mortal wounds.

41. **Hammerstrike** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000114.json
   - Description: Each time this model has shot, select one enemy unit that was hit by one or more attacks made by this model this phase. Until the end of the phase, that enemy unit cannot have the Benefit of Cover.

42. **Turbo-boost** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000116.json
   - Description: Each time this unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6" to the Move characteristic of models in this unit.

43. **ATTACHED UNITS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000116.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to an OUTRIDER SQUAD , it can also be attached to this unit.

44. **Omni-scramblers** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000128.json
   - Description: Enemy units that are set up on the battlefield from Reserves cannot be set up within 12" of this unit.

45. **Storm Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000132.json
   - Description: Each time a unit disembarks from this model after it has made a Normal move, that unit is still eligible to declare a charge this turn.

46. **Mindlock** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000134.json
   - Description: While a TECHMARINE model is leading this unit, improve the Ballistic Skill and Weapon Skill characteristics of ranged and melee weapons equipped by ASTARTES SERVITOR models in this unit by 1.

47. **SERVITOR RETINUE** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000134.json
   - Description: At the start of the Declare Battle Formations step, this unit can join one other unit from your army that is being led by a TECHMARINE . If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit’s Starting Strength is increased accordingly.

48. **The Imperium’s Sword** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000135.json
   - Description: You can re-roll Charge rolls made for this model’s unit.

49. **Brutalis Charge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000136.json
   - Description: Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds.

50. **Armour of Fate** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: The first time this model is destroyed, roll one D6 at the end of the phase: on a 3+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy models, with 6 wounds remaining.

51. **Thunderhawk Cluster Bombs** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000139.json
   - Description: Each time the bearer ends a Normal move, you can select one enemy unit it moved over during that move and roll six D6: for each 3+, that unit suffers 1 mortal wound.

52. **Hunter Missile Targeting** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000146.json
   - Description: Each time this model makes an attack with its skyspear missile launcher that targets a MONSTER or VEHICLE unit, that attack scores a hit on an unmodified Hit roll of 2+.

53. **Gifted Commander** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000152.json
   - Description: While this model is leading a unit, each time that unit is selected to shoot, select one of the following abilities to apply to ranged weapons equipped by models in that unit until the end of the phase: [ASSAULT] [HEAVY] [RAPID FIRE 1]

54. **Embittered** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000152.json
   - Description: The first time an attack is allocated to this model, after the attacking unit has finished making its attacks, until the end of the battle, change the Attacks characteristic of this model’s Dead Man’s Hand to 12.

55. **Forlorn Hero** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000153.json
   - Description: While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it Advanced.

56. **The Quickening (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000155.json
   - Description: This model is eligible to declare a charge in a turn in which it Advanced.

57. **Mass of Doom** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000157.json
   - Description: Each time this model’s unit makes a Charge move, until the end of the turn, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability.

58. **Fury Unbound** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000164.json
   - Description: While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability

59. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000165.json
   - Description: If a CAPTAIN model from your army with the Leader ability can be attached to an ASSAULT INTERCESSORS WITH JUMP PACKS unit, it can be attached to this unit instead.

60. **Magna-grapple** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000167.json
   - Description: The bearer loses the SMOKE keyword, but add 2 to Charge rolls made for the bearer if one or more of the targets of that charge is a MONSTER or VEHICLE unit.

61. **Overcharged Engines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000168.json
   - Description: You can re-roll Advance rolls made for this model.

62. **Lord of Slaughter** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000169.json
   - Description: While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it Advanced.

63. **FLESH TEARERS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000169.json
   - Description: This model is from the Flesh Tearers Chapter, a successor of the Blood Angels. For all rules purposes, it is treated as a BLOOD ANGELS model, but cannot be included in an army that includes any other BLOOD ANGELS EPIC HERO models.

64. **Supreme Grand Master** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000218.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.

65. **Strikes of Retribution** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000219.json
   - Description: Each time a melee attack is allocated to this model, after the attacking model’s unit has finished making its attacks, roll one D6 (to a maximum of six D6 per attacking unit): for each 4+, the attacking unit suffers 1 mortal wound.

66. **Knights of Caliban** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000241.json
   - Description: Each time this unit is selected to fight, if it made a Charge move this turn, until the end of the phase, melee weapons equipped by models in this unit have the [ANTI-MONSTER 4+] and [ANTI-VEHICLE 4+] abilities.

67. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000241.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to an OUTRIDER SQUAD , it can be attached to this unit instead.

68. **EMBARKING WITHIN TRANSPORTS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000282.json
   - Description: This model can embark within friendly ADEPTUS ASTARTES TRANSPORT models that can transport TERMINATOR models. When doing so, it takes up the space of 4 INFANTRY models.

69. **The Great Wolf** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000283.json
   - Description: Each time this model destroys an enemy unit, you gain 1CP.

70. **LOGAN GRIMNAR** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000283.json
   - Description: Your army cannot contain both LOGAN GRIMNAR and LOGAN GRIMNAR ON STORMRIDER .

71. **Speed of the Hunter** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000284.json
   - Description: Add 1 to Advance and Charge rolls made for this model’s unit.

72. **Lord of the Wolfkin** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000287.json
   - Description: While this model is leading a unit, each time that unit makes a Charge move, until the end of the turn, crushing teeth and claws equipped by models in that unit have the [DEVASTATING WOUNDS] ability.

73. **Born of Wolves** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000288.json
   - Description: While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.

74. **Alpha Predator** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000288.json
   - Description: Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy units suffers D3+3 mortal wounds.

75. **Wind Walker (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000292.json
   - Description: While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability and each time that unit Advances, do not make an Advance roll. Instead, until the end of the phase, add 6" to the Move characteristic of models in this unit.

76. **Slayer’s Oath** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000297.json
   - Description: At the start of the battle, select one of the following keywords to be this model’s Slayer’s Oath: CHARACTER ; MONSTER ; VEHICLE . The first time this model’s unit destroys a unit with this model’s Slayer’s Oath keyword, if your Detachment rule has a Saga , until the end of the battle, this model’s unit receives the benefits of that Detachment rule as if that Saga had been completed.

77. **Tactical Precision** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000300.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit with have the [LETHAL HITS] ability.

78. **Berserk Charge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000303.json
   - Description: This unit is eligible to declare a charge in a turn in which it Advanced.

79. **MASTER OF MISCHIEF** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000304.json
   - Description: This model cannot be your Warlord.

80. **Bestial Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000314.json
   - Description: You can re-roll Advance and Charge rolls made for this model.

81. **FORCE OF UNTAMED DESTRUCTION** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000314.json
   - Description: This model cannot be your WARLORD .

82. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000315.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a STERNGUARD VETERAN SQUAD or VANGUARD VETERAN SQUAD , it can instead be attached to this unit instead.

83. **Into the Foe** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000321.json
   - Description: If a unit disembarks from this Transport before it moves, until the end of the turn, that unit is eligible to charge in a turn in which it Advanced.

84. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000324.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to ASSAULT INTERCESSORS WITH JUMP PACKS or an ASSAULT SQUAD WITH JUMP PACKS , it can instead be attached to this unit instead.

85. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000326.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a DEVASTATOR SQUAD , it can instead be attached to this unit.

86. **Blackstar Cluster Launcher** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000358.json
   - Description: Each time this model ends a Normal move, you can select one enemy unit it moved over during that move and roll six D6: for each 5+, that unit suffers 1 mortal wound.

87. **Auspex Array** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000358.json
   - Description: Ranged weapons equipped by the bearer have the [IGNORES COVER] ability.

88. **Infernum Halo-launcher** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000358.json
   - Description: The bearer has the SMOKE keyword.

89. **COMMAND SQUAD BODYGUARD** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001166.json
   - Description: If a CHARACTER model from your army with the Leader ability can be attached to a BIKE SQUAD ( OUTRIDER SQUAD ), it can be attached to this unit instead.

90. **Strafing Enfilade** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001169.json
   - Description: Each time this model ends a Normal move, you can select one enemy unit (excluding MONSTER and VEHICLE units) that it moved over during that move, then roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.

91. **Refuse to Yield** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001172.json
   - Description: Each time an attack is allocated to this model, halve the Damage characteristic of that attack.

92. **Annihilator** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001178.json
   - Description: Each time this model makes a ranged attack that targets a MONSTER or VEHICLE unit, re-roll a Damage roll of 1.

93. **Might of Heroes (Psychic)** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001344.json
   - Description: While this model is leading a unit, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.

94. **Deadly Terror** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001345.json
   - Description: While this model is leading a unit, increase the range of that unit’s Terror Troops ability by 3".

95. **Target Priority** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001346.json
   - Description: This model’s unit is eligible to shoot and declare a charge in a turn in which it Fell Back.

96. **Chronus** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001524.json
   - Description: When this model disembarks from a VEHICLE model it was commanding, it has the Lone Operative ability until the end of the battle.

97. **Explorator Augury Web** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001608.json
   - Description: Enemy units that are set up on the battlefield as Reinforcements cannot be set up within 12" of this bearer, but the bearer must halve its Transport Capacity.

98. **Titan-killer** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001666.json
   - Description: Each time this model makes a ranged attack with its twin Falchion volcano cannon that targets a MONSTER or VEHICLE unit, that attack has the [DEVASTATING WOUNDS] ability.

99. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001997.json
   - Description: If a CHAPLAIN model from your army with the Leader ability can be attached to an ASSAULT INTERCESSOR SQUAD unit, it can be attached to this unit instead.

100. **For the Chapter!** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002098.json
   - Description: Each time a model in this unit is destroyed, roll one D6: on a 3+, do not remove it from play. The destroyed model can shoot after the attacking model’s unit has finished making its attacks, and is then removed from play. When resolving these attacks, any Hazardous tests taken for that attack are automatically passed.

101. **Close-quarters Firepower** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002099.json
   - Description: Each time a model in this unit makes a ranged attack that targets the closest eligible target, improve the Armour Penetration characteristic of that attack by 1.

102. **ATTACHED UNITS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002103.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a COMPANY HEROES unit, it can also be attached to this unit.

103. **Inspiring Leader** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002199.json
   - Description: While this unit is leading a unit and contains a MARNEUS CALGAR model, that unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back

104. **Designer’s Note** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002202.json
   - Description: Place an Armorium Cherub token next to the unit, removing it once this ability has been used.

105. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002285.json
   - Description: If a CHAPLAIN model from your army with the Leader ability can be attached to an INTERCESSOR SQUAD unit, it can be attached to this unit instead.

106. **Grand Master of the Ravenwing** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002291.json
   - Description: While this model is leading a unit, that unit is eligible to shoot and declare a charge in a turn in which it Advanced. If that unit is already eligible to shoot and declare a charge in a turn in which it Advanced, add 1 to Advance and Charge rolls made for that unit instead.

107. **Signum Array** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002473.json
   - Description: While this model is leading a unit, ranged weapons equipped by models in that unit have the [IGNORES COVER] ability.

108. **Siege Captain** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002473.json
   - Description: Each time this model makes an attack that targets a MONSTER , VEHICLE , or FORTIFICATION unit, improve the Strength, Armour Penetration and Damage characteristics of that attack by 2.

109. **Terminator Storm Shield** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002677.json
   - Description: The bearer has a Wounds characteristic of 6.

110. **Catechism of Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002678.json
   - Description: While this model is leading a unit, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability.

111. **Master of Deceit** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002701.json
   - Description: After both players have deployed their armies, if your army includes one or more models with this ability, you can select up to three friendly ADEPTUS ASTARTES INFANTRY units and redeploy all of those units. When doing so, any of those units can be placed into Strategic Reserves, regardless of how many units are already in Strategic Reserves.

112. **Annihilator Protocols** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002703.json
   - Description: Melee weapons equipped by models in this unit have the [SUSTAINED HITS 2] ability when targeting MONSTER , VEHICLE or FORTIFICATION units.

113. **Centurion Assault Launcher** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002703.json
   - Description: The bearer has the Grenades keyword.

114. **Rolling Fortress** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002704.json
   - Description: Each time a ranged attack is allocated to a model from your army, if that model is not fully visible to every model in the attacking unit because of this Fellblade model, that model has the Benefit of Cover against that attack.

115. **Ironclad Assault Launchers** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002706.json
   - Description: The bearer has the GRENADES keyword.

116. **For the Khan!** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002709.json
   - Description: While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability and melee weapons equipped by models in that unit have the [LANCE] ability.

117. **Trophy Taker** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002709.json
   - Description: Each time this model destroys an enemy CHARACTER model, you gain 1CP.

118. **Thunderous Impact** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002712.json
   - Description: Each time a model in this unit makes a melee attack, if this unit made a Charge move this turn, improve the Strength and Damage characteristics of that attack by 1.

119. **CRIMSON FISTS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002713.json
   - Description: This model is from the Crimson Fists Chapter, a successor of the Imperial Fists. For all rules purposes, it is treated as an IMPERIAL FISTS model, but it cannot be included in an army that includes any other IMPERIAL FISTS EPIC HERO models.

120. **Annihilator** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002714.json
   - Description: Each time a ranged attack made by this model is allocated to a MONSTER or VEHICLE model, you can re-roll the Damage roll.

121. **Destructor** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002715.json
   - Description: Each time this model makes a ranged attack that targets an INFANTRY unit, improve the Armour Penetration characteristic of that attack by 1.

122. **Grapnel Launcher** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002718.json
   - Description: Each time the bearer’s unit makes a Normal, Advance, Fall Back or Charge move, ignore any vertical distance when determining the total distance the bearer can be moved during that move.

123. **Even In Death I Serve** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002719.json
   - Description: The first time this model is destroyed, remove it from play without resolving its Deadly Demise ability. Then, at the end of the phase, roll one D6: on a 2+, set this model back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with D6 wounds remaining.

124. **Tyrannic War Veterans** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002725.json
   - Description: Weapons equipped by models in this unit are have the [DEVASTATING WOUNDS] ability when targeting TYRANIDS units.

125. **Savage Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002737.json
   - Description: You can re-roll Charge rolls made for this unit.

126. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002737.json
   - Description: If a CHAPLAIN model from your army with the Leader ability can be attached to ASSAULT INTERCESSORS WITH JUMP PACKS , it can be attached to this unit instead.

127. **Hammer of Wrath** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002776.json
   - Description: Each time this unit ends a Charge move, select one enemy unit within Engagement Range of it, then roll one D6 for each model in this unit that is within Engagement Range of that enemy unit: for each 4+, that enemy unit suffers 1 mortal wound.

128. **Spectrus Doctrines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002779.json
   - Description: At the end of your opponent’s turn, if this unit is more than 6" away from all enemy units, you can remove this unit from the battlefield and place it into Strategic Reserves.

129. **Indomitor Doctrines** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002781.json
   - Description: Each time a model in this unit makes a ranged attack that targets the closest eligible target, or makes a melee attack in a turn in which it made a Charge move, improve the Strength characteristic of that attack by 2.

130. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002781.json
   - Description: If a CHARACTER unit from your army can be attached to a HEAVY INTERCESSOR SQUAD , it can be attached to this unit instead.

131. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002783.json
   - Description: If a CHARACTER from your army with the Leader ability can be attached to a STERNGUARD VETERAN SQUAD , it can be attached to this unit instead.

132. **Banner of the Emperor Victorious** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002792.json
   - Description: Add 1 to Advance and Charge rolls made for this unit.

133. **Water from the Stoup of Elucidation** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002792.json
   - Description: Improve the Armour Penetration characteristic of melee weapons equipped by models in this unit by 1.

134. **Prioritised Eradication** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002793.json
   - Description: Each time a model in this model’s unit makes a melee attack that destroys one or more enemy units, roll one D6: on a 4+, you gain 1CP.

135. **CHOSEN OF THE EMPEROR** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002795.json
   - Description: You cannot include more than one EMPEROR’S CHAMPION model in your army.

136. **Inspirational Exemplar** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002796.json
   - Description: While this model is leading a unit, each time a model in that unit makes a melee attack, an unmodified Hit roll of 5+ scores a Critical Hit.

137. **Alpha Hunter** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002805.json
   - Description: While this model is leading a unit, models in that unit have the Scouts 6" ability.

138. **WOLFKIN** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002805.json
   - Description: This model cannot be your Warlord and cannot be given Enhancements.

139. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002806.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a REIVER SQUAD , it can instead be attached to this unit.

140. **Attached Unit** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003698.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to a STERNGUARD VETERAN SQUAD , it can be attached to this unit instead.

141. **Lost to Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003833.json
   - Description: While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.

142. **Magna-grapple** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003835.json
   - Description: Add 2 to Charge rolls made for this model if one or more of the targets of that charge is a MONSTER or VEHICLE unit.

143. **Smoke Launchers** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003835.json
   - Description: The bearer loses the Magna-grapple ability and gains the SMOKE keyword.

144. **DEATH COMPANY** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003836.json
   - Description: If a CHAPLAIN model from your army with the Leader ability can be attached to a TACTICAL SQUAD , it can be attached to this unit instead. If a CHARACTER unit from your army with the Leader ability can be attached to a DEATH COMPANY MARINES unit, it can be attached to this unit instead.

145. **Berserk Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003837.json
   - Description: You can re-roll Charge rolls made for this unit.

146. **DEATH COMPANY** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003837.json
   - Description: If a CHAPLAIN model from your army with the Leader ability can be attached to ASSAULT INTERCESSORS WITH JUMP PACKS or an ASSAULT SQUAD WITH JUMP PACKS , it can be attached to this unit instead. If a

147. **Press the Attack** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003838.json
   - Description: Weapons equipped by models in this model’s unit have the [SUSTAINED HITS 1] ability.

148. **Strategic Knowledge** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003871.json
   - Description: While this model is leading a unit, that unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back.

149. **Tactical Instinct** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003872.json
   - Description: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.

150. **Unstoppable Champion** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003872.json
   - Description: The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 1 wound remaining.

151. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003873.json
   - Description: If a CHARACTER from your army with the Leader ability can be attached to a TERMINATOR SQUAD , it can be attached to this unit instead.

152. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003874.json
   - Description: If a CHARACTER unit from your army with the Leader ability can be attached to an ASSAULT INTERCESSORS WITH JUMP PACKS unit, it can be attached to this unit instead.

153. **Catechism of Death** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: While this unit contains Chaplain Cassius, melee weapons equipped by models in this unit have the [DEVASTATING WOUNDS] ability.

154. **Jump Pack** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: The bearer has a Move characteristic of 12" and can move over models and terrain as if they were not there.

155. **CASSIUS** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003875.json
   - Description: Your army cannot contain both Chaplain Cassius and KILL TEAM CASSIUS .

156. **Let Loose the Wolves** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004131.json
   - Description: At the start of the Declare Battle Formations step, split this unit into two units, one containing all of its HEADTAKERS models and one containing all of its HUNTING WOLVES models, with new Starting Strengths accordingly.

157. **Violent Fury** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004133.json
   - Description: If this model is equipped with two melee weapons, those weapon profiles have the [TWIN-LINKED] ability.

158. **Remorseless Persecution** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004135.json
   - Description: While this model is leading a unit, that unit is eligible to declare a charge in a turn in which it Advanced.

159. **CHAPTER MASTER OF THE RAVEN GUARD** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004148.json
   - Description: At the start of the Declare Battle Formations step, if your army includes AETHON SHAAN and KAYVAAN SHRIKE , until the end of the battle, your KAYVAAN SHRIKE unit loses its Lone Operative ability and it replaces its CHAPTER MASTER keyword with CAPTAIN .

160. **Righteous Zeal** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004154.json
   - Description: You can re-roll Advance and Charge rolls made for this unit.

161. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004154.json
   - Description: If a CHARACTER from your army with the Leader ability can be attached to a TACTICAL SQUAD , it can be attached to this unit instead.

162. **Spear of Chogoris** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004167.json
   - Description: This model’s unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back. If that unit is already eligible to shoot and declare a charge in a turn in which it Advanced, add 1 to Advance and Charge rolls made for that unit instead.

163. **Skilled Riders** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004167.json
   - Description: Each time a model in this model’s unit makes a Normal, Advance, Fall Back or Charge move, it can move horizontally through terrain features.

164. **Indomitable Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004179.json
   - Description: Each time a model in this unit makes a Consolidation move, it can move up to 6" instead of up to 3".

165. **Zealot’s Fervour** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004180.json
   - Description: This model’s unit is eligible to charge in a turn in which it Fell Back.

166. **Inspiring Leader** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004183.json
   - Description: This unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back.

167. **LORD CALGAR** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004183.json
   - Description: Your army cannot include more than one MARNEUS CALGAR unit.

168. **CAPTAIN OF THE HONOUR GUARD** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004184.json
   - Description: Your army cannot include more than one CAPTAIN SICARIUS unit.

169. **ATTACHED UNIT** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004185.json
   - Description: If a CAPTAIN or CHAPTER MASTER unit from your army can be attached to a COMPANY HEROES unit, it can be attached to this unit instead.

170. **Prescient Flash** (Enhancement (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Models in the bearer’s unit have the Scouts 6" ability.

171. **Blazing Icon** (Enhancement (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. Enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer’s unit.

172. **Ordained Sacrifice** (Enhancement (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The first time the bearer is destroyed, roll one D6 at the end of the phase: on a 2+, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with 3 wounds remaining.

173. **Indomitable Fury** (Enhancement (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: GRAVIS model only. The first time the bearer is destroyed , roll one D6 at the end of the phase. On a 2+, set the bearer back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining.

174. **Architect of War** (Enhancement (Anvil Siege Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [IGNORES COVER] ability.

175. **Veteran of Behemoth** (Enhancement (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability. In addition, while the bearer’s unit is under the effects of the Devastator Doctrine , you can re-roll Advance rolls made for that unit.

176. **Wolves’ Wisdom** (Enhancement (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. The bearer’s unit can declare a charge against one or more units within 6" instead of within 3" when using The Great Wolf Watches Detachment rule.

177. **Fangrune Pendant** (Enhancement (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. The bearer’s unit is eligible to shoot and declare a charge in a turn in which it Fell Back .

178. **Longstrider** (Enhancement (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. You can re-roll Charge rolls made for the bearer’s unit.

179. **Righteous Fervour** (Detachment Ability (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: You can re-roll Advance and Charge rolls made for ADEPTUS ASTARTES units from your army. RESTRICTIONS Your army can include BLACK TEMPLARS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

180. **Incendiary Animus** (Enhancement (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CHAPLAIN or JUDICIAR model only. Improve the Armour Penetration characteristic of melee weapons equipped by models in the bearer’s unit by 1.

181. **Oathbound Exemplar** (Enhancement (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. Add 1 to Advance rolls made for the bearer’s unit. If the mission pack you are playing features Actions, the bearer’s unit is eligible to start to perform an Action in a turn in which it Advanced .

182. **Zealous Vanguard** (Enhancement (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Models in the bearer’s unit have the Scouts 6" ability.

183. **Masters Of Manoeuvre** (Detachment Ability (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES units from your army are eligible to shoot in a turn in which they Advanced or Fell Back . ADEPTUS ASTARTES MOUNTED units from your army are eligible to shoot and declare a charge in a turn in which they Advanced or Fell Back. RESTRICTIONS Your army can include DARK ANGELS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter. KEYWORDS OUTRIDER SQUAD units from your army gain the BATTLELINE keyword.

184. **Master-crafted Weapon** (Enhancement (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. Melee weapons equipped by the bearer have the [PRECISION] ability.

185. **Mounted Strategist** (Enhancement (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. You can re-roll Advance and Charge rolls made for the bearer’s unit.

186. **Master of Manoeuvre** (Enhancement (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. If the bearer’s unit starts the battle in Strategic Reserves, its points value does not count towards the combined points limit for units from your army that are in Strategic Reserve, and for the purposes of setting up that unit on the battlefield, treat the current battle round number as being one higher than it actually is.

187. **Recon Hunter** (Enhancement (Company of Hunters))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. Models in the bearer’s unit have the Scouts 9" ability.

188. **Indomitable Champion** (Enhancement (Emperor’s Shield))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES TERMINATOR model only. The first time the bearer is destroyed, roll one D6 at the end of the phase. On a 2+, set the bearer back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining.

189. **Champion of Humanity** (Enhancement (Firestorm Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: TACTICUS model only. While the bearer is leading a unit, models in that unit can ignore any or all modifiers to their characteristics and/or to any roll or test made for them (excluding modifiers to saving throws ).

190. **Fire Discipline** (Enhancement (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability. In addition, while the bearer’s unit is under the effects of the Devastator Doctrine , you can reroll Advance rolls made for that unit.

191. **Restrictions** (Detachment Ability (Hammer of Avernii))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Your army can include IRON HANDS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

192. **Singular Will** (Enhancement (Inner Circle Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATHWING model only. Each time the bearer’s unit Piles In or Consolidates , models in that unit can move an additional 3".

193. **Celerity** (Enhancement (Librarius Conclave))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES PSYKER model only. The bearer’s unit is eligible to declare a charge in a turn in which it Advanced , and if the Biomancy Discipline is active for your army, it is eligible to declare a charge in a turn in which it Fell Back .

194. **Lord of the Hunt** (Enhancement (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. The bearer’s unit is eligible to shoot and declare a charge in a turn in which it Fell Back and you can re-roll Desperate Escape tests taken for models in the bearer’s unit.

195. **Relentless Salvoes** (Detachment Ability (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES units from your army are eligible to shoot in a turn in which they Advanced or Fell Back .

196. **Void Warrior** (Enhancement (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: You can re-roll Advance and Charge rolls made for the bearer. In addition, the bearer is eligible to declare a charge in a turn in which it Advanced.

197. **Wolf-touched** (Enhancement (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. Add 2" to the Move characteristic of the bearer. In the Declare Battle Formations step, the bearer can be attached to a WULFEN INFANTRY unit.

198. **Hunter’s Guile** (Enhancement (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. After both players have deployed their armies, select up to three THUNDERWOLF CAVALRY , WULFEN and/or BLOOD CLAWS units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves if you wish, regardless of how many units are already in Strategic Reserves.

199. **Helm of the Beastslayer** (Enhancement (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time an attack made by a CHARACTER , MONSTER or VEHICLE model targets the bearer’s unit, reduce the Armour Penetration characteristic of that attack by 1.

200. **Skjald** (Enhancement (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Each time a SPACE WOLVES CHARACTER unit from your army achieves a Boast , if the bearer is on the battlefield, you gain 1CP.

201. **Thunderwolf’s Fortitude** (Enhancement (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The first time the bearer is destroyed, remove it from play, then, at the end of the phase, roll one D6: on a 2+, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of one or more enemy units, with 3 wounds remaining.

202. **Restrictions** (Detachment Ability (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Your army can include SPACE WOLVES units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

203. **Chariots of the Storm** (Enhancement (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. After both players have deployed their armies, select up to three ADEPTUS ASTARTES units from your army and redeploy them. When doing so, you can set those units up in Strategic Reserves, regardless of how many units are already in Strategic Reserves.

204. **Skjald’s Foretelling** (Enhancement (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WOLF GUARD BATTLE LEADER model only. While the bearer is leading a unit, weapons equipped by models in that unit have the [LANCE] ability.

205. **Swift Hunter** (Enhancement (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: SPACE WOLVES model only. Models in the bearer’s unit have the Scouts 7" ability.

206. **Restrictions** (Detachment Ability (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Your army can include RAVEN GUARD units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

207. **Blackwing Shroud** (Enhancement (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. While the bearer is leading a unit, models in that unit have the Infiltrators ability.

208. **Umbral Raptor** (Enhancement (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has the Stealth and Lone Operative abilities.

209. **Storm-swift Onslaught** (Detachment Ability (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES units from your army are eligible to declare a charge in a turn in which they Advanced or Fell Back .

210. **Restrictions** (Detachment Ability (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: Your army can include WHITE SCARS units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

211. **Stormseers’ Wisdom** (Enhancement (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, you can re-roll Advance rolls made for that unit.

212. **Hunter’s Eye** (Enhancement (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Ranged weapons equipped by models in the bearer’s unit have the [SUSTAINED HITS 1] and [IGNORES COVER] abilities.

213. **Chogorian Huntmaster** (Enhancement (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES MOUNTED model only. If the bearer’s unit is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round number as being one higher than it actually is.

214. **Lightning Assault** (Detachment Ability (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES units from your army are eligible to declare a charge in a turn in which they Advanced or Fell Back .

215. **Portents of Wisdom** (Enhancement (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, you can re-roll Advance rolls made for that unit.

216. **Feinting Withdrawal** (Enhancement (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. While the bearer is leading a unit, that unit is eligible to shoot in a turn in which it Fell Back .

217. **Hunter’s Instincts** (Enhancement (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES MOUNTED model only. If the bearer’s unit is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round number as being one higher than it actually is.

218. **Resolute** (Enhancement (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: The bearer is eligible to declare a charge in a turn in which it Fell Back . In addition, Desperate Escape tests taken for the bearer are automatically passed, and each time the bearer makes a Fall Back move , it can move through enemy models as if they were not there.

219. **Artisan of War** (Enhancement (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES JUMP PACK model only. Improve the Armour Penetration characteristic of the bearers weapons by 1, and the bearer has a Save characteristic of 2+.

220. **Archangel’s Shard** (Enhancement (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES JUMP PACK model only. The bearer’s melee weapons have the [Anti-Chaos 5+] and [Lance] abilities.

221. **Blood Shard** (Enhancement (The Lost Brethren))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: DEATH COMPANY model only. The first time the bearer is destroyed , at the end of the phase, roll one D6: on a 2+, set the bearer back up on the battlefield as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with 3 wounds remaining.

222. **The Blade Driven Deep** (Enhancement (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES INFANTRY model only. While the bearer is leading a unit, models in that unit have the Infiltrators ability.

223. **Ghostweave Cloak** (Enhancement (Vanguard Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. The bearer has the Stealth and Lone Operative abilities.

224. **Imperialis of the Eternal Crusade** (Enhancement (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ANCIENT model only. Each time an enemy unit selects the bearer’s unit as a target of a charge, subtract 2 from the Charge roll (this is not cumulative with any olher negative modifiers to that Charge roll).

225. **Orb of the Emperor’s Aegis** (Enhancement (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. Models in the bearer’s unit have the Deep Strike ability.

226. **Warden of Honour** (Enhancement (Vindication Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CRUSADE ANCIENT model only. While the bearer is leading a unit, each time you roll one D6 for the bearer’s Vengeful Exhortation ability, add 1 to the result.

227. **Lord of the Ravenwing** (Enhancement (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: RAVENWING model only. You can re-roll Advance and Charge rolls made for the bearer’s unit.

228. **Pyrebrand** (Enhancement (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: BLACK TEMPLARS model only. Models in the bearer’s unit have the Stealth ability.

229. **Benediction of Fury** (Enhancement (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CHAPLAIN model only. The bearer’s melee weapons have the [DEVASTATING WOUNDS] ability.

---

### Pattern: shootingPhase, fightPhase

**Total entries**: 29

**Unique entries**: 3

1. **ARMOUR OF CONTEMPT** (Stratagem (1st Company Task Force))
   - Count: 27 occurrence(s)
   - Sources: faction.json, faction.json, faction.json, faction.json, faction.json, ... and 22 more
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.

2. **Frenzied Reprisal** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000003835.json
   - Description: Each time an enemy unit targets this model, after that unit has finished making its attacks, this model can either shoot as if it were your Shooting phase or fight as if it were the Fight phase.

3. **THE FOE FORESEEN** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.

---

### Pattern: commandPhase

**Total entries**: 21

**Unique entries**: 20

1. **Self Repair** (Unit Ability)
   - Count: 2 occurrence(s)
   - Sources: datasheets/000000085.json, datasheets/000002723.json
   - Description: At the end of your Command phase, this model regains 1 lost wound.

2. **Author of the Codex** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000138.json
   - Description: At the Start of your Command phase, select two Author of the Codex abilities (see left). Until the start of your next Command phase, this model has those abilities.

3. **Masterful Tactician** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000218.json
   - Description: At the start of your Command phase, if this model is on the battlefield, you gain 1CP.

4. **Ancient Tactician** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000302.json
   - Description: At the start of your Command phase, if this model is on the battlefield, you gain 1CP.

5. **Master Tactician** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002199.json
   - Description: At the start of your Command phase, if this unit’s Marneus Calgar model is your WARLORD and is on the battlefield, you gain 1CP.

6. **Primarch of the First Legion** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002682.json
   - Description: At the start of your Command phase, select two Primarch of the First Legion abilities. Until the start of your next Command phase, this model has those abilities.

7. **Temple Relics** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002792.json
   - Description: In your Command phase, if this unit contains one or more Cenobyte Servitor models, select one Temple Relics ability (see left). Until the start of your next Command phase, this unit’s Chaplain Grimaldus model has that ability.

8. **Master Tactician** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000004183.json
   - Description: At the start of your Command phase, if this model is your WARLORD and is on the battlefield, you gain 1CP.

9. **INSTANT OF GRACE** (Stratagem (Angelic Inheritors))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army. EFFECT: Select one non- CHARACTER model in your unit. Until the start of your next Command phase, your model has the CHARACTER keyword. Designer’s Note: While in effect, your model’s unit is therefore a CHARACTER unit, meaning it can interact with the Legacy of the Angel Detachment rule, in addition to other rules that interact with CHARACTER units.

10. **ADAPTIVE TACTICS** (Stratagem (Black Spear Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: Up to two KILL TEAM units from your army, or one other ADEPTUS ASTARTES unit from your army. EFFECT: For each unit targeted, select Furor Tactics , Malleus Tactics or Purgatus Tactics . Until the start of your next Command phase, that Mission Tactic is active for that unit instead of any Mission Tactic that is active for your army.

11. **Mastered Doctrines** (Detachment Ability (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: At the start of up to three of your Command phases, you can select one of the Combat Doctrines listed below. Until the start of your next Command phase, that Combat Doctrine is active and its effects apply to all ADEPTUS ASTARTES units from your army. You cannot select a Combat Doctrine you have already selected this battle, unless a friendly MARNEUS CALGAR model is on the battlefield. Devastator Doctrine The Codex Astartes details the strategic value of overwhelming firepower. This unit is eligible to shoot in a turn in which it Advanced . Tactical Doctrine The Codex lays out strategies for seizing the initiative. This unit is eligible to shoot and declare a charge in a turn in which it Fell Back . Assault Doctrine The Codex Astartes leaves no doubt that the killing blow must be delivered with a decisive close-quarters strike. This unit is eligible to declare a charge in a turn in which it Advanced . RESTRICTIONS Your army can include ULTRAMARINES units, but it cannot include any ADEPTUS ASTARTES units drawn from any other Chapter .

12. **Student of the Codex** (Enhancement (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. At the start of your Command phase, if the bearer is on the battlefield, it can use this Enhancement. If it does, until the start of your next Command phase, the Tactical Doctrine is active for this unit (instead of any other Combat Doctrine you select to be active for your army, and even if there is no Combat Doctrine active for your army).

13. **ULTRAMARIAN ADAPTIVITY** (Stratagem (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Select the Devastator Doctrine , Tactical Doctrine or Assault Doctrine . Until the start of your next Command phase, that Combat Doctrine is active for your unit instead of any other Combat Doctrine that is active for your army, even if you have already selected that Combat Doctrine this battle.

14. **Adept of the Codex** (Enhancement (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: CAPTAIN model only. At the start of your Command phase, if the bearer is on the battlefield, instead of selecting a Combat Doctrine to be active for your army, you can select the Tactical Doctrine . If you do, until the start of your next Command phase, that Combat Doctrine is active for the bearer’s unit only, even if you have already selected that Combat Doctrine to be active for your army this battle.

15. **ADAPTIVE STRATEGY** (Stratagem (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Select the Devastator Doctrine , Tactical Doctrine or Assault Doctrine . Until the start of your next Command phase, that Combat Doctrine is active for that unit instead of any other Combat Doctrine that is active for your army, even if you have already selected that doctrine this battle.

16. **Master of Machine War** (Enhancement (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. In your Command phase, select one ADEPTUS ASTARTES VEHICLE model within 6" of the bearer. Until the start of your next Command phase, that VEHICLE is eligible to shoot even if it Fell Back or Advanced this turn.

17. **UNBOWED CONVICTION** (Stratagem (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Command phase. TARGET: One ADEPTUS ASTARTES unit from your army that is below its Starting Strength. EFFECT: Until the end of the turn, your unit can ignore any or all modifiers to its characteristics and/or to any roll or test made for it (excluding modifiers to saving throws).

18. **BIRTH OF A SAGA** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One Wolf Guard Headtaker or Wolf Guard Terminator Pack Leader model from your army. EFFECT: Until the start of your next Command phase, your model has the CHARACTER keyword. Designer’s Note: While in effect, your model’s unit is therefore a CHARACTER unit, meaning it can interact with the Heroes All rule, in addition to other rules that interact with CHARACTER units.

19. **GRIMNAR’S COMMAND** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Select one Hunting Pack from the Master of Wolves Detachment rule. Until the start of your next Command phase, that Hunting Pack is active for your unit instead of any other Hunting Pack that is active, even if you have already selected that Hunting Pack this battle.

20. **VOICE OF DEVOTION** (Stratagem (Wrathful Procession))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Command phase. TARGET: One ADEPTUS ASTARTES INFANTRY or ADEPTUS ASTARTES MOUNTED unit from your army. EFFECT: Select the Chorus of Relentless Hate, Rite of Perfervid Wrath or Chant of Deathless Devotion Litany . Until the end of the battle round, that Litany is active for your unit instead of any other Litany that is active for your army.

---

### Pattern: movementPhase

**Total entries**: 18

**Unique entries**: 17

1. **Deathwing Assault** (Enhancement (Inner Circle Task Force))
   - Count: 2 occurrence(s)
   - Sources: faction.json, faction.json
   - Description: DEATHWING model with the Deep Strike ability only. The bearer’s unit can be set up using the Deep Strike ability in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules.

2. **Drop Pod Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000087.json
   - Description: This model must start the battle in Reserves and can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model must immediately disembark after it has been set up on the battlefield, and they must be set up more than 9" away from all enemy models.

3. **Drop Pod Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000122.json
   - Description: This model must start the battle in Reserves, but neither it nor any units embarked within it are counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model must immediately disembark after it has been set up on the battlefield, and they must be set up more than 9" away from all enemy models. After this model has been set up on the battlefield, no units can embark within it.

4. **Mark the Target** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001668.json
   - Description: Each time this unit Remains Stationary, until the start of your next Movement phase, ranged weapons equipped by models in this unit have the [DEVASTATING WOUNDS] ability.

5. **Termite Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001991.json
   - Description: This model must start the battle in Reserves, but neither it nor any units embarked within it are counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules. Any units embarked within this model can disembark after it has been set up on the battlefield, and if they do they must be set up more than 9" away from all enemy models.

6. **Deathstorm Assault** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002267.json
   - Description: This model must start the battle in Reserves, but it is not counted towards any limits placed on the maximum number of Reserves units you can start the battle with. This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules.

7. **Aerial Deployment** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002724.json
   - Description: If this model starts the game in Hover mode and in Strategic Reserves, it can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules.

8. **WRATHFUL INFERNO** (Stratagem (Forgefather’s Seekers))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES INFANTRY unit from your army Falls Back. TARGET: That unit. EFFECT: Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back.

9. **GAUNTLET OF THE GOD-EMPEROR** (Stratagem (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES VEHICLE model from your army that has not been selected to move this phase. EFFECT: Until the end of the phase, each time your model makes a Normal or Advance move, it can move horizontally through terrain features.

10. **UNRELENTING HUNTERS** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to move this phase. EFFECT: Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Fell Back. If your unit is a SPACE WOLVES unit, until the end of the turn, it is eligible to declare a charge in a turn in which it Advanced or Fell Back.

11. **CHOSEN PREY** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after a SPACE WOLVES unit from your army Falls Back. TARGET: That SPACE WOLVES unit. EFFECT: Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.

12. **Hunter’s Instincts** (Enhancement (Shadowmark Talon))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. In your Movement phase, if the bearer’s unit is in Strategic Reserves, for the purposes of setting up that unit on the battlefield, treat the current battle round number as being one higher than it actually is.

13. **MOBILE LETHALITY** (Stratagem (Spearpoint Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Until the end of the turn, your unit is eligible to shoot in a turn in which it Advanced or Fell Back.

14. **FULL THROTTLE** (Stratagem (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES MOUNTED or ADEPTUS ASTARTES VEHICLE unit (excluding WALKERS ) from your army. EFFECT: Until the end of the phase, if your unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6" to the Move characteristic of models in your unit, or 9" instead if your unit is MOUNTED .

15. **DEATH FROM THE SKIES** (Stratagem (The Angelic Host))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES JUMP PACK unit from your army Advances or Falls Back. TARGET: That ADEPTUS ASTARTES JUMP PACK unit. EFFECT: Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced or Fell Back.

16. **INTRACTABLE** (Stratagem (Unforgiven Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase, just after an ADEPTUS ASTARTES unit from your army Falls Back. TARGET: That ADEPTUS ASTARTES unit. EFFECT: Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back.

17. **TACTICAL MASTERY** (Stratagem (Wrath of the Rock))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Advanced. If your unit has the RAVENWING keyword, it is also eligible to shoot and declare a charge in a turn in which it Fell Back.

---

### Pattern: shootingPhase

**Total entries**: 14

**Unique entries**: 11

1. **Firing Deck** (Unit Ability)
   - Count: 4 occurrence(s)
   - Sources: datasheets/000000132.json, datasheets/000002568.json, datasheets/000002723.json, datasheets/000002786.json
   - Description: Some transports have firing hatches, ports or platforms from which embarked passengers can shoot. Some TRANSPORT models have ‘Firing Deck x’ listed in their abilities. Each time such a model is selected to shoot in the Shooting phase, you can select up to ‘x’ models embarked within it whose units have not already shot this phase. Then, for each of those embarked models, you can select one ranged weapon that embarked model is equipped with (excluding weapons with the [ONE SHOT] ability). Until that TRANSPORT model has resolved all of its attacks, it counts as being equipped with all of the weapons you selected in this way, in addition to its other weapons. Until the end of the phase, those selected models’ units are not eligible to shoot. Firing Deck ‘x’: Each time this TRANSPORT shoots, select one weapon (excluding weapons with the [ONE SHOT] ability) from up to ‘x’ models embarked within it whose units have not shot this phase; this TRANSPORT counts as being equipped with those weapons as well. Until the end of the phase, those selected models’ units are not eligible to shoot.

2. **Frozen Prey** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000000325.json
   - Description: In your Shooting phase, after this model has shot, if an enemy MONSTER or VEHICLE unit was hit by one or more of those attacks made with this model’s helfrost destructor, until the end of your opponent’s next turn, that enemy unit is Frozen. While a unit is Frozen, subtract 2 from that unit’s Move characteristic, and subtract 2 from Advance and Charge rolls made for that unit.

3. **Tremor Shells** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001164.json
   - Description: In your Shooting phase, after this unit has shot, if an enemy INFANTRY unit was hit by one or more attacks made by this unit’s thunderfire cannon this phase, until the end of your opponent’s next turn, that enemy unit is shaken. While a unit is shaken, subtract 2 from that unit’s Move characteristic, and subtract 2 from Advance and Charge rolls made for that unit.

4. **Reposition Under Covering Fire** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001668.json
   - Description: In your Shooting phase, after this unit has shot, if it contains an Eliminator Sergeant equipped with an instigator bolt carbine, this unit can make a Normal move. If it does so, until the end of the turn, this unit is not eligible to declare a charge.

5. **Instigator Bolt Carbine** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002779.json
   - Description: In your Shooting phase, after the bearer’s unit has shot, the bearer’s unit can make a Normal move. If it does, until the end of the turn, the bearer’s unit is not eligible to declare a charge.

6. **STALKING WOLVES** (Stratagem (Champions of Fenris))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has selected its targets. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Until the end of the phase, models in your unit have the Stealth ability.

7. **Augury Servo-host** (Enhancement (Godhammer Assault Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: ADEPTUS ASTARTES model only. At the start of your Shooting phase, select one enemy unit within 12" of and visible to the bearer. Until the end of the phase, models in that unit cannot have the Benefit of Cover .

8. **POWER OF THE MACHINE SPIRIT** (Stratagem (Ironstorm Spearhead))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has resolved its attacks. TARGET: One ADEPTUS ASTARTES VEHICLE unit from your army that was reduced to Below Half-strength as a result of the attacking unit’s attacks. EFFECT: Your unit can shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

9. **Omni-Structural Auspex** (Enhancement (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, each time a friendly ADEPTUS ASTARTES model (excluding CHARACTER models) makes an attack that targets that unit, improve the Armour Penetration characteristic of that attack by 1.

10. **PINNING FIRE** (Stratagem (Saga of the Beastslayer))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Shooting phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to shoot this phase. EFFECT: Until the end of the phase, after your unit has shot, select one enemy CHARACTER , MONSTER , or VEHICLE unit hit by one or more of those attacks. Until the start of your next Shooting phase, that unit is pinned. While a unit is pinned, subtract 2" from its Move characteristic and subtract 2 from Charge rolls made for it.

11. **BATTLE INSTINCTS** (Stratagem (Saga of the Great Wolf))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot. TARGET: One SPACE WOLVES unit from your army that was selected as the target of one or more of the attacking unit’s attacks. EFFECT: Your unit can make a Normal move of up to D6".

---

### Pattern: fightPhase

**Total entries**: 6

**Unique entries**: 6

1. **COURAGE AND HONOUR!** (Stratagem (Blade of Ultramar))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability. If your unit is under the effects of the Assault Doctrine , until the end of the phase, improve the Armour Penetration characteristic of such weapons by 1 as well.

2. **DEVOUT PUSH** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES INFANTRY unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6" instead of up to 3". RESTRICTIONS: A unit cannot be targeted with this and the Hearts Hardened to Duty Stratagem in the same phase unless it has the CHAPLAIN or JUDICIAR keywords.

3. **HEARTS HARDENED TO DUTY** (Stratagem (Companions of Vehemence))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase, just before an ADEPTUS ASTARTES INFANTRY unit from your army Consolidates. TARGET: That ADEPTUS ASTARTES INFANTRY unit. EFFECT: Until the end of the phase, each time a model in your unit makes a Consolidation move, it does not need to end that move closer to the closest enemy model (or the closest enemy unit if the Suffer Not the Unclean to Live Vow is active for it).

4. **HONOUR THE CHAPTER** (Stratagem (Gladius Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army. EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability. If your unit is under the effects of the Assault Doctrine , until the end of the phase, improve the Armour Penetration characteristic of such weapons by 1 as well.

5. **KNIFE WORK** (Stratagem (Pilum Strike Team))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One ADEPTUS ASTARTES unit from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, improve the Strength and Armour Penetration characteristics of melee weapons equipped by models in your unit by 1.

6. **HUNTERS’ TRAIL** (Stratagem (Saga of the Hunter))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Fight phase. TARGET: One SPACE WOLVES unit (excluding MONSTERS and VEHICLES ) from your army that has not been selected to fight this phase. EFFECT: Until the end of the phase, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6" instead of up to 3". When doing so, it does not need to end that move closer to the closest enemy model, provided it ends that move as close as possible to the closest enemy unit.

---

### Pattern: chargePhase

**Total entries**: 3

**Unique entries**: 3

1. **ALPHA STRIKE** (Stratagem (Saga of the Bold))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Charge phase. TARGET: One ADEPTUS ASTARTES CHARACTER unit from your army. EFFECT: Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.

2. **SHOCK ASSAULT** (Stratagem (Stormlance Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Charge phase. TARGET: One ADEPTUS ASTARTES MOUNTED unit from your army that has not declared a charge this phase. EFFECT: Until the end of the turn, you can re-roll Charge rolls made for your unit and melee weapons equipped by models in that unit have the [LANCE] ability.

3. **CLEANSING SWEEP** (Stratagem (Terminator Assault))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your opponent's Movement or Charge phase. TARGET: One TERMINATOR SQUAD unit from your army that has not fired Overwatch this phase. EFFECT: Until the end of the phase, each time a model in your unit makes an attack while firing Overwatch, an unmodified Hit roll of 5+ is required to score a hit, instead of an unmodified 6.

---

### Pattern: ignoresCover, movementPhase

**Total entries**: 2

**Unique entries**: 2

1. **Signum** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002202.json
   - Description: Each time this unit Remains Stationary, until the start of your next Movement phase, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability.

2. **Targeter Optics** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000002270.json
   - Description: Each time this unit Remains Stationary, until the start of your next Movement phase, ranged weapons equipped by models in this unit have the [IGNORES COVER] ability.

---

### Pattern: ignoresCover

**Total entries**: 1

**Unique entries**: 1

1. **Specialised Weapon System** (Unit Ability)
   - Count: 1 occurrence(s)
   - Sources: datasheets/000001161.json
   - Description: Each time this model makes an attack that targets the enemy unit you selected for the Oath of Moment ability that attack has the [IGNORES COVER] ability and can ignore the penalty to their Hit rolls when making attacks with Indirect Fire weapons against targets that are not visible to them.

---

### Pattern: movementPhase, chargePhase

**Total entries**: 1

**Unique entries**: 1

1. **KNIGHTS OF IRON** (Stratagem (Lion’s Blade Task Force))
   - Count: 1 occurrence(s)
   - Sources: faction.json
   - Description: WHEN: Your Movement phase or your Charge phase. TARGET: One RAVENWING unit from your army. EFFECT: Until the end of the phase, each time a model in your unit makes a Normal, Advance or Charge move, it can move horizontally through terrain features.

---
