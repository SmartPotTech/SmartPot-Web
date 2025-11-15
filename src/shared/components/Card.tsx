import React, {ReactNode} from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg" | "xl";
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
    hover?: boolean;
    onClick?: () => void;
}

const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
    xl: "p-8"
};

const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl"
};

const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    shadow = "md",
    hover = false,
    onClick
}) => {
    const baseClasses = "bg-white rounded-lg w-full";
    const paddingClass = paddingClasses[padding];
    const shadowClass = shadowClasses[shadow];
    const hoverClass = hover ? " hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" : "";
    const clickableClass = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${baseClasses} ${paddingClass} ${shadowClass} ${hoverClass} ${clickableClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
