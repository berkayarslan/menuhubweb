"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Restaurant } from "@/lib/api";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();

  return (
    <div
      className="card restaurant-card restaurant-card-clickable"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/menu/${restaurant.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/menu/${restaurant.id}`);
        }
      }}
      aria-label={`${restaurant.name} menü sayfasına git`}
    >
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

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link
          href={`/menu/${restaurant.id}`}
          style={{ width: "100%" }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <button className="btn btn-secondary" style={{ width: "100%" }}>
            Menüyü Gör
          </button>
        </Link>
      </div>
    </div>
  );
}
