import Link from "next/link";
import { SubmitForm } from "@/components/submit-form";
import { getRestaurant } from "@/lib/api";

export default async function RestaurantSubmitPage({
                                                       params
                                                   }: {
    params: { id: string };
}) {
    const id = Number(params.id);
    const restaurant = await getRestaurant(id);

    if (!restaurant) {
        return (
            <main className="section">
                <div className="container">
                    <div className="empty">Restoran bulunamadı.</div>
                </div>
            </main>
        );
    }

    return (
        <main className="section">
            <div className="container">
                <div className="section-head">
                    <div>
                        <h2>Menü Katkısı</h2>
                        <p>
                            Katkı doğrudan <strong>{restaurant.name}</strong> restoranına gönderilecek.
                            Restoran ID girmen gerekmiyor.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <Link href={`/restaurants/${restaurant.id}/submit`} className="btn btn-primary">
                            Bu restorana katkı ver
                        </Link>

                        <Link href="/explore" className="btn btn-secondary">
                            Geri Dön
                        </Link>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="card">
                        <h3>Seçili Restoran</h3>
                        <p style={{ marginTop: 8 }}>
                            {restaurant.name}
                        </p>

                        <div className="meta">
                            {restaurant.cuisine && <span className="pill">{restaurant.cuisine}</span>}
                            {restaurant.city && <span className="pill">{restaurant.city}</span>}
                            {restaurant.district && <span className="pill">{restaurant.district}</span>}
                        </div>

                        <div className="spacer-lg" />

                        <p className="form-note">
                            Kategori dropdown’dan seçilir. Yemek adı ve fiyat manuel girilir.
                            Form gönderildiğinde backend’e uygun metin formatı otomatik oluşturulur.
                        </p>
                    </div>

                    <SubmitForm
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                    />
                </div>
            </div>
        </main>
    );
}