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
                </div>

                <AdminSubmissionsClient />
            </div>
        </main>
    );
}