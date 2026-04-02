"use client";

import { useState } from "react";
import { adminLogin } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@menuhub.local");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await adminLogin({ email, password });
      if (typeof window !== "undefined" && (result as any)?.token) {
        localStorage.setItem("menuhub_admin_token", (result as any).token);
      }
      router.push("/admin/submissions");
    } catch {
      setMessage("Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="section-head">
          <div>
            <h2>Admin Girişi</h2>
            <p>Minimal ve dikkat dağıtmayan moderasyon girişi.</p>
          </div>
        </div>

        <form className="card form-grid" onSubmit={onSubmit}>
          <div>
            <div className="small" style={{ marginBottom: 8 }}>E-posta</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@menuhub.local"
            />
          </div>

          <div>
            <div className="small" style={{ marginBottom: 8 }}>Şifre</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          {message ? <div className="notice">{message}</div> : null}
        </form>
      </div>
    </main>
  );
}
