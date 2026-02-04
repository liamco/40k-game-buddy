// Eligibility rule types for determining which models can see/select a weapon
export type EligibilityRuleType = "any" | "modelType" | "ratio";

// Base eligibility rule
export interface EligibilityRuleBase {
    type: EligibilityRuleType;
}

// Any model can see this weapon
export interface EligibilityRuleAny extends EligibilityRuleBase {
    type: "any";
}

// Only specific model types can see this weapon
export interface EligibilityRuleModelType extends EligibilityRuleBase {
    type: "modelType";
    modelType: string[]; // List of model types that can see this weapon
}

// Ratio-based eligibility (e.g., 1 per 5 models)
export interface EligibilityRuleRatio extends EligibilityRuleBase {
    type: "ratio";
    ratio: number; // e.g., 5 for "1 per 5 models"
    count: number; // e.g., 1 for "1 per 5 models"
    modelType?: string[]; // Optional: limit ratio to specific model types
}

// Union type for all eligibility rules
export type EligibilityRule = EligibilityRuleAny | EligibilityRuleModelType | EligibilityRuleRatio;

export interface Weapon {
    name: string;
    datasheetId: string;
    id: string;
    type: "Ranged" | "Melee";
    profiles: WeaponProfile[];
    eligibility?: EligibilityRule[]; // Rules determining which models can see/select this weapon (OR logic)
}

export interface WeaponProfile {
    datasheetId: string;
    line: number;
    lineInWargear?: number;
    name: string;
    attributes: string[];
    a: string | number;
    ap: number;
    bsWs: number | string;
    d: string | number;
    s: number;
    range: number | string;
}
