"use client";

import { useEffect, useState } from "react";
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


export function AdminSubmissionsClient() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getAdminSubmissions();
      setItems(data);
    } catch (e) {
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

  if (loading) {
    return <div className="card">Yükleniyor...</div>;
  }

  return (
    <div className="grid-2">
      {items.map((submission) => (
        <div className="card" key={submission.id}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <strong>Submission #{submission.id}</strong>
            <span className={statusClass(submission.status)}>{submission.status}</span>
          </div>

          <div className="spacer-lg" />

          <div className="small">
            {submission.restaurantName ? `Restoran ADI: ${submission.restaurantName} · ` : ""}
            Restaurant ID: {submission.restaurantId} · Kaynak: {submission.sourceType}
          </div>

          <div className="small" style={{ marginTop: 8 }}>
            {submission.createdAt ? new Date(submission.createdAt).toLocaleString("tr-TR") : "Tarih yok"}
          </div>

          <div className="spacer-lg" />

          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              color: "var(--muted)",
              fontFamily: "inherit",
              lineHeight: 1.7
            }}
          >

            {submission.rawText}
          </pre>

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
      ))}

      {items.length === 0 ? <div className="empty">Henüz submission yok.</div> : null}

      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}
