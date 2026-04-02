"use client";

type SegmentedControlProps = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

export function SegmentedControl({
                                     value,
                                     options,
                                     onChange
                                 }: SegmentedControlProps) {
    return (
        <div
            style={{
                display: "inline-flex",
                gap: 8,
                padding: 6,
                borderRadius: 18,
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                flexWrap: "wrap"
            }}
        >
            {options.map((option) => {
                const selected = option === value;

                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        style={{
                            border: "none",
                            outline: "none",
                            cursor: "pointer",
                            minHeight: 40,
                            padding: "0 16px",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: selected ? 600 : 500,
                            background: selected ? "#121826" : "transparent",
                            color: selected ? "#fff" : "#121826",
                            boxShadow: selected ? "0 8px 20px rgba(15,23,42,0.16)" : "none",
                            transition: "all 160ms ease"
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}