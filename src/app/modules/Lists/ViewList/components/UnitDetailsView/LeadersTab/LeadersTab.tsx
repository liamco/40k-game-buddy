import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { useListManager, MultiLeaderValidationResult, getWarlordEligibility } from "#modules/Lists/ListManagerContext.tsx";
import { useLeadableUnits } from "../../../hooks/useLeadableUnits";

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "#components/Collapsible/Collapsible.tsx";
import { ChevronDown, Crown } from "lucide-react";

import LeaderAttachmentCard from "./LeaderAttachmentCard";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

const LeadersTab = ({ unit, list }: Props) => {
    const { attachLeaderToUnit, detachLeaderFromUnit, canAttachLeaderToUnit, setWarlord } = useListManager();
    const { unitsInList, unitsNotInList, loading: loadingBodyguards } = useLeadableUnits(list, unit);

    const canLead = unit.leaders && unit.leaders.length > 0;
    const warlordEligibility = getWarlordEligibility(unit);
    const isWarlord = list.warlordItemId === unit.listItemId;

    const handleSetWarlord = () => {
        if (isWarlord) {
            // Only allow removing warlord status if not a Supreme Commander
            if (!warlordEligibility.mustBeWarlord) {
                setWarlord(list, null);
            }
        } else {
            setWarlord(list, unit.listItemId);
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Warlord Section */}
            {warlordEligibility.canBeWarlord && (
                <div className="space-y-2">
                    <h3 className="text-blockcaps-l">Warlord</h3>
                    <button
                        onClick={handleSetWarlord}
                        disabled={warlordEligibility.mustBeWarlord}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-colors ${
                            isWarlord ? "bg-amber-50 border-amber-400 text-amber-900" : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        } ${warlordEligibility.mustBeWarlord ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <Crown className={`h-5 w-5 ${isWarlord ? "text-amber-500" : "text-gray-400"}`} />
                        <div className="flex-1 text-left">
                            {isWarlord ? <span className="font-medium">{warlordEligibility.mustBeWarlord ? "Must be Warlord" : "Current Warlord"}</span> : <span className="text-gray-600">Make Warlord</span>}
                            {warlordEligibility.mustBeWarlord && <span className="block text-xs text-amber-700 mt-0.5">Supreme Commander</span>}
                        </div>
                        {isWarlord && !warlordEligibility.mustBeWarlord && <span className="text-xs text-gray-500">Click to remove</span>}
                    </button>
                </div>
            )}

            {/* Cannot be Warlord message */}
            {!warlordEligibility.canBeWarlord && warlordEligibility.reason && (
                <div className="space-y-2">
                    <h3 className="text-blockcaps-l">Warlord</h3>
                    <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                        <Crown className="h-5 w-5 text-gray-300" />
                        <div className="flex-1 text-left">
                            <span className="text-sm">Cannot be Warlord</span>
                            <span className="block text-xs mt-0.5">{warlordEligibility.reason}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Leader Attachments Section */}
            {canLead && (
                <div className="space-y-2">
                    <h3 className="text-blockcaps-l">Can Lead</h3>
                    {loadingBodyguards ? (
                        <p className="text-sm">Loading...</p>
                    ) : unitsInList.length > 0 || unitsNotInList.length > 0 ? (
                        <div className="space-y-4">
                            {unitsInList.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-xs mb-2">In Your List ({unitsInList.length})</h4>
                                    <div className="space-y-2">
                                        {unitsInList.map((listItem) => {
                                            const isAttached = unit?.leading?.listItemId === listItem.listItemId;
                                            const validation: MultiLeaderValidationResult = canAttachLeaderToUnit(list, unit.listItemId, listItem.listItemId);

                                            return (
                                                <LeaderAttachmentCard
                                                    key={listItem.listItemId}
                                                    leader={unit}
                                                    targetUnit={listItem}
                                                    list={list}
                                                    isAttached={isAttached}
                                                    validation={validation}
                                                    onAttach={() => attachLeaderToUnit(list, unit.listItemId, listItem.listItemId)}
                                                    onDetach={() => detachLeaderFromUnit(list, unit.listItemId)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {unitsNotInList.length > 0 && (
                                <Collapsible defaultOpen={false}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                                        <h4 className="font-medium text-xs">Not in List ({unitsNotInList.length})</h4>
                                        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2">
                                        <div className="space-y-2">
                                            {unitsNotInList.map((notInListUnit) => (
                                                <div key={notInListUnit.id} className="border border-[#e6e6e6] rounded-lg p-3 bg-white">
                                                    <div className="font-medium text-sm">{notInListUnit.name}</div>
                                                    <div className="text-xs mt-1">{notInListUnit.roleLabel}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No compatible units available to lead.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeadersTab;
