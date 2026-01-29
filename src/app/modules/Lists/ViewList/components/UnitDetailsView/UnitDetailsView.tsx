import { ArmyList, ArmyListItem } from "#types/Lists.tsx";
import { useListManager, getWarlordEligibility } from "../../../ListManagerContext";

import { Badge } from "#components/Badge/Badge.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "#components/Tabs/Tabs.tsx";

import OverviewTab from "./OverviewTab";
import WargearTab from "./WargearTab";
import LeadersTab from "./LeadersTab";
import EnhancementsTab from "./EnhancementsTab";

interface Props {
    unit: ArmyListItem;
    list: ArmyList;
}

const UnitDetailsView = ({ unit, list }: Props) => {
    const { calculateItemPoints, updateListItem, getDetachmentEnhancements, getUsedEnhancements } = useListManager();

    const detachmentEnhancements = getDetachmentEnhancements(list, unit);
    const usedEnhancements = getUsedEnhancements(list, unit.listItemId);

    // Check if unit can lead other units
    const canLead = unit.leaders && unit.leaders.length > 0;

    // Check warlord eligibility
    const warlordEligibility = getWarlordEligibility(unit);

    // Leaders tab is enabled if unit can lead OR can be a warlord
    const showLeadersTab = canLead || warlordEligibility.canBeWarlord;

    // Check if unit has Epic Hero keyword (Epic Heroes cannot have enhancements)
    const hasEpicHeroKeyword = unit.keywords?.some((k) => {
        const keyword = typeof k === "string" ? k : k.keyword;
        return keyword?.toUpperCase() === "EPIC HERO";
    });

    // Check if unit has Character keyword
    const hasCharacterKeyword = unit.keywords?.some((k) => {
        const keyword = typeof k === "string" ? k : k.keyword;
        return keyword?.toUpperCase() === "CHARACTER";
    });

    // Enhancements tab is enabled for Characters that are NOT Epic Heroes
    const showEnhancementsTab = hasCharacterKeyword && !hasEpicHeroKeyword;

    const handleUpdateComposition = (line: number, newCount: number, min: number, max: number) => {
        const clampedCount = Math.max(min, Math.min(max, newCount));
        updateListItem(list, unit.listItemId, {
            compositionCounts: {
                ...unit.compositionCounts,
                [line]: clampedCount,
            },
        });
    };

    return (
        <div className="border-1 border-skarsnikGreen">
            <header className="space-y-4 border-b-1 border-skarsnikGreen bg-deathWorldForest p-6">
                <div className="flex justify-between">
                    <h3 className="text-title-m">{unit.name}</h3>
                    <Badge variant="outline">{calculateItemPoints(unit)} pts</Badge>
                </div>

                {unit.keywords && unit.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {unit.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant={keyword.isFactionKeyword === "true" ? "default" : "outline"}>
                                {keyword.keyword}
                            </Badge>
                        ))}
                    </div>
                )}

                {unit.legend && (
                    <p
                        className="italic"
                        dangerouslySetInnerHTML={{
                            __html: unit.legend,
                        }}
                    />
                )}
            </header>

            <main className="p-6">
                <Tabs key={unit.listItemId} defaultValue="overview" className="space-y-6">
                    <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger value="overview">
                            <span className="text-blockcaps-s">Stats & abilities</span>
                        </TabsTrigger>
                        <TabsTrigger value="wargear">
                            <span className="text-blockcaps-s">Wargear & loadouts</span>
                        </TabsTrigger>
                        <TabsTrigger value="leaders" disabled={!showLeadersTab}>
                            <span className={`text-blockcaps-s ${!showLeadersTab ? "line-through" : ""}`}>Leaders</span>
                        </TabsTrigger>
                        <TabsTrigger value="enhancements" disabled={!showEnhancementsTab}>
                            <span className={`text-blockcaps-s ${!showEnhancementsTab ? "line-through" : ""}`}>Enhancements</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab unit={unit} list={list} onUpdateComposition={handleUpdateComposition} />
                    </TabsContent>

                    <TabsContent value="wargear">
                        <WargearTab unit={unit} list={list} />
                    </TabsContent>

                    <TabsContent value="leaders">
                        <LeadersTab unit={unit} list={list} />
                    </TabsContent>

                    <TabsContent value="enhancements">
                        <EnhancementsTab unit={unit} list={list} detachmentEnhancements={detachmentEnhancements} usedEnhancements={usedEnhancements} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default UnitDetailsView;
