import React from "react";
import clx from "classnames";

enum Colors {
    "inherit" = "fill-inherit",
    "default" = "fill-skarsnikGreen",
    "deathWorldForest" = "fill-deathWorldForest",
    "fireDragonBright" = "fill-fireDragonBright",
}

enum Sizes {
    "small" = "w-3 h-3",
    "medium" = "w-4 h-4",
    "large" = "w-6 h-6",
}

interface Props {
    children: React.ReactNode;
    size?: keyof typeof Sizes;
    width?: number;
    height?: number;
    viewBox?: string;
    color?: keyof typeof Colors;
    className?: string;
}

const BaseIcon = ({ children, size = "medium", width, height, viewBox = "0 0 24 24", color = "default", className }: Props) => {
    const classNames = clx("pointer-events-none", className, Sizes[size], Colors[color]);
    return (
        <svg viewBox={viewBox} className={classNames} width={width} height={height}>
            {children}
        </svg>
    );
};

export default BaseIcon;
