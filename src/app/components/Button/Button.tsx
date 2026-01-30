import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

import styles from "./Button.module.css";

const buttonVariants = cva(
    "inline-flex uppercase cursor-pointer rounded items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "bg-fireDragonBright text-rhinoxHide px-3 py-2 shadow-glow-orange hover:bg-tuskorFur",
                cta: `px-6 py-4 bg-fireDragonBright text-rhinoxHide ${styles.Cta} `,
                secondary: "bg-skarsnikGreen text-nocturneGreen px-3 py-2 shadow-glow-green hover:bg-deathWorldForest",
                outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                destructive: "bg-wildRiderRed text-wordBearersRed hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                ghost: "bg-transparent text-fireDragonBright px-3 py-2 text-shadow-glow-green hover:bg-mournfangBrown",
                ghostSecondary: "bg-transparent text-skarsnikGreen px-3 py-2 text-shadow-glow-orange hover:bg-deathWorldForest",
                ghostDestructive: "bg-transparent text-wildRiderRed px-3 py-2 text-shadow-glow-orange hover:bg-mournfangBrown",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export const buttonClasses = {
    ghost: "uppercase tracking-[15%] inline-block bg-transparent text-skarsnikGreen px-3 py-2 rounded text-shadow-glow-green hover:bg-deathWorldForest",
    primary: "uppercase tracking-[15%] inline-block bg-fireDragonBright text-mournfangBrown px-3 py-2 rounded shadow-glow-orange",
    secondary: "uppercase tracking-[15%] inline-block bg-skarsnikGreen text-nocturneGreen px-3 py-2 rounded shadow-glow-green",
    destructive: "uppercase tracking-[15%] inline-block bg-destructive text-white hover:bg-destructive/90  px-3 py-2 rounded focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
};

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
