import Link from "next/link";
import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurants } from "@/lib/api";

export default async function HomePage() {
  const restaurants = await getRestaurants();
  const featured = restaurants.slice(0, 3);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <div className="hero-grid">
              <div>
                <span className="eyebrow">Yeni nesil menü deneyimi</span>
                <h1>Menüler, daha sakin bir şekilde.</h1>
                <p>
                  MenuHub; restoran menülerini, fiyat değişimlerini ve topluluk katkılarını
                  daha temiz, daha güvenli ve daha premium bir arayüzde bir araya getirir.
                </p>

                <div className="hero-actions">
                  <Link href="/explore" className="btn btn-primary">Keşfet</Link>
                  <Link href="/submit" className="btn btn-secondary">Katkı Gönder</Link>
                </div>
              </div>

              <div className="hero-panel">
                <div className="glass panel">
                  <strong style={{ fontSize: 22, letterSpacing: "-0.04em" }}>
                    Güncel fiyatlar, temiz yapı
                  </strong>
                  <p className="small" style={{ marginTop: 8 }}>
                    Liste kalabalığı yerine güçlü tipografi, dikkatli boşluk ve güven veren içerik akışı.
                  </p>
                </div>

                <div className="kpi">
                  <div className="glass panel">
                    <strong>Soft UI</strong>
                    <span>Premium ama sessiz</span>
                  </div>

                  <div className="glass panel">
                    <strong>Hızlı keşif</strong>
                    <span>Dikkat dağıtmayan akış</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Seçilmiş restoranlar</h2>
              <p>
                İlk bakışta güven veren, kategori ve fiyat akışı net olan restoran sayfaları.
              </p>
            </div>
          </div>

          <div className="grid-3">
            {featured.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            <div className="card">
              <h3>1. Keşfet</h3>
              <p>Yakınındaki restoranları veya ilgini çeken mutfakları hızlıca bul.</p>
            </div>

            <div className="card">
              <h3>2. Karşılaştır</h3>
              <p>Menü satırlarını tipografik ve sakin bir düzende incele.</p>
            </div>

            <div className="card">
              <h3>3. Katkı ver</h3>
              <p>Güncel menü bilgisini topluluk katkısıyla sisteme ekle.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
