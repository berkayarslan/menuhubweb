export type Restaurant = {
  id: number;
  name: string;
  cuisine?: string;
  city?: string;
  district?: string;
  descriptionText?: string;
};

export type MenuItem = {
  id: number;
  category: string;
  name: string;
  descriptionText?: string | null;
  priceAmount: number;
  currency: string;
};

export type Submission = {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  sourceType: string;
  rawText: string;
  status: string;
  createdAt?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Minoa Kitchen",
    cuisine: "Modern Akdeniz",
    city: "İstanbul",
    district: "Kadıköy",
    descriptionText: "Sade atmosfer, temiz menü akışı ve düzenli güncellenen fiyatlar."
  },
  {
    id: 2,
    name: "Heim Burger Atelier",
    cuisine: "Burger",
    city: "İstanbul",
    district: "Beşiktaş",
    descriptionText: "Bestseller odaklı, kompakt ve premium bir menü deneyimi."
  },
  {
    id: 3,
    name: "Mori Noodle Bar",
    cuisine: "Asya",
    city: "Ankara",
    district: "Çankaya",
    descriptionText: "Rahat keşif, sakin renkler ve açıklayıcı menü yapısı."
  }
];

const mockMenus: Record<number, MenuItem[]> = {
  1: [
    { id: 11, category: "Başlangıç", name: "Burrata", descriptionText: "Domates, fesleğen yağı", priceAmount: 260, currency: "TRY" },
    { id: 12, category: "Ana Yemek", name: "Limonlu Tavuk", descriptionText: "Köz sebzeler ile", priceAmount: 420, currency: "TRY" },
    { id: 13, category: "Tatlı", name: "San Sebastian", descriptionText: "Günlük servis", priceAmount: 190, currency: "TRY" }
  ],
  2: [
    { id: 21, category: "Burger", name: "Classic Smash", descriptionText: "Patates ile", priceAmount: 340, currency: "TRY" },
    { id: 22, category: "Burger", name: "Truffle Cheeseburger", descriptionText: "Cheddar, turşu, özel sos", priceAmount: 395, currency: "TRY" },
    { id: 23, category: "İçecek", name: "Ev Limonatası", descriptionText: null, priceAmount: 85, currency: "TRY" }
  ],
  3: [
    { id: 31, category: "Noodle", name: "Miso Ramen", descriptionText: "Yumurta, mısır, mantar", priceAmount: 320, currency: "TRY" },
    { id: 32, category: "Noodle", name: "Spicy Beef Udon", descriptionText: "Acı sos ile", priceAmount: 360, currency: "TRY" },
    { id: 33, category: "İçecek", name: "Soğuk Matcha", descriptionText: null, priceAmount: 110, currency: "TRY" }
  ]
};

const mockSubmissions: Submission[] = [
  {
    id: 101,
    restaurantId: 2,
    restaurantName: "Heim Burger Atelier",
    sourceType: "WHATSAPP",
    rawText: "Burger | Truffle Cheeseburger | 395 TL",
    status: "PENDING_REVIEW",
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    restaurantId: 1,
    restaurantName: "Minoa Kitchen",
    sourceType: "PDF",
    rawText: "Ana Yemek | Limonlu Tavuk | 420 TL",
    status: "APPROVED",
    createdAt: new Date().toISOString()
  }
];

async function fetchJSON<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

export async function getRestaurants(): Promise<Restaurant[]> {
  return fetchJSON("/restaurants", undefined, mockRestaurants);
}

export async function getRestaurant(id: number): Promise<Restaurant | null> {
  const fallback = mockRestaurants.find((x) => x.id === id) || null;
  return fetchJSON(`/restaurants/${id}`, undefined, fallback);
}

export async function getMenuItems(restaurantId: number): Promise<MenuItem[]> {
  return fetchJSON(`/menu-items?restaurantId=${restaurantId}`, undefined, mockMenus[restaurantId] || []);
}

export async function createSubmission(payload: {
  restaurantId: number;
  sourceType: string;
  rawText: string;
}) {
  return fetchJSON("/submissions", {
    method: "POST",
    body: JSON.stringify(payload)
  }, { ok: true });
}

export async function adminLogin(payload: { email: string; password: string }) {
  return fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  }, { token: "mock-admin-token" });
}

export async function getAdminSubmissions(): Promise<Submission[]> {
  return fetchJSON("/admin/submissions", undefined, mockSubmissions);
}

export async function approveSubmission(id: number) {
  return fetchJSON(`/admin/submissions/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({})
  }, { ok: true });
}

export async function rejectSubmission(id: number) {
  return fetchJSON(`/admin/submissions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({})
  }, { ok: true });
}
