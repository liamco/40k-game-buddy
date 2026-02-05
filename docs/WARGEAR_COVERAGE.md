# Wargear Loadout Coverage Report

This report tracks all datasheets with wargear loadout options and their testing status.

## Status Legend

| Status | Meaning |
|--------|---------|
| `[ ]` | Not tested |
| `[~]` | Partially working |
| `[x]` | Fully working |
| `[!]` | Broken |

## Complexity Indicators

- **R** = Has ratio-based weapons (e.g., 1 per 5 models)
- **M** = Has model-type specific weapons (e.g., Sergeant only)
- **L#** = Number of valid loadout groups

---

## Summary

| Faction | Units with Options |
|---------|-------------------|
| Adepta Sororitas | 20 |
| Adeptus Custodes | 25 |
| Adeptus Mechanicus | 19 |
| Adeptus Titanicus | 4 |
| Aeldari | 48 |
| Astra Militarum | 58 |
| Chaos Daemons | 68 |
| Chaos Knights | 21 |
| Chaos Space Marines | 34 |
| Death Guard | 14 |
| Drukhari | 24 |
| Emperor's Children | 13 |
| Genestealer Cults | 57 |
| Grey Knights | 21 |
| Imperial Agents | 16 |
| Imperial Knights | 23 |
| Leagues of Votann | 15 |
| Necrons | 19 |
| Orks | 32 |
| Space Marines | 115 |
| T'au Empire | 35 |
| Thousand Sons | 21 |
| Tyranids | 16 |
| World Eaters | 18 |
| **Total** | **736** |

---

## Adepta Sororitas

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [~] | Battle Sisters Squad | M13 L3 | Sister superior can take a CCW, power weapon and Chainsword. Ok.  |
| [x] | Canoness | L1 | |
| [x] | Canoness with Jump Pack | L1 | |
| [x] | Castigator | L1 |  |
| [!] | Celestian Insidiants | M2 L2 | Almost no rules validate |
| [x] | Celestian Sacresants | M4 L2 | |
| [!] | Dominion Squad | M7 L2 | One Dominion is missing the "up to 4 dominions" rule. Superior shouldn't be able to access storm bolter, meltagun or flamer |
| [x] | Exorcist | L1 | |
| [x] | Immolator | L1 | |
| [~] | Ministorum Priest | L1 | Second vindicator (melee) isn't auto equipped as part of the default loadout |
| [x] | Mortifiers | L1 | |
| [x] | Palatine | L1 | |
| [x] | Paragon Warsuits | L1 | |
| [x] | Penitent Engines | L1 | |
| [!] | Retributor Squad | M9 L2 | incorrect default loadout on Retributors . Retributors shouldn't be able to access boltguns. Superior shouldn't be able to access heavy bolter.|
| [!] | Sanctifiers | M3 L5 | Nearly every model type is assigned the wrong default loadout in the UI |
| [!] | Seraphim Squad | M4 L2 | ratio constraint for Seraphim isn't working - inferno pistols and hand flamers are available on all models. No valid loadout works on Superior. |
| [!] | Sisters Novitiate Squad | M2 L2 | Wrong defaults, constraints not working |
| [x] | Sororitas Rhino | L1 | |
| [~] | Zephyrim Squad | M1 L2 | Sacred banner not restricted to Superior |

## Adeptus Custodes

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Agamatus Custodians | L1 | |
| [ ] | Allarus Custodians | M1 L1 | |
| [ ] | Anathema Psykana Rhino | L1 | |
| [ ] | Aquilon Custodians | L1 | |
| [ ] | Ares Gunship | - | |
| [ ] | Caladius Grav-tank | L1 | |
| [ ] | Contemptor-achillus Dreadnought | L1 | |
| [ ] | Contemptor-galatus Dreadnought | - | |
| [ ] | Coronus Grav-carrier | - | |
| [ ] | Custodian Guard | M1 L1 | |
| [ ] | Custodian Guard With Adrasite And Pyrithite Spears | L1 | |
| [ ] | Custodian Wardens | L1 | |
| [ ] | Knight-centura | L1 | |
| [ ] | Orion Assault Dropship | - | |
| [ ] | Pallas Grav-attack | - | |
| [ ] | Sagittarum Custodians | - | |
| [ ] | Shield-captain | L1 | |
| [ ] | Shield-captain In Allarus Terminator Armour | L1 | |
| [ ] | Shield-captain On Dawneagle Jetbike | L1 | |
| [ ] | Telemon Heavy Dreadnought | L1 | |
| [ ] | Venatari Custodians | L1 | |
| [ ] | Venerable Contemptor Dreadnought | L1 | |
| [ ] | Venerable Land Raider | L1 | |
| [ ] | Vertus Praetors | L1 | |
| [ ] | Witchseekers | - | |

## Adeptus Mechanicus

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Archaeopter Fusilave | L1 | |
| [ ] | Archaeopter Stratoraptor | L1 | |
| [ ] | Archaeopter Transvector | L1 | |
| [ ] | Ironstrider Ballistarii | L1 | |
| [ ] | Kastelan Robots | L1 | |
| [ ] | Kataphron Breachers | L1 | |
| [ ] | Kataphron Destroyers | L1 | |
| [ ] | Onager Dunecrawler | L1 | |
| [ ] | Serberys Raiders | L1 | |
| [ ] | Serberys Sulphurhounds | R2 L1 | |
| [ ] | Servitor Battleclade | M1 L3 | |
| [ ] | Sicarian Infiltrators | L1 | |
| [ ] | Sicarian Ruststalkers | L1 | |
| [ ] | Skitarii Rangers | M5 L3 | |
| [ ] | Skitarii Vanguard | M5 L3 | |
| [ ] | Skorpius Disintegrator | L1 | |
| [ ] | Sydonian Skatros | L1 | |
| [ ] | Tech-priest Dominus | L1 | |
| [ ] | Tech-priest Manipulus | L1 | |

## Adeptus Titanicus

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Reaver Titan | L1 | |
| [ ] | Warbringer Nemesis Titan | L1 | |
| [ ] | Warhound Titan | L1 | |
| [ ] | Warlord Titan | L1 | |

## Aeldari

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Autarch | L1 | |
| [ ] | Autarch Wayleaper | L1 | |
| [ ] | Corsair Voidreavers | R2 M1 L2 | |
| [ ] | Corsair Voidscarred | R2 M1 L6 | |
| [ ] | Crimson Hunter | L1 | |
| [ ] | Dark Reapers | L2 | |
| [ ] | Dire Avengers | L2 | |
| [ ] | Falcon | L1 | |
| [ ] | Farseer | L1 | |
| [ ] | Farseer Skyrunner | L1 | |
| [ ] | Fire Dragons | L1 | |
| [ ] | Fire Prism | L1 | |
| [ ] | Guardian Defenders | M4 L2 | |
| [ ] | Howling Banshees | M1 L2 | |
| [ ] | Night Spinner | L1 | |
| [ ] | Phantom Titan | L1 | |
| [ ] | Rangers | - | |
| [ ] | Revenant Titan | L1 | |
| [ ] | Shadowseer | L1 | |
| [ ] | Shining Spears | M3 L2 | |
| [ ] | Skyweavers | L1 | |
| [ ] | Storm Guardians | L2 | |
| [ ] | Striking Scorpions | M2 L1 | |
| [ ] | Swooping Hawks | M4 L2 | |
| [ ] | Troupe | M1 L2 | |
| [ ] | Troupe Master | L1 | |
| [ ] | Voidweaver | L1 | |
| [ ] | Vypers | L1 | |
| [ ] | War Walkers | L1 | |
| [ ] | Warlock | L1 | |
| [ ] | Warlock Conclave | L1 | |
| [ ] | Warlock Skyrunners | L1 | |
| [ ] | Warp Spiders | M4 L2 | |
| [ ] | Wave Serpent | L1 | |
| [ ] | Windriders | L1 | |
| [ ] | Wraithblades | L1 | |
| [ ] | Wraithguard | L1 | |
| [ ] | Wraithknight | L1 | |
| [ ] | Wraithknight with Ghostglaive | L1 | |
| [ ] | Wraithlord | M1 L1 | |
| [ ] | Ynnari Archon | L1 | |
| [ ] | Ynnari Incubi | L2 | |
| [ ] | Ynnari Kabalite Warriors | M7 L3 | |
| [ ] | Ynnari Raider | L1 | |
| [ ] | Ynnari Reavers | R2 M1 L1 | |
| [ ] | Ynnari Succubus | L1 | |
| [ ] | Ynnari Venom | L1 | |
| [ ] | Ynnari Wyches | M1 L2 | |

## Astra Militarum

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Aegis Defence Line | - | |
| [ ] | Armoured Sentinels | L1 | |
| [ ] | Artillery Team | L1 | |
| [ ] | Attilan Rough Riders | R1 M1 L1 | |
| [ ] | Avenger Strike Fighter | - | |
| [ ] | Baneblade | L1 | |
| [ ] | Banehammer | L1 | |
| [ ] | Banesword | L1 | |
| [ ] | Basilisk | L1 | |
| [ ] | Bullgryn Squad | L1 | |
| [ ] | Cadian Castellan | L1 | |
| [ ] | Cadian Command Squad | M9 L2 | |
| [ ] | Cadian Heavy Weapons Squad | L1 | |
| [ ] | Cadian Shock Troops | R4 L1 | |
| [ ] | Catachan Command Squad | M6 L2 | |
| [ ] | Catachan Heavy Weapons Squad | L1 | |
| [ ] | Catachan Jungle Fighters | R1 L1 | |
| [ ] | Chimera | L1 | |
| [ ] | Commissar | L1 | |
| [ ] | Cyclops Demolition Vehicle | - | |
| [ ] | Death Korps Of Krieg | R5 L1 | |
| [ ] | Deathstrike | L1 | |
| [ ] | Doomhammer | L1 | |
| [ ] | Field Ordnance Battery | L1 | |
| [ ] | Hellhammer | L1 | |
| [ ] | Hellhound | L1 | |
| [ ] | Hydra | L1 | |
| [ ] | Kasrkin | M4 L2 | |
| [ ] | Krieg Combat Engineers | M6 L3 | |
| [ ] | Krieg Command Squad | M8 L2 | |
| [ ] | Krieg Heavy Weapons Squad | L2 | |
| [ ] | Leman Russ Battle Tank | L1 | |
| [ ] | Leman Russ Commander | L1 | |
| [ ] | Leman Russ Demolisher | L1 | |
| [ ] | Leman Russ Eradicator | L1 | |
| [ ] | Leman Russ Executioner | L1 | |
| [ ] | Leman Russ Exterminator | L1 | |
| [ ] | Leman Russ Punisher | L1 | |
| [ ] | Leman Russ Vanquisher | L1 | |
| [ ] | Manticore | L1 | |
| [ ] | Militarum Tempestus Command Squad | M2 L2 | |
| [ ] | Ministorum Priest | L1 | |
| [ ] | Ogryn Bodyguard | L1 | |
| [ ] | Ogryn Squad | - | |
| [ ] | Ratlings | L1 | |
| [ ] | Rogal Dorn Battle Tank | L1 | |
| [ ] | Rogal Dorn Commander | L1 | |
| [ ] | Scout Sentinels | L1 | |
| [ ] | Shadowsword | L1 | |
| [ ] | Stormlord | L1 | |
| [ ] | Stormsword | L1 | |
| [ ] | Taurox | L1 | |
| [ ] | Taurox Prime | L1 | |
| [ ] | Tech-Priest Enginseer | - | |
| [ ] | Tempestus Aquilons | M6 L2 | |
| [ ] | Tempestus Scions | R5 M4 L2 | |
| [ ] | Valkyrie | L1 | |
| [ ] | Wyvern | L1 | |

## Chaos Daemons

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Be'lakor | - | |
| [ ] | Beasts Of Nurgle | - | |
| [ ] | Bloodcrushers | L1 | |
| [ ] | Bloodletters | L1 | |
| [ ] | Bloodmaster | - | |
| [ ] | Bloodthirster | L1 | |
| [ ] | Blue Horrors | - | |
| [ ] | Burning Chariot | - | |
| [ ] | Changecaster | - | |
| [ ] | Chaos Lord | L1 | |
| [ ] | Chaos Lord In Terminator Armour | L1 | |
| [ ] | Chaos Lord with Jump Pack | L1 | |
| [ ] | Chaos Terminator Squad | R5 L1 | |
| [ ] | Chosen | R4 L1 | |
| [ ] | Contorted Epitome | - | |
| [ ] | Cultist Mob | M1 L2 | |
| [ ] | Daemon Prince of Chaos | - | |
| [ ] | Daemon Prince Of Chaos With Wings | - | |
| [ ] | Daemonettes | L1 | |
| [ ] | Epidemius | - | |
| [ ] | Exalted Flamer | - | |
| [ ] | Fateskimmer | - | |
| [ ] | Feculent Gnarlmaw | - | |
| [ ] | Fellgor Beastmen | M3 L2 | |
| [ ] | Fiends | - | |
| [ ] | Flamers | - | |
| [ ] | Flesh Hounds | - | |
| [ ] | Fluxmaster | - | |
| [ ] | Great Unclean One | L1 | |
| [ ] | Havocs | M6 L2 | |
| [ ] | Hellflayers | - | |
| [ ] | Horticulous Slimux | - | |
| [ ] | Infernal Enrapturess | - | |
| [ ] | Kairos Fateweaver | - | |
| [ ] | Karanak | - | |
| [ ] | Keeper Of Secrets | L1 | |
| [ ] | Legionaries | R9 M3 L2 | |
| [ ] | Lord of Change | L1 | |
| [ ] | Nurglings | - | |
| [ ] | Pink Horrors | L1 | |
| [ ] | Plague Drones | L1 | |
| [ ] | Plaguebearers | L1 | |
| [ ] | Possessed | L1 | |
| [ ] | Poxbringer | - | |
| [ ] | Raptors | R3 M1 L2 | |
| [ ] | Rendmaster On Blood Throne | - | |
| [ ] | Rotigus | - | |
| [ ] | Screamers | - | |
| [ ] | Seekers | L1 | |
| [ ] | Shalaxi Helbane | - | |
| [ ] | Skarbrand | - | |
| [ ] | Skull Altar | - | |
| [ ] | Skull Cannon | - | |
| [ ] | Skullmaster | - | |
| [ ] | Skulltaker | - | |
| [ ] | Sloppity Bilepiper | - | |
| [ ] | Sorcerer In Terminator Armour | L1 | |
| [ ] | Soul Grinder | L1 | |
| [ ] | Spoilpox Scrivener | - | |
| [ ] | Syll'esske | - | |
| [ ] | The Blue Scribes | - | |
| [ ] | The Changeling | - | |
| [ ] | The Masque Of Slaanesh | - | |
| [ ] | Tormentbringer | - | |
| [ ] | Traitor Enforcer | - | |
| [ ] | Traitor Guardsmen Squad | M3 L2 | |
| [ ] | Tranceweaver | - | |
| [ ] | Warp Talons | - | |

## Chaos Knights

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Chaos Acastus Knight Asterius | - | |
| [ ] | Chaos Acastus Knight Porphyrion | L1 | |
| [ ] | Chaos Cerastus Knight Acheron | - | |
| [ ] | Chaos Cerastus Knight Atrapos | - | |
| [ ] | Chaos Cerastus Knight Castigator | - | |
| [ ] | Chaos Cerastus Knight Lancer | - | |
| [ ] | Chaos Questoris Knight Magaera | L1 | |
| [ ] | Chaos Questoris Knight Styrix | L1 | |
| [ ] | Cultist Mob | M1 L2 | |
| [ ] | Fellgor Beastmen | M3 L2 | |
| [ ] | Knight Desecrator | L1 | |
| [ ] | Knight Despoiler | L1 | |
| [ ] | Knight Tyrant | L1 | |
| [ ] | Traitor Enforcer | - | |
| [ ] | Traitor Guardsmen Squad | M3 L2 | |
| [ ] | War Dog Brigand | L1 | |
| [ ] | War Dog Executioner | L1 | |
| [ ] | War Dog Huntsman | L1 | |
| [ ] | War Dog Karnivore | L1 | |
| [ ] | War Dog Moirax | L1 | |
| [ ] | War Dog Stalker | L1 | |

## Chaos Space Marines

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Chaos Bikers | M3 L2 | |
| [ ] | Chaos Land Raider | L1 | |
| [ ] | Chaos Lord | L1 | |
| [ ] | Chaos Lord In Terminator Armour | L1 | |
| [ ] | Chaos Lord with Jump Pack | L1 | |
| [ ] | Chaos Predator Annihilator | L1 | |
| [ ] | Chaos Predator Destructor | L1 | |
| [ ] | Chaos Rhino | L1 | |
| [ ] | Chaos Spawn | - | |
| [ ] | Chaos Terminator Squad | R5 L1 | |
| [ ] | Chaos Vindicator | L1 | |
| [ ] | Chosen | R4 L1 | |
| [ ] | Cultist Mob | M1 L2 | |
| [ ] | Defiler | L1 | |
| [ ] | Fellgor Beastmen | M3 L2 | |
| [ ] | Forgefiend | L1 | |
| [ ] | Havocs | M6 L2 | |
| [ ] | Helbrute | L1 | |
| [ ] | Heldrake | L1 | |
| [ ] | Khorne Berzerkers | R2 L2 | |
| [ ] | Khorne Lord Of Skulls | L1 | |
| [ ] | Legionaries | R9 M3 L2 | |
| [ ] | Lord Discordant On Helstalker | L1 | |
| [ ] | Maulerfiend | L1 | |
| [ ] | Nemesis Claw | M5 L2 | |
| [ ] | Noise Marines | M2 L2 | |
| [ ] | Plague Marines | R7 M3 L3 | |
| [ ] | Possessed | L1 | |
| [ ] | Raptors | R3 M1 L2 | |
| [ ] | Rubric Marines | M2 L2 | |
| [ ] | Sorcerer In Terminator Armour | L1 | |
| [ ] | Traitor Enforcer | - | |
| [ ] | Traitor Guardsmen Squad | M3 L2 | |
| [ ] | Warp Talons | - | |

## Death Guard

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Blightlord Terminators | R4 L2 | |
| [ ] | Chaos Land Raider | L1 | |
| [ ] | Chaos Predator Annihilator | L1 | |
| [ ] | Chaos Predator Destructor | L1 | |
| [ ] | Chaos Rhino | L1 | |
| [ ] | Deathshroud Terminators | L1 | |
| [ ] | Defiler | L1 | |
| [ ] | Foetid Bloat-drone | L1 | |
| [ ] | Great Unclean One | L1 | |
| [ ] | Helbrute | M3 L1 | |
| [ ] | Plague Drones | L1 | |
| [ ] | Plague Marines | R7 M3 L3 | |
| [ ] | Plaguebearers | L1 | |
| [ ] | Plagueburst Crawler | L1 | |

## Drukhari

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Archon | L1 | |
| [ ] | Corsair Voidreavers | R2 M1 L2 | |
| [ ] | Corsair Voidscarred | R2 M1 L6 | |
| [ ] | Cronos | L1 | |
| [ ] | Hand of the Archon | M11 L3 | |
| [ ] | Hellions | M3 L2 | |
| [ ] | Incubi | M1 L2 | |
| [ ] | Kabalite Warriors | M7 L3 | |
| [ ] | Raider | L1 | |
| [ ] | Ravager | L1 | |
| [ ] | Razorwing Jetfighter | L1 | |
| [ ] | Reavers | R2 L1 | |
| [ ] | Scourges with Heavy Weapons | M3 L2 | |
| [ ] | Scourges with Shardcarbines | M5 L3 | |
| [ ] | Shadowseer | L1 | |
| [ ] | Skyweavers | L1 | |
| [ ] | Talos | L1 | |
| [ ] | Troupe | M1 L2 | |
| [ ] | Troupe Master | L1 | |
| [ ] | Venom | L1 | |
| [ ] | Voidraven Bomber | L1 | |
| [ ] | Voidweaver | L1 | |
| [ ] | Wracks | M1 L2 | |
| [ ] | Wyches | M2 L2 | |

## Emperor's Children

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Chaos Land Raider | L1 | |
| [ ] | Chaos Rhino | L1 | |
| [ ] | Chaos Terminators | M4 L2 | |
| [ ] | Daemonettes | L1 | |
| [ ] | Heldrake | L1 | |
| [ ] | Infractors | M2 L2 | |
| [ ] | Keeper of Secrets | L1 | |
| [ ] | Lord Exultant | L1 | |
| [ ] | Lord Kakophonist | L1 | |
| [ ] | Maulerfiend | L1 | |
| [ ] | Noise Marines | M2 L2 | |
| [ ] | Seekers | L1 | |
| [ ] | Tormentors | R2 M2 L2 | |

## Genestealer Cults

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Achilles Ridgerunners | L1 | |
| [ ] | Acolyte Hybrids With Autopistols | R1 M1 L1 | |
| [ ] | Acolyte Hybrids With Hand Flamers | R1 M1 L1 | |
| [ ] | Aegis Defence Line | - | |
| [ ] | Armoured Sentinels | L1 | |
| [ ] | Artillery Team | L1 | |
| [ ] | Atalan Jackals | L2 | |
| [ ] | Attilan Rough Riders | R1 M1 L1 | |
| [ ] | Baneblade | L1 | |
| [ ] | Banehammer | L1 | |
| [ ] | Banesword | L1 | |
| [ ] | Basilisk | L1 | |
| [ ] | Cadian Castellan | L1 | |
| [ ] | Cadian Command Squad | M9 L2 | |
| [ ] | Cadian Heavy Weapons Squad | L1 | |
| [ ] | Cadian Shock Troops | R4 L1 | |
| [ ] | Catachan Command Squad | M6 L2 | |
| [ ] | Catachan Heavy Weapons Squad | L1 | |
| [ ] | Catachan Jungle Fighters | R1 L1 | |
| [ ] | Chimera | L1 | |
| [ ] | Cyclops Demolition Vehicle | - | |
| [ ] | Death Korps Of Krieg | R5 L1 | |
| [ ] | Deathstrike | L1 | |
| [ ] | Doomhammer | L1 | |
| [ ] | Field Ordnance Battery | L1 | |
| [ ] | Goliath Rockgrinder | L1 | |
| [ ] | Hellhammer | L1 | |
| [ ] | Hellhound | L1 | |
| [ ] | Hybrid Metamorphs | L2 | |
| [ ] | Hydra | L1 | |
| [ ] | Kasrkin | M4 L2 | |
| [ ] | Krieg Combat Engineers | M6 L3 | |
| [ ] | Krieg Command Squad | M8 L2 | |
| [ ] | Krieg Heavy Weapons Squad | L2 | |
| [ ] | Leman Russ Battle Tank | L1 | |
| [ ] | Leman Russ Commander | L1 | |
| [ ] | Leman Russ Demolisher | L1 | |
| [ ] | Leman Russ Eradicator | L1 | |
| [ ] | Leman Russ Executioner | L1 | |
| [ ] | Leman Russ Exterminator | L1 | |
| [ ] | Leman Russ Punisher | L1 | |
| [ ] | Leman Russ Vanquisher | L1 | |
| [ ] | Manticore | L1 | |
| [ ] | Neophyte Hybrids | R6 M3 L2 | |
| [ ] | Raveners | - | |
| [ ] | Rogal Dorn Battle Tank | L1 | |
| [ ] | Rogal Dorn Commander | L1 | |
| [ ] | Sanctus | L1 | |
| [ ] | Scout Sentinels | L1 | |
| [ ] | Shadowsword | L1 | |
| [ ] | Stormlord | L1 | |
| [ ] | Stormsword | L1 | |
| [ ] | Taurox | L1 | |
| [ ] | Taurox Prime | L1 | |
| [ ] | Winged Hive Tyrant | L1 | |
| [ ] | Winged Tyranid Prime | - | |
| [ ] | Wyvern | L1 | |

## Grey Knights

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Brother-captain | L1 | |
| [ ] | Brotherhood Librarian | L1 | |
| [ ] | Brotherhood Terminator Squad | R3 L2 | |
| [ ] | Grand Master | L1 | |
| [ ] | Grand Master In Nemesis Dreadknight | L1 | |
| [ ] | Grey Knights Thunderhawk Gunship | L1 | |
| [ ] | Interceptor Squad | R4 L2 | |
| [ ] | Land Raider | L1 | |
| [ ] | Land Raider Crusader | L1 | |
| [ ] | Land Raider Redeemer | L1 | |
| [ ] | Nemesis Dreadknight | L1 | |
| [ ] | Paladin Squad | R3 L2 | |
| [ ] | Purgation Squad | L1 | |
| [ ] | Purifier Squad | R4 L1 | |
| [ ] | Razorback | L1 | |
| [ ] | Rhino | L1 | |
| [ ] | Stormhawk Interceptor | L1 | |
| [ ] | Stormraven Gunship | L1 | |
| [ ] | Stormtalon Gunship | L1 | |
| [ ] | Strike Squad | R4 L2 | |
| [ ] | Venerable Dreadnought | L1 | |

## Imperial Agents

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Aquila Kill Team | R5 L4 | |
| [ ] | Corvus Blackstar | L1 | |
| [ ] | Deathwatch Kill Team | R6 M3 L2 | |
| [ ] | Exaction Squad | M1 L3 | |
| [ ] | Grey Knights Terminator Squad | R3 L2 | |
| [ ] | Imperial Navy Breachers | M6 L1 | |
| [ ] | Imperial Rhino | L1 | |
| [ ] | Inquisitor | L1 | |
| [ ] | Inquisitorial Agents | L2 | |
| [ ] | Inquisitorial Chimera | L1 | |
| [ ] | Ministorum Priest | L1 | |
| [ ] | Sanctifiers | M3 L5 | |
| [ ] | Sisters of Battle Immolator | L1 | |
| [ ] | Sisters of Battle Squad | M13 L3 | |
| [ ] | Subductor Squad | L3 | |
| [ ] | Vigilant Squad | L3 | |

## Imperial Knights

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Acastus Knight Asterius | - | |
| [ ] | Acastus Knight Porphyrion | L1 | |
| [ ] | Armiger Helverin | L1 | |
| [ ] | Armiger Moirax | L1 | |
| [ ] | Armiger Warglaive | L1 | |
| [ ] | Cerastus Knight Acheron | - | |
| [ ] | Cerastus Knight Atrapos | - | |
| [ ] | Cerastus Knight Castigator | - | |
| [ ] | Cerastus Knight Lancer | - | |
| [ ] | Knight Castellan | L1 | |
| [ ] | Knight Crusader | L1 | |
| [ ] | Knight Errant | L1 | |
| [ ] | Knight Gallant | L1 | |
| [ ] | Knight Paladin | L1 | |
| [ ] | Knight Preceptor | L1 | |
| [ ] | Knight Valiant | L1 | |
| [ ] | Knight Warden | L1 | |
| [ ] | Questoris Knight Magaera | L1 | |
| [ ] | Questoris Knight Styrix | L1 | |
| [ ] | Skitarii Rangers | M5 L3 | |
| [ ] | Skitarii Vanguard | M5 L3 | |
| [ ] | Tech-priest Dominus | L1 | |
| [ ] | Tech-priest Manipulus | L1 | |

## Leagues of Votann

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Brôkhyr Thunderkyn | L1 | |
| [ ] | Cthonian Beserks | R2 L1 | |
| [ ] | Cthonian Earthshakers | L1 | |
| [ ] | Einhyr Champion | L1 | |
| [ ] | Einhyr Hearthguard | M1 L1 | |
| [ ] | Hearthkyn Warriors | M2 L2 | |
| [ ] | Hekaton Land Fortress | L1 | |
| [ ] | Hernkyn Pioneers | R2 L1 | |
| [ ] | Hernkyn Yaegirs | M2 L1 | |
| [ ] | Ironkin Steeljacks with Heavy Volkanite Disintegrators | M2 L2 | |
| [ ] | Ironkin Steeljacks with Melee Weapons | L2 | |
| [ ] | Kâhl | L1 | |
| [ ] | Kapricus Carrier | L1 | |
| [ ] | Kapricus Defenders | L1 | |
| [ ] | Sagitaur | L1 | |

## Necrons

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Annihilation Barge | L1 | |
| [ ] | Canoptek Macrocytes | M1 L1 | |
| [ ] | Canoptek Spyders | L1 | |
| [ ] | Canoptek Tomb Crawlers | M1 L1 | |
| [ ] | Canoptek Wraiths | L1 | |
| [ ] | Catacomb Command Barge | L1 | |
| [ ] | Immortals | L1 | |
| [ ] | Lokhust Heavy Destroyers | L1 | |
| [ ] | Lokhust Lord | L1 | |
| [ ] | Lychguard | L1 | |
| [ ] | Monolith | L1 | |
| [ ] | Necron Warriors | L1 | |
| [ ] | Ophydian Destroyers | L1 | |
| [ ] | Overlord | L1 | |
| [ ] | Seraptek Heavy Construct | L1 | |
| [ ] | Skorpekh Destroyers | L1 | |
| [ ] | Tomb Blades | L1 | |
| [ ] | Triarch Praetorians | L1 | |
| [ ] | Triarch Stalker | L1 | |

## Orks

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Battlewagon | L1 | |
| [ ] | Beast Snagga Boyz | R2 L2 | |
| [ ] | Beastboss On Squigosaur | L1 | |
| [ ] | Big Mek | L1 | |
| [ ] | Big Mek In Mega Armour | L1 | |
| [ ] | Big Mek With Shokk Attack Gun | L1 | |
| [ ] | Big'ed Bossbunka | L1 | |
| [ ] | Boyz | R2 M2 L2 | |
| [ ] | Breaka Boyz | M2 L2 | |
| [ ] | Burna Boyz | L2 | |
| [ ] | Burna-bommer | L1 | |
| [ ] | Dakkajet | L1 | |
| [ ] | Deff Dread | L1 | |
| [ ] | Deffkoptas | R1 L1 | |
| [ ] | Flash Gitz | L1 | |
| [ ] | Gargantuan Squiggoth | L1 | |
| [ ] | Killa Kans | M3 L1 | |
| [ ] | Kommandos | M5 L3 | |
| [ ] | Lootas | L2 | |
| [ ] | Meganobz | L1 | |
| [ ] | Mek | L1 | |
| [ ] | Mek Gunz | M3 L1 | |
| [ ] | Nobz | L1 | |
| [ ] | Painboss | L1 | |
| [ ] | Painboy | L1 | |
| [ ] | Squighog Boyz | L2 | |
| [ ] | Stormboyz | M1 L2 | |
| [ ] | Tankbustas | M1 L2 | |
| [ ] | Trukk | L1 | |
| [ ] | Warbikers | M4 L1 | |
| [ ] | Warboss | L1 | |
| [ ] | Wazbom Blastajet | L1 | |

## Space Marines

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Aggressor Squad | L1 | |
| [ ] | Ancient | L1 | |
| [ ] | Ancient In Terminator Armour | L1 | |
| [ ] | Assault Intercessor Squad | M5 L2 | |
| [ ] | Assault Intercessors With Jump Packs | R1 M3 L2 | |
| [ ] | Astraeus | L1 | |
| [ ] | Baal Predator | L1 | |
| [ ] | Bjorn The Fell-handed | L1 | |
| [ ] | Bladeguard Veteran Squad | M2 L2 | |
| [ ] | Blood Angels Captain | L1 | |
| [ ] | Blood Claws | M2 L2 | |
| [ ] | Brutalis Dreadnought | L1 | |
| [ ] | Captain | L1 | |
| [ ] | Captain In Gravis Armour | L1 | |
| [ ] | Captain In Terminator Armour | L1 | |
| [ ] | Captain With Jump Pack | L1 | |
| [ ] | Castellan | L1 | |
| [ ] | Centurion Assault Squad | L1 | |
| [ ] | Centurion Devastator Squad | L1 | |
| [ ] | Chaplain In Terminator Armour | L1 | |
| [ ] | Chaplain With Jump Pack | L1 | |
| [ ] | Corvus Blackstar | L1 | |
| [ ] | Crusader Squad | R2 M1 L3 | |
| [ ] | Death Company Captain | L1 | |
| [ ] | Death Company Captain with Jump Pack | L1 | |
| [ ] | Death Company Dreadnought | L1 | |
| [ ] | Death Company Marines | M6 L1 | |
| [ ] | Death Company Marines with Bolt Rifles | R2 M7 L1 | |
| [ ] | Death Company Marines With Jump Packs | R6 L1 | |
| [ ] | Deathwatch Terminator Squad | L1 | |
| [ ] | Deathwatch Veterans | R6 M3 L2 | |
| [ ] | Deathwing Knights | M1 L2 | |
| [x] | Deathwing Terminator Squad | R4 L2 |
| [ ] | Decimus Kill Team | R5 L4 | |
| [ ] | Desolation Squad | M1 L1 | |
| [ ] | Devastator Squad | M6 L2 | |
| [ ] | Dreadnought | L1 | |
| [ ] | Eliminator Squad | M2 L2 | |
| [ ] | Eradicator Squad | R1 L2 | |
| [ ] | Execrator | L1 | |
| [ ] | Firestrike Servo-turrets | L1 | |
| [ ] | Fortis Kill Team | R1 M7 L2 | |
| [ ] | Gladiator Lancer | L1 | |
| [ ] | Gladiator Lancer | L1 | |
| [ ] | Gladiator Reaper | L1 | |
| [ ] | Gladiator Reaper | L1 | |
| [ ] | Gladiator Valiant | L1 | |
| [ ] | Gladiator Valiant | L1 | |
| [ ] | Grey Hunters | M3 L2 | |
| [ ] | Hammerfall Bunker | L1 | |
| [ ] | Heavy Intercessor Squad | R1 L2 | |
| [ ] | Hellblaster Squad | M1 L2 | |
| [ ] | High Marshal Helbrecht | - | |
| [ ] | Impulsor | L1 | |
| [ ] | Impulsor | L1 | |
| [ ] | Inceptor Squad | L1 | |
| [ ] | Incursor Squad | L1 | |
| [ ] | Indomitor Kill Team | R1 M1 L1 | |
| [ ] | Infiltrator Squad | L1 | |
| [ ] | Intercessor Squad | R1 M6 L2 | |
| [ ] | Invader ATV | L1 | |
| [ ] | Invictor Tactical Warsuit | L1 | |
| [ ] | Land Raider | L1 | |
| [ ] | Land Raider Crusader | L1 | |
| [ ] | Land Raider Crusader | L1 | |
| [ ] | Land Raider Redeemer | L1 | |
| [ ] | Land Speeder Vengeance | L1 | |
| [ ] | Librarian In Terminator Armour | L1 | |
| [ ] | Lieutenant | L1 | |
| [ ] | Lion El'jonson | - | |
| [ ] | Marshal | L1 | |
| [ ] | Nephilim Jetfighter | L1 | |
| [ ] | Outrider Squad | L3 | |
| [ ] | Predator Annihilator | L1 | |
| [ ] | Predator Destructor | L1 | |
| [ ] | Ravenwing Black Knights | R1 L1 | |
| [ ] | Ravenwing Command Squad | R1 L1 | |
| [ ] | Ravenwing Darkshroud | L1 | |
| [ ] | Razorback | L1 | |
| [ ] | Redemptor Dreadnought | L1 | |
| [ ] | Reiver Squad | L1 | |
| [ ] | Repulsor | L1 | |
| [ ] | Repulsor | L1 | |
| [ ] | Repulsor Executioner | L1 | |
| [ ] | Repulsor Executioner | L1 | |
| [ ] | Rhino | L1 | |
| [ ] | Sanguinary Guard | R1 L1 | |
| [ ] | Scout Squad | R3 M1 L3 | |
| [ ] | Spectrus Kill Team | M1 L1 | |
| [ ] | Sternguard Veteran Squad | R2 M3 L3 | |
| [ ] | Sternguard Veteran Squad | R2 M3 L3 | |
| [ ] | Stormhawk Interceptor | L1 | |
| [ ] | Stormraven Gunship | L1 | |
| [ ] | Stormtalon Gunship | L1 | |
| [ ] | Sword Brethren Squad | R4 L1 | |
| [ ] | Tactical Squad | M18 L3 | |
| [ ] | Talonstrike Kill Team | R1 M3 L2 | |
| [ ] | Terminator Assault Squad | L1 | |
| [x] | Terminator Squad | R3 M1 L3 |
| [x] | Terminator Squad | R3 M1 L3 |
| [ ] | Thunderhawk Gunship | L1 | |
| [ ] | Thunderwolf Cavalry | R1 L1 | |
| [ ] | Vanguard Veteran Squad With Jump Packs | L1 | |
| [ ] | Venerable Dreadnought | L1 | |
| [ ] | Vindicator | L1 | |
| [ ] | Watch Captain Artemis | - | |
| [ ] | Watch Master | - | |
| [ ] | Whirlwind | L1 | |
| [ ] | Wolf Guard Battle Leader | L1 | |
| [ ] | Wolf Guard Headtakers | L1 | |
| [ ] | Wolf Guard Terminators | M2 L2 | |
| [ ] | Wolf Scouts | M2 L5 | |
| [ ] | Wulfen | L1 | |
| [ ] | Wulfen Dreadnought | L1 | |
| [ ] | Wulfen with Storm Shields | L1 | |

## T'au Empire

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | AX-1-0 Tiger Shark | L1 | |
| [ ] | Breacher Team | L1 | |
| [ ] | Broadside Battlesuits | L1 | |
| [ ] | Cadre Fireblade | L1 | |
| [ ] | Commander In Coldstar Battlesuit | L1 | |
| [ ] | Commander In Enforcer Battlesuit | L1 | |
| [ ] | Crisis Fireknife Battlesuits | L1 | |
| [ ] | Crisis Starscythe Battlesuits | L1 | |
| [ ] | Crisis Sunforge Battlesuits | L1 | |
| [ ] | Devilfish | L1 | |
| [ ] | Ethereal | L1 | |
| [ ] | Firesight Team | - | |
| [ ] | Ghostkeel Battlesuit | L1 | |
| [ ] | Hammerhead Gunship | L1 | |
| [ ] | Kroot Carnivores | R1 L2 | |
| [ ] | Kroot Farstalkers | M2 L3 | |
| [ ] | Kroot Lone-Spear | L1 | |
| [ ] | Kroot War Shaper | L1 | |
| [ ] | Krootox Riders | L1 | |
| [ ] | Manta | - | |
| [ ] | Pathfinder Team | M1 L1 | |
| [ ] | Piranhas | L1 | |
| [ ] | Razorshark Strike Fighter | L1 | |
| [ ] | Riptide Battlesuit | L1 | |
| [ ] | Sky Ray Gunship | L1 | |
| [ ] | Stealth Battlesuits | M1 L1 | |
| [ ] | Stormsurge | L1 | |
| [ ] | Strike Team | L1 | |
| [ ] | Sun Shark Bomber | L1 | |
| [ ] | Ta'unar Supremacy Armour | L1 | |
| [ ] | Tidewall Droneport | - | |
| [ ] | Tidewall Gunrig | - | |
| [ ] | Tidewall Shieldline | - | |
| [ ] | Tiger Shark | L1 | |
| [ ] | Vespid Stingwings | L1 | |

## Thousand Sons

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Chaos Land Raider | L1 | |
| [ ] | Chaos Predator Annihilator | L1 | |
| [ ] | Chaos Predator Destructor | L1 | |
| [ ] | Chaos Rhino | L1 | |
| [ ] | Chaos Vindicator | L1 | |
| [ ] | Defiler | L1 | |
| [ ] | Exalted Sorcerer | L1 | |
| [ ] | Exalted Sorcerer on Disc of Tzeentch | L1 | |
| [ ] | Forgefiend | L1 | |
| [ ] | Helbrute | L1 | |
| [ ] | Heldrake | L1 | |
| [ ] | Lord of Change | L1 | |
| [ ] | Maulerfiend | L1 | |
| [ ] | Pink Horrors | L1 | |
| [ ] | Rubric Marines | M2 L2 | |
| [ ] | Scarab Occult Terminators | R3 M1 L2 | |
| [ ] | Sekhetar Robots | L1 | |
| [ ] | Sorcerer | L1 | |
| [ ] | Sorcerer In Terminator Armour | L1 | |
| [ ] | Tzaangor Enlightened | L1 | |
| [ ] | Tzaangors | L1 | |

## Tyranids

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Carnifexes | L1 | |
| [ ] | Harpy | L1 | |
| [ ] | Harridan | - | |
| [ ] | Hierophant | - | |
| [ ] | Hive Guard | L1 | |
| [ ] | Hive Tyrant | L1 | |
| [ ] | Neurotyrant | - | |
| [ ] | Raveners | - | |
| [ ] | Ripper Swarms | L1 | |
| [ ] | Termagants | R3 L1 | |
| [ ] | Tervigon | L1 | |
| [ ] | Tyranid Warriors With Ranged Bio-weapons | R2 L1 | |
| [ ] | Tyrannofex | L1 | |
| [ ] | Tyrant Guard | L1 | |
| [ ] | Winged Hive Tyrant | L1 | |
| [ ] | Winged Tyranid Prime | - | |

## World Eaters

| Status | Datasheet | Complexity | Notes |
|--------|-----------|------------|-------|
| [ ] | Bloodcrushers | L1 | |
| [ ] | Bloodletters | L1 | |
| [ ] | Bloodthirster | L1 | |
| [ ] | Chaos Land Raider | L1 | |
| [ ] | Chaos Predator Annihilator | L1 | |
| [ ] | Chaos Predator Destructor | L1 | |
| [ ] | Chaos Rhino | L1 | |
| [ ] | Chaos Terminators | R5 L2 | |
| [ ] | Defiler | L1 | |
| [ ] | Flesh Hounds | - | |
| [ ] | Forgefiend | L1 | |
| [ ] | Goremongers | M1 L2 | |
| [ ] | Helbrute | L1 | |
| [ ] | Heldrake | L1 | |
| [ ] | Jakhals | R1 L1 | |
| [ ] | Khorne Berzerkers | R2 L2 | |
| [ ] | Khorne Lord of Skulls | L1 | |
| [ ] | Maulerfiend | L1 | |

---

## How to Use This Document

1. **Testing a unit**: Add the unit to an army list in the app and check the Wargear tab
2. **Update status**: Change `[ ]` to the appropriate status symbol
3. **Add notes**: Document any issues directly in a PR or issue

### Common Issues to Check

- All weapon options display correctly for each model type
- Ratio-based weapons only appear on the correct number of models
- Model-type restrictions work (e.g., Sergeant-only options)
- Swap groups show correct default/replacement options
- Constraints (e.g., "1 in 5 models") are enforced correctly
