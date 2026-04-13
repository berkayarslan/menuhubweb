import Link from "next/link";
import { AdminSubmissionsClient } from "@/components/admin-submissions-client";

export default function AdminSubmissionsPage() {
    return (
        <main className="section">
            <div className="container">
                <div className="section-head">
                    <div>
                        <h2>Submission Moderasyonu</h2>
                        <p>
                            Restoran adı, restoran ID, kaynak tipi ve ham içerik birlikte görünür.
                            Onay / red akışı premium ama işlevsel bir yüzeyde tutulur.
                        </p>
                    </div>
                    <Link href="/admin/login" className="btn btn-secondary">Geri Dön</Link>
                </div>

                <AdminSubmissionsClient />
            </div>
        </main>
    );
}