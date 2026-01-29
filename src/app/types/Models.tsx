export interface Model {
    datasheetId: string;
    name: string;
    m: number;
    t: number;
    sv: number;
    invSv: number | null;
    invSvDescr: string;
    w: number;
    ld: number;
    oc: number;
    baseSize: string;
    baseSizeDescr: string;
}
