"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "../utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

function RadioGroupItem({ className, children, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item data-slot="radio-group-item" className={cn("text-fireDragonBright cursor-pointer text-left flex justify-between items-start p-3 bg-mournfangBrown rounded", className)} {...props}>
            <div className="space-y-1">{children}</div>
            <div className="p-2 border-1 border-fireDragonBright relative flex items-center justify-center">
                <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator">
                    <span className="absolute block top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 bg-fireDragonBright" />
                </RadioGroupPrimitive.Indicator>
            </div>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
