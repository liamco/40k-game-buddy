import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";
import BaseIcon from "#components/icons/BaseIcon.tsx";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded border px-1 text-blockcaps-s py-0.5 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-skarsnikGreen text-deathWorldForest fill-deathWorldForest",
                secondary: "bg-deathWorldForest text-skarsnikGreen fill-skarsnikGreen",
                secondaryAlt: "bg-mournfangBrown text-fireDragonBright fill-fireDragonBright",
                destructive: "bg-wildRiderRed text-wordBearersRed fill-wordBearersRed ",
                outline: "text-skarsnikGreen border-skarsnikGreen fill-skarsnikGreen",
                outlineDark: "text-deathWorldForest border-deathWorldForest fill-deathWorldForest",
                outlineAlt: "text-fireDragonBright border-fireDragonBright fill-fireDragonBright",
                outlineDestructive: "border-wildRiderRed text-wildRiderRed fill-wildRiderRed ",
                leader: "bg-fireDragonBright text-mournfangBrown fill-mournfangBrown",
                leaderDestructive: "bg-wildRiderRed text-fireDragonBright fill-fireDragonBright border-fireDragonBright",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface BadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
    asChild?: boolean;
    icon?: React.ReactNode;
}

function Badge({ className, variant, asChild = false, icon, children, ...props }: BadgeProps) {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
            {icon && (
                <BaseIcon size="small" color="currentColor">
                    {icon}
                </BaseIcon>
            )}
            <span className="text-blockcaps-xs-tight">{children}</span>
        </Comp>
    );
}

export { Badge, badgeVariants };
