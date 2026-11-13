import { OverviewData, EventRecord, RecentOrder, CourierStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetchOverview(params?: {
  platform?: string;
  dateRange?: string;
  state?: string;
  search?: string;
}): Promise<OverviewData> {
  const query = new URLSearchParams();
  if (params?.platform && params.platform !== "All Platforms") query.set("platform", params.platform);
  if (params?.dateRange) query.set("date_range", params.dateRange);
  if (params?.state && params.state !== "All States") query.set("state", params.state);
  if (params?.search) query.set("search", params.search);

  const url = `${API_BASE}/overview?${query.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load overview data");
  return res.json();
}

export async function fetchOrders(params?: {
  platform?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params?.platform && params.platform !== "All Platforms") query.set("platform", params.platform);
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.offset) query.set("offset", params.offset.toString());

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function fetchShipments(params?: { status?: string; courier?: string }) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.courier && params.courier !== "All") query.set("courier", params.courier);

  const res = await fetch(`${API_BASE}/shipments?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load shipments");
  return res.json();
}

export async function updateShipmentStatus(trackingNumber: string, status: string) {
  const res = await fetch(`${API_BASE}/shipments/${encodeURIComponent(trackingNumber)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update shipment status");
  return res.json();
}

export async function fetchEvents(limit: number = 50) {
  const res = await fetch(`${API_BASE}/events?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchPlatformComparison(dateRange: string = "Last 30 Days") {
  const res = await fetch(`${API_BASE}/analytics/platforms?date_range=${encodeURIComponent(dateRange)}`);
  if (!res.ok) throw new Error("Failed to load platform comparison");
  return res.json();
}

export async function uploadDatasetFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/data/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = "Failed to upload dataset";
    if (typeof err?.detail === "string") {
      msg = err.detail;
    } else if (err?.detail?.message) {
      const errList = Array.isArray(err?.detail?.errors) && err.detail.errors.length > 0
        ? `: ${err.detail.errors.slice(0, 3).join(", ")}`
        : "";
      msg = `${err.detail.message}${errList}`;
    } else if (err?.message) {
      msg = err.message;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function resetSampleDataset() {
  const res = await fetch(`${API_BASE}/data/reset-sample`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset dataset");
  return res.json();
}
