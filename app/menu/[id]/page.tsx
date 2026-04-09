"use client";

import { useEffect, useState } from "react";
import { getMenuItems, getRestaurant, type MenuItem, type Restaurant } from "@/lib/api";

export default function MenuPage({ params }: { params: { id: string } }) {
    const restaurantId = parseInt(params.id);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [rest, items] = await Promise.all([
                    getRestaurant(restaurantId),
                    getMenuItems(restaurantId)
                ]);
                setRestaurant(rest);
                setMenuItems(items);
            } catch (e) {
                setError("Menü yüklenemedi");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [restaurantId]);

    if (loading) {
        return <main className="section"><div className="container"><div className="card">Yükleniyor...</div></div></main>;
    }

    if (!restaurant) {
        return <main className="section"><div className="container"><div className="card">Restoran bulunamadı</div></div></main>;
    }

    function formatDate(value?: string) {
        if (!value) return "-";
        return new Date(value).toLocaleString("tr-TR");
    }

    // Group menu items by category
    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const categories = Object.keys(groupedItems).sort();
    const lastMenuUpdate = menuItems
        .map((item) => item.updatedAt || item.approvedAt || item.createdAt)
        .filter(Boolean)
        .sort()
        .at(-1);
    const isApprovedRestaurant = restaurant.approved === true || restaurant.approvalStatus === "APPROVED";

    return (
        <main className="section">
            <div className="container">
                {/* Restaurant Header */}
                <div className="card" style={{ marginBottom: 32 }}>
                    <div style={{ marginBottom: 16 }}>
                        <h1 style={{ margin: "0 0 8px 0" }}>{restaurant.name}</h1>
                        <div style={{ color: "#64748b", fontSize: "14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                            {restaurant.cuisine && <span>🍽️ {restaurant.cuisine}</span>}
                            {restaurant.city && <span>📍 {restaurant.city}{restaurant.district ? `, ${restaurant.district}` : ""}</span>}
                        </div>
                    </div>
                    {restaurant.descriptionText && (
                        <p style={{ color: "#475569", margin: 0 }}>{restaurant.descriptionText}</p>
                    )}
                    <div style={{ marginTop: 16, padding: "12px", backgroundColor: isApprovedRestaurant ? "#ecfdf5" : "#fff7ed", borderRadius: 8, color: isApprovedRestaurant ? "#047857" : "#b45309" }}>
                        {isApprovedRestaurant ? "✅ Bu restoran menüsü onaylı" : "⏳ Bu restoranın menü katkıları inceleniyor"}
                    </div>
                    <div className="small" style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span>Kategori: {categories.length}</span>
                        <span>Ürün: {menuItems.length}</span>
                        <span>Son Menü Güncelleme: {formatDate(lastMenuUpdate)}</span>
                    </div>
                </div>

                {/* Menu */}
                {error ? (
                    <div className="card" style={{ color: "#dc2626" }}>{error}</div>
                ) : menuItems.length === 0 ? (
                    <div className="card">Menü öğesi bulunamadı</div>
                ) : (
                    <div>
                        {categories.map((category) => (
                            <div key={category} style={{ marginBottom: 32 }}>
                                <h2 style={{
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    marginBottom: 16,
                                    paddingBottom: 12,
                                    borderBottom: "2px solid #e2e8f0"
                                }}>
                                    {category}
                                </h2>
                                <div style={{ display: "grid", gap: 16 }}>
                                    {groupedItems[category]?.map((item) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                padding: 16,
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 12,
                                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                                                <div>
                                                    <div style={{ fontWeight: "600", fontSize: "16px" }}>
                                                        {item.name}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: "18px",
                                                    fontWeight: "700",
                                                    color: "#047857",
                                                    whiteSpace: "nowrap",
                                                    marginLeft: 16
                                                }}>
                                                    {item.priceAmount} {item.currency}
                                                </div>
                                            </div>
                                            {item.descriptionText && (
                                                <div style={{ color: "#64748b", fontSize: "14px" }}>
                                                    {item.descriptionText}
                                                </div>
                                            )}
                                            <div style={{ color: "#64748b", fontSize: "12px", marginTop: 8, display: "grid", gap: 2 }}>
                                                <span>Katkı Tarihi: {formatDate(item.submittedAt || item.createdAt)}</span>
                                                <span>Onay Tarihi: {formatDate(item.approvedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

