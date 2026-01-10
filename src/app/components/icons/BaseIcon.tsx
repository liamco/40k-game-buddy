import React from "react";
import clx from "classnames";

enum Colors {
    "default" = "fill-skarsnikGreen",
    "tertiary-300" = "fill-tertiary-300",
    "tertiary-400" = "fill-tertiary-400",
    "tertiary-500" = "fill-tertiary-500",
    "secondary-100" = "fill-secondary-100",
    "secondary-500" = "fill-secondary-500",
    "secondary-600" = "fill-secondary-600",
}

enum Sizes {
    "small" = "w-3 h-3",
    "medium" = "w-4 h-4",
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
