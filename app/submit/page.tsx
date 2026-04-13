import Link from "next/link";

export default function SubmitPage() {
    return (
        <main className="section">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="card">
                    <h2 style={{ marginTop: 0 }}>Önce restoran seç</h2>
                    <p className="form-note" style={{ marginTop: 12 }}>
                        Katkı gönderirken restoran ID yazmak yerine önce ilgili restoranı seçiyoruz.
                        Sonra katkı ekranı o restorana otomatik bağlanıyor.
                    </p>

                    <div style={{ marginTop: 20 }}>
                        <Link href="/" className="btn btn-secondary" style={{ marginRight: 10 }}>
                            Geri Dön
                        </Link>
                        <Link href="/explore" className="btn btn-primary">
                            Restoranları Keşfet
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}