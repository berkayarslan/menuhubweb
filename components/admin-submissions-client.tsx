"use client";

import { useEffect, useMemo, useState } from "react";
import {
    approveSubmission,
    getAdminSubmissions,
    rejectSubmission,
    type Submission,
    type SubmissionStatus
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

function formatDate(value?: string) {
    if (!value) return "-";
    return new Date(value).toLocaleString("tr-TR");
}

export function AdminSubmissionsClient() {
    const [items, setItems] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<SubmissionStatus>("PENDING_REVIEW");

    async function load() {
        setLoading(true);
        setMessage("");

        try {
            const data = await getAdminSubmissions();
            setItems(data);
        } catch (error) {
            const text = error instanceof Error ? error.message : "Bilinmeyen hata";
            setMessage(`Submission listesi yüklenemedi (${text}).`);
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
            const updated = await approveSubmission(id);
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
            await load();
            setMessage("Submission onaylandı.");
        } catch {
            setMessage("Onay işlemi başarısız.");
        }
    }

    async function handleReject(id: number) {
        setMessage("");

        try {
            const updated = await rejectSubmission(id);
            setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
            await load();
            setMessage("Submission reddedildi.");
        } catch {
            setMessage("Red işlemi başarısız.");
        }
    }

    const sortedItems = useMemo(() => {
        return [...items]
            .filter(s => s.status === activeTab)
            .sort((a, b) => {
                const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bTime - aTime || b.id - a.id;
            });
    }, [items, activeTab]);

    if (loading) {
        return <div className="card">Yükleniyor...</div>;
    }

    const pendingCount = items.filter(s => s.status === "PENDING_REVIEW").length;
    const approvedCount = items.filter(s => s.status === "APPROVED").length;
    const rejectedCount = items.filter(s => s.status === "REJECTED").length;

    return (
        <div>
            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
                <button
                    onClick={() => setActiveTab("PENDING_REVIEW")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: activeTab === "PENDING_REVIEW" ? "#1e293b" : "transparent",
                        color: activeTab === "PENDING_REVIEW" ? "white" : "#64748b",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: activeTab === "PENDING_REVIEW" ? "600" : "400"
                    }}
                >
                    📋 İnceleme Bekleyen ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab("APPROVED")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: activeTab === "APPROVED" ? "#16a34a" : "transparent",
                        color: activeTab === "APPROVED" ? "white" : "#64748b",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: activeTab === "APPROVED" ? "600" : "400"
                    }}
                >
                    ✅ Onaylanmış ({approvedCount})
                </button>
                <button
                    onClick={() => setActiveTab("REJECTED")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: activeTab === "REJECTED" ? "#dc2626" : "transparent",
                        color: activeTab === "REJECTED" ? "white" : "#64748b",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: activeTab === "REJECTED" ? "600" : "400"
                    }}
                >
                    ❌ Reddedilmiş ({rejectedCount})
                </button>
            </div>

            {/* Submissions Grid */}
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

                        <div className="small" style={{ marginTop: 8, display: "grid", gap: 4 }}>
                            <span>Katkı Tarihi: {formatDate(submission.createdAt)}</span>
                            {submission.approvedAt ? <span>Admin Onay Tarihi: {formatDate(submission.approvedAt)}</span> : null}
                            {submission.rejectedAt ? <span>Admin Red Tarihi: {formatDate(submission.rejectedAt)}</span> : null}
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
                            >
                                {submission.status === "APPROVED" ? "✓ Onaylandı" : "Onayla"}
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => handleReject(submission.id)}
                            >
                                {submission.status === "REJECTED" ? "✗ Reddedildi" : "Reddet"}
                            </button>
                        </div>
                    </div>
                );
            })}

            {sortedItems.length === 0 ? (
                <div className="empty">
                    {activeTab === "PENDING_REVIEW" && "İnceleme bekleyen submission yok."}
                    {activeTab === "APPROVED" && "Onaylanmış submission yok."}
                    {activeTab === "REJECTED" && "Reddedilmiş submission yok."}
                </div>
            ) : null}

            {message ? <div className="notice" style={{ marginTop: 24 }}>{message}</div> : null}
            </div>
        </div>
    );
}