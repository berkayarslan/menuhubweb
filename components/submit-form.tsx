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

type MenuRow = {
    category: string;
    name: string;
    price: string;
};

export function SubmitForm({
                               restaurantId,
                               restaurantName
                           }: {
    restaurantId: number;
    restaurantName: string;
}) {
    const [sourceType, setSourceType] = useState("MANUAL");
    const [rows, setRows] = useState<MenuRow[]>([
        {
            category: CATEGORY_OPTIONS[0],
            name: "",
            price: ""
        }
    ]);
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

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const validRows = rows.filter(
                (row) => row.category.trim() && row.name.trim() && row.price.trim()
            );

            if (validRows.length === 0) {
                setMessage("En az bir menü satırı doldurmalısın.");
                setLoading(false);
                return;
            }

            const rawText = validRows
                .map((row) => `${row.category} | ${row.name.trim()} | ${row.price.trim()} TL`)
                .join("\n");

            await createSubmission({
                restaurantId,
                sourceType,
                rawText
            });

            setMessage(`${restaurantName} için katkı başarıyla gönderildi.`);
            setRows([
                {
                    category: CATEGORY_OPTIONS[0],
                    name: "",
                    price: ""
                }
            ]);
            setSourceType("MANUAL");
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

            <div className="form-grid">
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

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-secondary" onClick={addRow}>
                    Satır Ekle
                </button>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Gönderiliyor..." : "Katkıyı Gönder"}
                </button>
            </div>

            {message ? <div className="notice">{message}</div> : null}
        </form>
    );
}