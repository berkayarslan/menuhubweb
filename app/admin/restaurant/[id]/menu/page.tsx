"use client";

import { useEffect, useState } from "react";
import {
    deleteMenuItem,
    getMenuItems,
    getRestaurant,
    updateMenuItem,
    type MenuItem,
    type Restaurant
} from "@/lib/api";

export default function AdminMenuPage({ params }: { params: { id: string } }) {
    const restaurantId = parseInt(params.id);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<MenuItem>>({});
    const [message, setMessage] = useState("");

    async function loadData() {
        setLoading(true);
        try {
            const [rest, items] = await Promise.all([
                getRestaurant(restaurantId),
                getMenuItems(restaurantId)
            ]);
            setRestaurant(rest);
            setMenuItems(items);
        } catch (e) {
            setMessage("Menü verisi yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [restaurantId]);

    const handleEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setEditData(item);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            setMessage("");
            const payload = {
                name: (editData.name || "").trim(),
                category: (editData.category || "Diğer").trim(),
                priceAmount: Number(editData.priceAmount || 0),
                currency: (editData.currency || "TRY").trim().toUpperCase(),
                descriptionText: editData.descriptionText || ""
            };

            if (!payload.name || payload.priceAmount <= 0) {
                setMessage("Ürün adı ve fiyat zorunludur.");
                return;
            }

            const updated = await updateMenuItem(editingId, payload);
            setMenuItems(items =>
                items.map(item =>
                    item.id === editingId ? { ...item, ...updated } : item
                )
            );
            setEditingId(null);
            setEditData({});
            setMessage("Menü ürünü güncellendi.");
        } catch (e) {
            setMessage("Menü ürünü güncellenemedi.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;

        try {
            setMessage("");
            await deleteMenuItem(id);
            setMenuItems(items => items.filter(item => item.id !== id));
            setMessage("Ürün menüden silindi.");
        } catch (e) {
            setMessage("Ürün silinemedi.");
        }
    };

    if (loading) {
        return <main className="section"><div className="container">Yükleniyor...</div></main>;
    }

    if (!restaurant) {
        return <main className="section"><div className="container">Restoran bulunamadı</div></main>;
    }

    const groupedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <main className="section">
            <div className="container">
                <div style={{ marginBottom: 32 }}>
                    <h1>{restaurant.name} - Menü Yönetimi</h1>
                    <p>Toplam {menuItems.length} ürün</p>
                    {message ? <div className="notice" style={{ marginTop: 12 }}>{message}</div> : null}
                </div>

                {menuItems.length === 0 ? (
                    <div className="card">
                        ⚠️ Bu restoran için menü öğesi bulunamadı
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} style={{ marginBottom: 32 }}>
                            <h2 style={{
                                fontSize: "18px",
                                fontWeight: "600",
                                marginBottom: 16,
                                paddingBottom: 8,
                                borderBottom: "2px solid #e2e8f0"
                            }}>
                                {category}
                            </h2>

                            <div style={{ display: "grid", gap: 12 }}>
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            padding: 16,
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 8,
                                            backgroundColor: "#f8fafc"
                                        }}
                                    >
                                        {editingId === item.id ? (
                                            // Edit Mode
                                            <div style={{ display: "grid", gap: 12 }}>
                                                <input
                                                    className="input"
                                                    value={editData.name || ""}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    placeholder="Ürün adı"
                                                />
                                                <input
                                                    className="input"
                                                    type="number"
                                                    value={editData.priceAmount || 0}
                                                    onChange={(e) => setEditData({ ...editData, priceAmount: parseFloat(e.target.value) })}
                                                    placeholder="Fiyat"
                                                />
                                                <textarea
                                                    className="input"
                                                    value={editData.descriptionText || ""}
                                                    onChange={(e) => setEditData({ ...editData, descriptionText: e.target.value })}
                                                    placeholder="Açıklama"
                                                    rows={2}
                                                />
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={handleSaveEdit}
                                                    >
                                                        Kaydet
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        İptal
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                                                    <div>
                                                        <div style={{ fontWeight: "600" }}>{item.name}</div>
                                                        {item.descriptionText && (
                                                            <div style={{ color: "#64748b", fontSize: "14px" }}>
                                                                {item.descriptionText}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#047857" }}>
                                                        {item.priceAmount} {item.currency}
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleEdit(item)}
                                                        style={{ fontSize: "12px", padding: "6px 12px" }}
                                                    >
                                                        ✏️ Düzenle
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDelete(item.id)}
                                                        style={{ fontSize: "12px", padding: "6px 12px", color: "#dc2626" }}
                                                    >
                                                        🗑️ Sil
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

