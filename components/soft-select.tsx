"use client";

import { useEffect, useRef, useState } from "react";

type SoftSelectProps = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    placeholder?: string;
};

export function SoftSelect({
                               value,
                               options,
                               onChange,
                               placeholder = "Seçiniz"
                           }: SoftSelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutside(event: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                style={{
                    width: "100%",
                    minHeight: 54,
                    padding: "0 18px",
                    borderRadius: 18,
                    border: open
                        ? "1px solid rgba(31,59,115,0.18)"
                        : "1px solid rgba(15,23,42,0.08)",
                    background: "rgba(255,255,255,0.88)",
                    color: "#121826",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: open
                        ? "0 14px 30px rgba(15,23,42,0.08)"
                        : "0 8px 24px rgba(15,23,42,0.04)",
                    backdropFilter: "blur(12px)",
                    transition: "all 160ms ease"
                }}
            >
        <span style={{ fontSize: 15, lineHeight: 1 }}>
          {value || placeholder}
        </span>

                <span
                    style={{
                        fontSize: 14,
                        color: "#596273",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 160ms ease"
                    }}
                >
          ▼
        </span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        padding: 8,
                        borderRadius: 20,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "rgba(255,255,255,0.98)",
                        boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                        backdropFilter: "blur(12px)"
                    }}
                >
                    {options.map((option) => {
                        const selected = option === value;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => {
                                    onChange(option);
                                    setOpen(false);
                                }}
                                style={{
                                    width: "100%",
                                    minHeight: 42,
                                    border: "none",
                                    textAlign: "left",
                                    padding: "0 14px",
                                    borderRadius: 12,
                                    cursor: "pointer",
                                    background: selected
                                        ? "rgba(31,59,115,0.08)"
                                        : "transparent",
                                    color: selected ? "#1f3b73" : "#121826",
                                    fontWeight: selected ? 600 : 500,
                                    transition: "all 140ms ease"
                                }}
                                onMouseEnter={(e) => {
                                    if (!selected) {
                                        e.currentTarget.style.background = "rgba(15,23,42,0.05)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!selected) {
                                        e.currentTarget.style.background = "transparent";
                                    }
                                }}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}