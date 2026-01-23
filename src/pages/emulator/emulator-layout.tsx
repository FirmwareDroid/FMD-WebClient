interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    gap?: number;
    style?: React.CSSProperties;
    align?: string;
    flex?: number;
}

/* Small layout primitives (flex wrappers) */
export function Stack({ children, gap = 12, style = {}, ...props }: FlexProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function RowLayout({ children, gap = 12, align = "center", style = {}, ...props }: FlexProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap,
                alignItems: align,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function Col({ children, flex = 1, style = {}, ...props }: FlexProps) {
    return (
        <div
            style={{
                flex,
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
            {...props}
        >
            {children}
        </div>
    );
}

interface EmuUrlInputProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export function EmuUrlInput({
                                id = "emulator-url",
                                value,
                                onChange,
                                placeholder = "Emulator URL",
                                className = "",
                            }: EmuUrlInputProps) {
    return (
        <input
            id={id}
            className={`emulator-input ${className}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
                display: "block",
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid var(--input-border, rgba(0,0,0,0.06))",
                background: "transparent",
                color: "inherit",
                boxSizing: "border-box",
            }}
        />
    );
}
