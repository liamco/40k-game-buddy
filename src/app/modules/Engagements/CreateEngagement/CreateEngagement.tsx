import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { ArmyList } from "#types/Lists.tsx";
import { EngagementType, EngagementSize } from "#types/Engagements.tsx";

import BaseIcon from "#components/icons/BaseIcon.tsx";
import IconCrossedSwords from "#components/icons/IconCrossedSwords.tsx";
import SplitHeading from "#components/SplitHeading/SplitHeading.tsx";
import Dropdown, { type DropdownOption } from "#components/Dropdown/Dropdown.tsx";
import EmptyState from "#components/EmptyState/EmptyState.tsx";
import { RadioGroup, RadioGroupItem } from "#components/RadioGroup/RadioGroup.tsx";
import { useListManager } from "#modules/Lists/ListManagerContext.tsx";
import { useEngagementManager } from "../EngagementManagerContext";
import { Badge } from "#components/Badge/Badge.tsx";
import IconList from "#components/icons/IconList.tsx";
import ForceOverViewCard from "./components/ForceOverviewCard";
import { Button } from "#components/Button/Button.tsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "#components/AlertDialog/AlertDialog.tsx";

const CreateEngagement = () => {
    const navigate = useNavigate();
    const { lists } = useListManager();
    const { createEngagement } = useEngagementManager();

    const [engagementType, setEngagementType] = useState<EngagementType>("wh-40k");
    const [engagementSize, setEngagementSize] = useState<EngagementSize>("strike-force");
    const [attackerListId, setAttackerListId] = useState<string | null>(null);
    const [defenderListId, setDefenderListId] = useState<string | null>(null);

    const attackerList = lists.find((l) => l.id === attackerListId) || null;
    const defenderList = lists.find((l) => l.id === defenderListId) || null;

    // Filter lists to exclude the selected list from the opposite side
    const availableAttackerLists = lists.filter((l) => l.id !== defenderListId);
    const availableDefenderLists = lists.filter((l) => l.id !== attackerListId);

    // Convert lists to Dropdown options
    const attackerListOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableAttackerLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableAttackerLists]);

    const defenderListOptions = useMemo((): DropdownOption<ArmyList>[] => {
        return availableDefenderLists.map((list) => ({
            id: list.id,
            label: list.name,
            data: list,
        }));
    }, [availableDefenderLists]);

    const canCommence = attackerList !== null && defenderList !== null;

    const handleCommenceEngagement = () => {
        if (!attackerList || !defenderList) return;

        const engagement = createEngagement(attackerList, defenderList, engagementType, engagementSize);

        navigate(`/engagements/view/${engagement.id}`);
    };

    const calculateEngagementPoints = () => {
        switch (engagementSize) {
            case "combat-patrol":
                return 500;
            case "incursion":
                return 1000;
            case "strike-force":
                return 2000;
            case "onslaught":
                return 3000;
        }
    };

    return (
        <main className="w-full h-full items-center justify-center p-6 flex flex-col gap-12 border-1 border-skarsnikGreen">
            <div className="text-center space-y-4">
                <BaseIcon size="large">
                    <IconCrossedSwords />
                </BaseIcon>
                <h1 className="text-title-xl">New engagement</h1>
            </div>
            <div className="grid grid-cols-[1fr_2fr] w-full max-w-[72rem] gap-6">
                <aside className="space-y-8">
                    <div className="space-y-4">
                        <SplitHeading label="engagement type" />
                        <RadioGroup defaultValue="wh-40k" value={engagementType} onValueChange={(value) => setEngagementType(value as EngagementType)} className="grid grid-cols-2 gap-2">
                            <RadioGroupItem id="boarding-actions" value="boarding-actions">
                                <span>Boarding actions</span>
                            </RadioGroupItem>
                            <RadioGroupItem id="wh-40k" value="wh-40k">
                                <span>WH 40,000</span>
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <div className="space-y-4">
                        <SplitHeading label="engagement size" />
                        <RadioGroup defaultValue="strike-force" value={engagementSize} onValueChange={(value) => setEngagementSize(value as EngagementSize)} className="grid grid-cols-2 gap-2">
                            <RadioGroupItem id="combat-patrol" value="combat-patrol">
                                <span>Combat patrol</span>
                                <Badge variant="outlineAlt">500 pts</Badge>
                            </RadioGroupItem>
                            <RadioGroupItem id="incursion" value="incursion">
                                <span>Incursion</span>
                                <Badge variant="outlineAlt">1000 pts</Badge>
                            </RadioGroupItem>
                            <RadioGroupItem id="strike-force" value="strike-force">
                                <span>Strike force</span>
                                <Badge variant="outlineAlt">2000 pts</Badge>
                            </RadioGroupItem>
                            <RadioGroupItem id="onslaught" value="onslaught">
                                <span>Onslaught</span>
                                <Badge variant="outlineAlt">3000 pts</Badge>
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    <div className="space-y-4">
                        <SplitHeading label="opposing forces" />
                        {lists.length ? (
                            <div className="space-y-2">
                                <Dropdown
                                    options={attackerListOptions}
                                    selectedLabel={attackerList?.name}
                                    placeholder="Select attacker list..."
                                    onSelect={(list) => setAttackerListId(list.id)}
                                    triggerClassName="bg-mournfangBrown text-fireDragonBright"
                                    renderOption={(list) => (
                                        <p className="text-left">
                                            <span className="text-blockcaps-m block">{list.name}</span>
                                            <span className="text-blockcaps-s">{list.factionName} - </span>
                                            <span className="text-blockcaps-s">{list.detachmentName}</span>
                                        </p>
                                    )}
                                />
                                <Dropdown
                                    options={defenderListOptions}
                                    selectedLabel={defenderList?.name}
                                    placeholder="Select defender list..."
                                    onSelect={(list) => setDefenderListId(list.id)}
                                    triggerClassName="bg-mournfangBrown text-fireDragonBright"
                                    renderOption={(list) => (
                                        <p className="text-left">
                                            <span className="text-blockcaps-m block">{list.name}</span>
                                            <span className="text-blockcaps-s">{list.factionName} - </span>
                                            <span className="text-blockcaps-s">{list.detachmentName}</span>
                                        </p>
                                    )}
                                />
                            </div>
                        ) : (
                            <div>
                                <EmptyState leadingIcon={<IconCrossedSwords />} label="No lists found. Create a list." />
                            </div>
                        )}
                    </div>
                </aside>
                <div className="grid grid-cols-[1fr_auto_1fr]">
                    <section className="border-1 border-skarsnikGreen">{attackerList ? <ForceOverViewCard force={attackerList} role="attacker" engagementPointsLimit={calculateEngagementPoints()} /> : <EmptyState leadingIcon={<IconList />} label="force missing or redacted" />}</section>
                    <div className="flex items-center px-2">
                        <span className="text-blockcaps-l">vs</span>
                    </div>
                    <section className="border-1 border-skarsnikGreen">{defenderList ? <ForceOverViewCard force={defenderList} role="defender" engagementPointsLimit={calculateEngagementPoints()} /> : <EmptyState leadingIcon={<IconList />} label="force missing or redacted" />}</section>
                </div>
            </div>
            <div className="max-w-[720px] w-full mx-auto border-2 border-fireDragonBright p-4 rounded">
                <AlertDialog variant="warning">
                    <AlertDialogTrigger asChild>
                        <Button variant="cta" className="w-full flex gap-4" disabled={!canCommence}>
                            <span>+++</span>
                            <span>Commence engagement</span>
                            <span>+++</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Commence Engagement</AlertDialogTitle>
                            <AlertDialogDescription>Once the engagement begins, the selected army lists will be locked. Any changes made to the lists after this point will not be reflected in the ongoing engagement.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCommenceEngagement}>Commence</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </main>
    );
};

export default CreateEngagement;
