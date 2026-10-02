import * as React from "react"

export function FmdIcon({ className = "size-8", ...props }: React.ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            {...props}
        >
            <rect width="24" height="24" rx="5" fill="#07111f" />
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
                fill="#8bd450"
                fillOpacity="0.18"
                stroke="#8bd450"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect
                x="8.5"
                y="8.5"
                width="7"
                height="7"
                rx="1.5"
                fill="none"
                stroke="#8bd450"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="1.2" fill="#8bd450" />
            <line x1="8.5" y1="1.2" x2="8.5" y2="4" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="15.5" y1="1.2" x2="15.5" y2="4" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8.5" y1="20" x2="8.5" y2="22.8" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="15.5" y1="20" x2="15.5" y2="22.8" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1.2" y1="8.5" x2="4" y2="8.5" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="1.2" y1="15.5" x2="4" y2="15.5" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="20" y1="8.5" x2="22.8" y2="8.5" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="20" y1="15.5" x2="22.8" y2="15.5" stroke="#8bd450" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    )
}
