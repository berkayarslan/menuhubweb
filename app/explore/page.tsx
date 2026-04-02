import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurants } from "@/lib/api";

export default async function ExplorePage() {
  const restaurants = await getRestaurants();

  return (
    <main className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <h2>Keşfet</h2>
            <p>
              Restoranları sakin ve kompakt bir grid içinde gez. Gereksiz karmaşa olmadan,
              sadece karar vermen için gereken bilgi.
            </p>
          </div>
        </div>

        <div className="grid-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </main>
  );
}
