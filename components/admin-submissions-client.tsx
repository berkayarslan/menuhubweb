"use client";

import { useEffect, useMemo, useState } from "react";
import {
    approveSubmission,
    getAdminSubmissions,
    rejectSubmission,
    type Submission
} from "@/lib/api";

function statusClass(status: string) {
    if (status === "APPROVED") return "status status-approved";
    if (status === "REJECTED") return "status status-rejected";
    return "status status-pending";
}

function parseSubmissionRows(rawText: string) {
    return rawText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const parts = line.split("|").map((x) => x.trim());

            return {
                category: parts[0] || "Diğer",
                name: parts[1] || line,
                price: parts[2] || ""
            };
        });
}

export function AdminSubmissionsClient() {
    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    async function load() {
        setLoading(true);

        try {
            const data = await getAdminSubmissions();
            setItems(data);
        } catch {
            setMessage("Submission listesi yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleApprove(id: number) {
        setMessage("");

        try {
            await approveSubmission(id);
            await load();
            setMessage("Submission onaylandı.");
        } catch {
            setMessage("Onay işlemi başarısız.");
        }
    }

    async function handleReject(id: number) {
        setMessage("");

        try {
            await rejectSubmission(id);
            await load();
            setMessage("Submission reddedildi.");
        } catch {
            setMessage("Red işlemi başarısız.");
        }
    }

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const aPending = a.status === "PENDING_REVIEW" ? 0 : 1;
            const bPending = b.status === "PENDING_REVIEW" ? 0 : 1;

            if (aPending !== bPending) return aPending - bPending;

            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            return bTime - aTime || b.id - a.id;
        });
    }, [items]);

    if (loading) {
        return <div className="card">Yükleniyor...</div>;
    }

    return (
        <div className="grid-2">
            {sortedItems.map((submission) => {
                const rows = parseSubmissionRows(submission.rawText);

                return (
                    <div className="card" key={submission.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <strong>Submission #{submission.id}</strong>
                            <span className={statusClass(submission.status)}>
                {submission.status}
              </span>
                        </div>

                        <div className="spacer-lg" />

                        <div className="small">
                            {submission.restaurantName
                                ? `Restoran ADI: ${submission.restaurantName} · `
                                : ""}
                            Restaurant ID: {submission.restaurantId} · Kaynak: {submission.sourceType}
                        </div>

                        <div className="small" style={{ marginTop: 8 }}>
                            {submission.createdAt
                                ? new Date(submission.createdAt).toLocaleString("tr-TR")
                                : "Tarih yok"}
                        </div>

                        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                            {rows.map((row, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid rgba(148,163,184,0.2)",
                                        borderRadius: 12,
                                        background: "rgba(255,255,255,0.04)"
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                                    <div style={{ color: "#94a3b8", fontSize: 13 }}>
                                        {row.category} {row.price ? `· ${row.price}` : ""}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="admin-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleApprove(submission.id)}
                                disabled={submission.status !== "PENDING_REVIEW"}
                            >
                                Onayla
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => handleReject(submission.id)}
                                disabled={submission.status !== "PENDING_REVIEW"}
                            >
                                Reddet
                            </button>
                        </div>
                    </div>
                );
            })}

            {sortedItems.length === 0 ? (
                <div className="empty">Henüz submission yok.</div>
            ) : null}

            {message ? <div className="notice">{message}</div> : null}
        </div>
    );
}