// Evaluators - determine if mechanics/conditions apply

export {
  evaluateCondition,
  evaluateMechanic,
  evaluateMechanicWithReason,
  filterApplicableMechanics,
} from "./conditionEvaluator";

export {
  resolveEntityState,
  getEntityAttributeValue,
  checkEntityState,
  entityHasKeyword,
  entityHasAnyKeyword,
  entityHasAbility,
  entityHasAnyAbility,
  type EntityState,
} from "./stateResolver";
