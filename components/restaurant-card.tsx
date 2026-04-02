import Link from "next/link";
import type { Restaurant } from "@/lib/api";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="card restaurant-card">
      <div className="restaurant-top">
        <div>
          <h3>{restaurant.name}</h3>
          <p>{restaurant.descriptionText || "Düzenli olarak güncellenen, temiz bir restoran sayfası."}</p>
        </div>
        <span className="price-tag">Güncel Menü</span>
      </div>

      <div className="meta">
        {restaurant.cuisine && <span className="pill">{restaurant.cuisine}</span>}
        {restaurant.city && <span className="pill">{restaurant.city}</span>}
        {restaurant.district && <span className="pill">{restaurant.district}</span>}
      </div>
    </Link>
  );
}
