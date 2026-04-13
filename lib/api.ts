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
  status?: SubmissionStatus | string;
  approved?: boolean;
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
  const candidates = [
    objectPayload.content,
    objectPayload.items,
    objectPayload.data,
    objectPayload.results,
    objectPayload.menuItems,
    objectPayload.menu_items
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
  }

  return [];
}

function normalizeBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "approved"].includes(normalized)) return true;
    if (["false", "0", "no", "rejected"].includes(normalized)) return false;
  }
  return undefined;
}

function normalizeSubmission(raw: Partial<Submission>): Submission {
  const source = raw as Record<string, unknown>;
  const createdAt = (source.createdAt as string) || (source.created_at as string) || undefined;
  const approvedAt = (source.approvedAt as string) || (source.approved_at as string) || (source.approvalDate as string) || undefined;
  const rejectedAt = (source.rejectedAt as string) || (source.rejected_at as string) || undefined;
  const updatedAt = (source.updatedAt as string) || (source.updated_at as string) || undefined;

  return {
    id: Number(raw.id || 0),
    restaurantId: Number(raw.restaurantId || 0),
    restaurantName: raw.restaurantName,
    sourceType: raw.sourceType || "UNKNOWN",
    rawText: raw.rawText || "",
    status: normalizeSubmissionStatus(raw.status),
    createdAt,
    approvedAt,
    rejectedAt,
    updatedAt
  };
}

function normalizeDateValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    // Support both seconds and milliseconds timestamps.
    const ms = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }

  return undefined;
}

function normalizeMenuItem(raw: Partial<MenuItem>): MenuItem {
  const source = raw as Record<string, unknown>;
  const category = (source.category as string) || (source.categoryName as string) || "Diğer";
  const descriptionText =
    (source.descriptionText as string) ||
    (source.description as string) ||
    (source.description_text as string) ||
    null;
  const priceAmount =
    Number(source.priceAmount || source.price || source.price_amount || 0);
  const currency =
    (source.currency as string) ||
    (source.currencyCode as string) ||
    (source.currency_code as string) ||
    "TRY";
  const createdAt =
    normalizeDateValue(source.createdAt) ||
    normalizeDateValue(source.created_at) ||
    normalizeDateValue(source.createdDate) ||
    normalizeDateValue(source.created_date) ||
    undefined;
  const updatedAt =
    normalizeDateValue(source.updatedAt) ||
    normalizeDateValue(source.updated_at) ||
    normalizeDateValue(source.lastUpdatedAt) ||
    normalizeDateValue(source.last_updated_at) ||
    undefined;
  const approvedAt =
    normalizeDateValue(source.approvedAt) ||
    normalizeDateValue(source.approved_at) ||
    normalizeDateValue(source.approvalDate) ||
    normalizeDateValue(source.approval_date) ||
    normalizeDateValue(source.lastApprovedAt) ||
    normalizeDateValue(source.last_approved_at) ||
    normalizeDateValue(source.approvedOn) ||
    normalizeDateValue(source.approved_on) ||
    undefined;
  const submittedAt =
    normalizeDateValue(source.submittedAt) ||
    normalizeDateValue(source.submitted_at) ||
    normalizeDateValue(source.submittedDate) ||
    normalizeDateValue(source.submitted_date) ||
    undefined;
  const rawStatus =
    (source.status as string) ||
    (source.itemStatus as string) ||
    (source.menuItemStatus as string) ||
    (source.submissionStatus as string) ||
    "";
  const normalizedStatus = rawStatus ? normalizeSubmissionStatus(rawStatus) : undefined;
  const approvedFromField =
    normalizeBooleanValue(source.approved) ??
    normalizeBooleanValue(source.isApproved) ??
    normalizeBooleanValue(source.is_approved);
  const approved = approvedFromField ?? (normalizedStatus ? normalizedStatus === "APPROVED" : undefined);

  return {
    id: Number(raw.id || 0),
    restaurantId: raw.restaurantId ? Number(raw.restaurantId) : undefined,
    category,
    name: raw.name || "İsimsiz ürün",
    descriptionText,
    priceAmount,
    currency,
    status: normalizedStatus || rawStatus || undefined,
    approved,
    createdAt,
    updatedAt,
    approvedAt,
    submittedAt
  };
}

export function isApprovedMenuItem(item: MenuItem): boolean {
  if (item.approved === true) return true;
  const normalized = normalizeSubmissionStatus(item.status);
  if (normalized === "APPROVED") return true;
  return Boolean(item.approvedAt);
}

function hasApprovalSignal(item: MenuItem): boolean {
  return item.approved === true || Boolean(item.approvedAt) || Boolean(item.status);
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

export async function getMenuItems(
  restaurantId: number,
  options?: { approvedOnly?: boolean }
): Promise<MenuItem[]> {
  const approvedOnly = options?.approvedOnly === true;
  const query = approvedOnly
    ? `restaurantId=${restaurantId}&status=APPROVED`
    : `restaurantId=${restaurantId}`;

  try {
    const data = await fetchJSON<unknown>(`/menu-items?${query}`, undefined, mockMenus[restaurantId] || []);
    const normalized = unwrapCollection<Partial<MenuItem>>(data).map(normalizeMenuItem);
    if (!approvedOnly) return normalized;

    const hasSignals = normalized.some(hasApprovalSignal);
    return hasSignals ? normalized.filter(isApprovedMenuItem) : normalized;
  } catch {
    const path = approvedOnly
      ? `/restaurants/${restaurantId}/menu-items?status=APPROVED`
      : `/restaurants/${restaurantId}/menu-items`;
    const data = await fetchJSON<unknown>(path, undefined, mockMenus[restaurantId] || []);
    const normalized = unwrapCollection<Partial<MenuItem>>(data).map(normalizeMenuItem);
    if (!approvedOnly) return normalized;

    const hasSignals = normalized.some(hasApprovalSignal);
    return hasSignals ? normalized.filter(isApprovedMenuItem) : normalized;
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
