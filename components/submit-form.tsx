"use client";

import { useState } from "react";
import { createSubmission } from "@/lib/api";
import { SoftSelect } from "@/components/soft-select";
import { SegmentedControl } from "@/components/segmented-control";
const CATEGORY_OPTIONS = [
    "Başlangıç",
    "Ana Yemek",
    "Burger",
    "Pizza",
    "Makarna",
    "Kebap",
    "Salata",
    "Tatlı",
    "İçecek",
    "Kahvaltı",
    "Diğer"
];

const SOURCE_OPTIONS = ["MANUAL", "WHATSAPP", "PDF", "PHOTO"];
const INPUT_MODE_OPTIONS = ["Form", "Toplu Metin"];

type MenuRow = {
    category: string;
    name: string;
    price: string;
};

type MenuItem = {
    category: string;
    name: string;
    priceAmount: number;
    currency: string;
};

export function SubmitForm({
                                restaurantId,
                                restaurantName
                            }: {
    restaurantId: number;
    restaurantName: string;
}) {
    const [inputMode, setInputMode] = useState("Form"); // "Form" veya "Toplu Metin"
    const [sourceType, setSourceType] = useState("MANUAL");
    const [rows, setRows] = useState<MenuRow[]>([
        {
            category: CATEGORY_OPTIONS[0],
            name: "",
            price: ""
        }
    ]);
    const [bulkText, setBulkText] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function updateRow(index: number, field: keyof MenuRow, value: string) {
        setRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    }

    function addRow() {
        setRows((prev) => [
            ...prev,
            {
                category: CATEGORY_OPTIONS[0],
                name: "",
                price: ""
            }
        ]);
    }

    function removeRow(index: number) {
        setRows((prev) => prev.filter((_, i) => i !== index));
    }

    // Toplu metin parsing: "Kategori | Adı | Fiyat Currency" ya da "Adı Fiyat"
    function parseBulkText(text: string): MenuItem[] {
        return text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => {
                const parts = line.split("|").map((p) => p.trim());

                if (parts.length >= 3) {
                    // Format: "Kategori | Adı | Fiyat Currency"
                    const category = parts[0] || "Diğer";
                    const name = parts[1];
                    const priceStr = parts[2];

                    const priceMatch = priceStr.match(/[\d.,]+/);
                    if (!priceMatch || !name) return null;

                    const priceAmount = parseFloat(priceMatch[0].replace(",", "."));
                    const currency = priceStr.match(/(TRY|₺|TL|USD|EUR)/i)?.[0] || "TRY";

                    return {
                        category: category.length > 0 ? category : "Diğer",
                        name,
                        priceAmount: isNaN(priceAmount) ? 0 : priceAmount,
                        currency: currency === "₺" ? "TRY" : currency === "TL" ? "TRY" : currency.toUpperCase()
                    };
                } else if (parts.length === 2) {
                    // Format: "Adı | Fiyat"
                    const name = parts[0];
                    const priceStr = parts[1];

                    const priceMatch = priceStr.match(/[\d.,]+/);
                    if (!priceMatch || !name) return null;

                    const priceAmount = parseFloat(priceMatch[0].replace(",", "."));
                    const currency = priceStr.match(/(TRY|₺|TL|USD|EUR)/i)?.[0] || "TRY";

                    return {
                        category: "Diğer",
                        name,
                        priceAmount: isNaN(priceAmount) ? 0 : priceAmount,
                        currency: currency === "₺" ? "TRY" : currency === "TL" ? "TRY" : currency.toUpperCase()
                    };
                } else if (parts.length === 1) {
                    // Format: "Adı Fiyat"
                    const match = line.match(/^(.*?)\s+([\d.,]+)\s*(TRY|₺|TL|USD|EUR)?$/i);
                    if (match) {
                        const name = match[1].trim();
                        const priceAmount = parseFloat(match[2].replace(",", "."));
                        const currency = match[3] ? (match[3] === "₺" ? "TRY" : match[3] === "TL" ? "TRY" : match[3].toUpperCase()) : "TRY";

                        if (name && !isNaN(priceAmount)) {
                            return {
                                category: "Diğer",
                                name,
                                priceAmount,
                                currency
                            };
                        }
                    }
                }

                return null;
            })
            .filter((item): item is MenuItem => item !== null);
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (inputMode === "Form") {
                // Form modu: Manuel giriş
                const validRows = rows.filter(
                    (row) => row.category.trim() && row.name.trim() && row.price.trim()
                );

                if (validRows.length === 0) {
                    setMessage("En az bir menü satırı doldurmalısın.");
                    setLoading(false);
                    return;
                }

                // items[] formatında gönder
                const items: MenuItem[] = validRows.map((row) => ({
                    category: row.category,
                    name: row.name.trim(),
                    priceAmount: parseFloat(row.price) || 0,
                    currency: "TRY"
                }));

                await createSubmission({
                    restaurantId,
                    sourceType,
                    items
                });

                setMessage(`${restaurantName} için ${items.length} menü ögesi başarıyla gönderildi.`);
                setRows([
                    {
                        category: CATEGORY_OPTIONS[0],
                        name: "",
                        price: ""
                    }
                ]);
                setSourceType("MANUAL");
            } else {
                // Toplu Metin modu
                if (!bulkText.trim()) {
                    setMessage("Lütfen metin gir.");
                    setLoading(false);
                    return;
                }

                const items = parseBulkText(bulkText);

                if (items.length === 0) {
                    setMessage("Geçerli menü ögesi bulunamadı. Lütfen formatı kontrol et.");
                    setLoading(false);
                    return;
                }

                await createSubmission({
                    restaurantId,
                    sourceType,
                    items
                });

                setMessage(`${restaurantName} için ${items.length} menü ögesi başarıyla gönderildi.`);
                setBulkText("");
            }
        } catch (error) {
            setMessage("Gönderim sırasında sorun oluştu. Backend endpointlerini kontrol et.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="card form-grid" onSubmit={onSubmit}>
            <div>
                <div className="small" style={{ marginBottom: 8 }}>
                    Seçili Restoran
                </div>
                <input className="input" value={restaurantName} disabled />
            </div>

            <div>
                <div className="small" style={{ marginBottom: 8 }}>
                    Kaynak Tipi
                </div>
                <div>
                    <SegmentedControl
                        value={sourceType}
                        options={SOURCE_OPTIONS}
                        onChange={setSourceType}
                    />
                </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
                <div className="small" style={{ marginBottom: 8 }}>
                    Giriş Modu
                </div>
                <SegmentedControl
                    value={inputMode}
                    options={INPUT_MODE_OPTIONS}
                    onChange={setInputMode}
                />
            </div>

            {inputMode === "Form" ? (
                <>
                    <div className="form-grid" style={{ gridColumn: "1 / -1" }}>
                        {rows.map((row, index) => (
                            <div key={index} className="menu-contribution-row">
                                <div>
                                    <div className="small" style={{ marginBottom: 8 }}>
                                        Kategori
                                    </div>
                                    <div>
                                        <SoftSelect
                                            value={row.category}
                                            options={CATEGORY_OPTIONS}
                                            onChange={(value) => updateRow(index, "category", value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="small" style={{ marginBottom: 8 }}>
                                        Yemek Adı
                                    </div>
                                    <input
                                        className="input"
                                        value={row.name}
                                        onChange={(e) => updateRow(index, "name", e.target.value)}
                                        placeholder="Örn: Truffle Cheeseburger"
                                    />
                                </div>

                                <div>
                                    <div className="small" style={{ marginBottom: 8 }}>
                                        Fiyat
                                    </div>
                                    <input
                                        className="input"
                                        value={row.price}
                                        onChange={(e) => updateRow(index, "price", e.target.value)}
                                        placeholder="Örn: 395"
                                        inputMode="decimal"
                                    />
                                </div>

                                <div style={{ display: "flex", alignItems: "end" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => removeRow(index)}
                                        disabled={rows.length === 1}
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", gridColumn: "1 / -1" }}>
                        <button type="button" className="btn btn-secondary" onClick={addRow}>
                            Satır Ekle
                        </button>

                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? "Gönderiliyor..." : "Katkıyı Gönder"}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <div className="small" style={{ marginBottom: 8 }}>
                            Metin Formatı (Örnekler)
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                            <div>• <strong>Kategori | Adı | Fiyat Currency:</strong></div>
                            <div style={{ marginLeft: 20, marginBottom: 8 }}>
                                Başlangıç | Burrata | 260 TRY<br/>
                                Ana Yemek | Limonlu Tavuk | 420 TRY
                            </div>
                            <div>• <strong>Adı | Fiyat:</strong></div>
                            <div style={{ marginLeft: 20, marginBottom: 8 }}>
                                Truffle Cheeseburger | 395 TRY<br/>
                                Ev Limonatası | 85
                            </div>
                            <div>• <strong>Adı Fiyat:</strong></div>
                            <div style={{ marginLeft: 20 }}>
                                Burrata 260<br/>
                                Limonlu Tavuk 420 TRY
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                        <div className="small" style={{ marginBottom: 8 }}>
                            Metin
                        </div>
                        <textarea
                            className="input"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            placeholder="Menü ögelerini yapıştır. Her satır bir ögedir."
                            rows={8}
                            style={{ fontFamily: "monospace", fontSize: 12 }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", gridColumn: "1 / -1" }}>
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? "Gönderiliyor..." : "Katkıyı Gönder"}
                        </button>
                    </div>
                </>
            )}

            {message ? <div className="notice" style={{ gridColumn: "1 / -1" }}>{message}</div> : null}
        </form>
    );
}