export interface KpiMetric {
  title: string;
  value: string;
  raw_value: number;
  change: string;
  trend: "up" | "down";
  color: "blue" | "green" | "orange" | "red" | "navy" | "cyan" | "purple";
  sparkline: number[];
}

export interface KpiCollection {
  total_purchases: KpiMetric;
  total_orders: KpiMetric;
  accepted_orders: KpiMetric;
  processing_orders: KpiMetric;
  shipped_orders: KpiMetric;
  delivered_orders: KpiMetric;
  cancelled_orders: KpiMetric;
  returned_orders: KpiMetric;
  total_revenue: KpiMetric;
  total_profit: KpiMetric;
  delivery_success_rate: KpiMetric;
  average_order_value: KpiMetric;
}

export interface RevenueProfitPoint {
  date: string;
  revenue: number;
  profit: number;
  revFormatted: string;
  profitFormatted: string;
}

export interface OrderStatusItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
  colorClass: string;
}

export interface OrderStatusOverview {
  total_orders: number;
  items: OrderStatusItem[];
}

export interface TopState {
  state: string;
  revenue: number;
  revenueFormatted: string;
  percentage: number;
  orders_count: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  raw_order_number: string;
  date: string;
  customer: string;
  platform: "Amazon" | "Flipkart";
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled" | "Returned";
  value: string;
  raw_value: number;
  state: string;
  city: string;
  tracking_number?: string;
  courier?: string;
}

export interface OverviewData {
  status: string;
  data_updated: string;
  is_live: boolean;
  kpis: KpiCollection;
  trend: RevenueProfitPoint[];
  status_overview: OrderStatusOverview;
  top_states: TopState[];
  recent_orders: RecentOrder[];
}

export interface EventRecord {
  id?: number;
  event_id: string;
  name: string;
  event_type: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  duration_ms: number;
  source: string;
  payload: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_at?: string;
}

export interface CourierStats {
  courier: string;
  total_packages: number;
  delivered: number;
  in_transit: number;
  returned: number;
  success_rate: string;
  avg_transit_days: number;
}
