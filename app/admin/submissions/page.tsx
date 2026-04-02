import { AdminSubmissionsClient } from "@/components/admin-submissions-client";
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

