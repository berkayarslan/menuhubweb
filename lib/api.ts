export type SubmissionStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type Restaurant = {
  id: number;
  name: string;
  cuisine?: string;
  city?: string;
  district?: string;
  descriptionText?: string;
  approvalStatus?: string;
  approved?: boolean;
  menuUpdatedAt?: string;
};

export type MenuItem = {
  id: number;
  restaurantId?: number;
  category: string;
  name: string;
  descriptionText?: string | null;
  priceAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  submittedAt?: string;
};

export type Submission = {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  sourceType: string;
  rawText: string;
  status: SubmissionStatus;
  createdAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  updatedAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
const ENABLE_API_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_API_FALLBACK === "true";

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

const STATUS_ALIASES: Record<string, SubmissionStatus> = {
  PENDING: "PENDING_REVIEW",
  PENDING_REVIEW: "PENDING_REVIEW",
  IN_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

function normalizeSubmissionStatus(input?: string): SubmissionStatus {
  const normalized = (input || "").trim().toUpperCase();
  return STATUS_ALIASES[normalized] || "PENDING_REVIEW";
}

function unwrapCollection<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const objectPayload = payload as Record<string, unknown>;
  const candidates = [objectPayload.content, objectPayload.items, objectPayload.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }

  return [];
}

function normalizeSubmission(raw: Partial<Submission>): Submission {
  return {
    id: Number(raw.id || 0),
    restaurantId: Number(raw.restaurantId || 0),
    restaurantName: raw.restaurantName,
    sourceType: raw.sourceType || "UNKNOWN",
    rawText: raw.rawText || "",
    status: normalizeSubmissionStatus(raw.status),
    createdAt: raw.createdAt,
    approvedAt: raw.approvedAt,
    rejectedAt: raw.rejectedAt,
    updatedAt: raw.updatedAt
  };
}

function normalizeMenuItem(raw: Partial<MenuItem>): MenuItem {
  return {
    id: Number(raw.id || 0),
    restaurantId: raw.restaurantId ? Number(raw.restaurantId) : undefined,
    category: raw.category || "Diğer",
    name: raw.name || "İsimsiz ürün",
    descriptionText: raw.descriptionText,
    priceAmount: Number(raw.priceAmount || 0),
    currency: raw.currency || "TRY",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    approvedAt: raw.approvedAt,
    submittedAt: raw.submittedAt
  };
}

async function fetchJSON<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    // Get token from localStorage if available
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("menuhub_admin_token");
    }

    const headersObj: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Add existing headers
    if (init?.headers) {
      if (typeof init.headers === "object" && !Array.isArray(init.headers)) {
        Object.assign(headersObj, init.headers);
      }
    }

    // Add Authorization header if token exists
    if (token) {
      headersObj["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      headers: headersObj
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (fallback !== undefined && ENABLE_API_FALLBACK) return fallback;
    throw error;
  }
}

export async function createSubmission(payload: {
  restaurantId: number;
  sourceType: string;
  rawText?: string;
  items?: {
    category: string;
    name: string;
    priceAmount: number;
    currency: string;
  }[];
}) {
  return fetchJSON(
    "/submissions",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    { ok: true }
  );
}

export async function getRestaurants(): Promise<Restaurant[]> {
  return fetchJSON("/restaurants", undefined, mockRestaurants);
}

export async function getRestaurant(id: number): Promise<Restaurant | null> {
  const fallback = mockRestaurants.find((x) => x.id === id) || null;
  return fetchJSON(`/restaurants/${id}`, undefined, fallback);
}

export async function getMenuItems(restaurantId: number): Promise<MenuItem[]> {
  try {
    const data = await fetchJSON<unknown>(`/menu-items?restaurantId=${restaurantId}`, undefined, mockMenus[restaurantId] || []);
    return unwrapCollection<Partial<MenuItem>>(data).map(normalizeMenuItem);
  } catch {
    const data = await fetchJSON<unknown>(`/restaurants/${restaurantId}/menu-items`, undefined, mockMenus[restaurantId] || []);
    return unwrapCollection<Partial<MenuItem>>(data).map(normalizeMenuItem);
  }
}


export async function adminLogin(payload: { username?: string; email?: string; password: string }) {
  // Backend expects 'username', not 'email'
  const loginPayload = {
    username: payload.username || payload.email,
    password: payload.password
  };

  return fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginPayload)
  }, { token: "mock-admin-token" });
}

export async function getAdminSubmissions(status?: SubmissionStatus): Promise<Submission[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  try {
    const data = await fetchJSON<unknown>(`/admin/submissions${query}`);
    return unwrapCollection<Partial<Submission>>(data).map(normalizeSubmission);
  } catch {
    const data = await fetchJSON<unknown>(`/submissions/admin${query}`);
    return unwrapCollection<Partial<Submission>>(data).map(normalizeSubmission);
  }
}

export async function approveSubmission(id: number) {
  const data = await fetchJSON<Partial<Submission>>(`/admin/submissions/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({})
  });
  return normalizeSubmission(data);
}

export async function rejectSubmission(id: number) {
  const data = await fetchJSON<Partial<Submission>>(`/admin/submissions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({})
  });
  return normalizeSubmission(data);
}

export async function updateMenuItem(
  id: number,
  payload: Pick<MenuItem, "name" | "category" | "priceAmount" | "currency"> & { descriptionText?: string | null }
): Promise<MenuItem> {
  try {
    const data = await fetchJSON<Partial<MenuItem>>(`/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return normalizeMenuItem(data);
  } catch {
    const data = await fetchJSON<Partial<MenuItem>>(`/admin/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return normalizeMenuItem(data);
  }
}

export async function deleteMenuItem(id: number): Promise<void> {
  try {
    await fetchJSON(`/menu-items/${id}`, {
      method: "DELETE"
    });
  } catch {
    await fetchJSON(`/admin/menu-items/${id}`, {
      method: "DELETE"
    });
  }
}
