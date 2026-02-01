export interface Weapon {
    name: string;
    datasheetId: string;
    id: string;
    type: "Ranged" | "Melee";
    profiles: WeaponProfile[];
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
