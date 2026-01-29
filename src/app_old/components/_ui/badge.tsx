import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva("inline-flex items-center justify-center rounded border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden", {
    variants: {
        variant: {
            default: "bg-skarsnikGreen text-deathWorldForest fill-deathWorldForest",
            secondary: "bg-deathWorldForest text-skarsnikGreen fill-skarsnikGreen",
            destructive: "border-wildRiderRed text-wildRiderRed fill-wildRiderRed ",
            outline: "text-skarsnikGreen border-skarsnikGreen fill-skarsnikGreen",
            outlineDark: "text-deathWorldForest border-deathWorldForest fill-deathWorldForest",
            outlineAlt: "text-fireDragonBright border-fireDragonBright fill-fireDragonBright",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span";

    return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
