/**
 * Find a unit by listItemId from an array of items.
 * Works with both ArmyListItem[] and EngagementForceItem[].
 */
export function getUnitById<T extends { listItemId: string }>(items: T[], itemId: string | undefined): T | undefined {
    if (!itemId) return undefined;
    return items.find((item) => item.listItemId === itemId);
}
