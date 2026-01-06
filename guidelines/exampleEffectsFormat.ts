type Entity = "thisArmy" | "thisUnit" | "thisModel" | "opponentArmy" | "opposingUnit" | "opposingModel" | "targetUnit" | "targetModel";
type Effect = "rollBonus" | "rollPenalty" | "staticNumber" | "addsKeyword" | "addsAbility";
type Attribute = "h" | "w" | "s" | "d" | "sv" | "invSv" | "ap" | "battleShock";
type Ability = "FEEL NO PAIN" | "DEEP STRIKE" | "STEALTH" | string;
type Keyword = "INFANCTRY" | "CHARACTER" | string;
type State = "inRangeOfObjective" | "inRangeOfFriendlyObjective" | "inRangeOfEnemyObjective" | "inRangeOfContestedObjective" | "inEngagementRange" | "hasKeyword" | "hasLeader";
type Operator = "equals" | "notEquals" | "greaterThan" | "greaterThanOrEqualTo" | "lessThan" | "lessThanOrEqualTo";

interface Mechanic {
  entity:Entity,
  effect:Effect,
  attribute?: Attribute,
  abilities?: Ability[],
  keywords?: Keyword[],
  state?: State[],
  value: boolean | number | string,
  conditions: [
    {
      entity:Entity,
      attribute?: Attribute,
      abilities?: Ability,
      state?: State,
      keywords?: Keyword,
      operator:Operator,
      value: boolean | number | string,
    }
  ]
}