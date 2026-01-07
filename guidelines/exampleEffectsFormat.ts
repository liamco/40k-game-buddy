// type Entity =
//     | "thisArmy"
//     | "thisUnit"
//     | "thisModel"
//     | "opponentArmy"
//     | "opposingUnit"
//     | "opposingModel"
//     | "targetUnit"
//     | "targetModel";
// type Effect = "rollBonus" | "rollPenalty" | "staticNumber" | "addsKeyword" | "addsAbility";
// type UnitAttribute = "m" | "t" | "sv" | "invSv" | "w" | "ld" | "oc";
// type WeaponAttribute = "range" | "a" | "bsWs" | "w" | "s" | "ap" | "d";
// type UnitAbility = "FEEL NO PAIN" | "DEEP STRIKE" | "STEALTH" | string;
// type WeaponAbility = "FEEL NO PAIN" | "DEEP STRIKE" | "STEALTH" | string;
// type Keyword = "INFANTRY" | "CHARACTER" | string;
// type State =
//     | "inRangeOfObjective"
//     | "inRangeOfFriendlyObjective"
//     | "inRangeOfEnemyObjective"
//     | "inRangeOfContestedObjective"
//     | "inEngagementRange"
//     | "hasKeyword"
//     | "hasLeader"
//     | "isBattleShocked";
// type Operator =
//     | "equals"
//     | "notEquals"
//     | "greaterThan"
//     | "greaterThanOrEqualTo"
//     | "lessThan"
//     | "lessThanOrEqualTo";
// type Value = boolean | number | string;

// interface Mechanic {
//     entity: Entity;
//     effect: Effect;
//     attribute?: UnitAttribute | WeaponAttribute;
//     abilities?: UnitAbility[] | WeaponAbility[];
//     keywords?: Keyword[];
//     state?: State[];
//     value: Value;
//     conditions: [
//         {
//             entity: Entity;
//             attribute?: UnitAttribute | WeaponAttribute;
//             abilities?: UnitAbility[] | WeaponAbility[];
//             state?: State;
//             keywords?: Keyword;
//             operator: Operator;
//             value: Value;
//         },
//     ];
// }

// let effect = "rollBonus";

// // const effects {
// //   'rollBonus': rollBonus,
// // }

// // effects[effect](attributes[attribute],value);

// //applyRollBonus(attr, value);
