"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex w-fit items-center justify-center gap-1 border-b border-skarsnikGreen", className)} {...props} />;
}

function TabsTrigger({ className, disabled, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            disabled={disabled}
            data-slot="tabs-trigger"
            className={cn(
                "cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-skarsnikGreen/60 whitespace-nowrap border-b-2 border-transparent transition-colors",
                "hover:text-skarsnikGreen",
                "data-[state=active]:text-deathWorldForest data-[state=active]:bg-skarsnikGreen",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skarsnikGreen/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
