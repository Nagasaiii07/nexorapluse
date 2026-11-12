"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { fetchOrders, updateOrderStatus } from "@/services/api";
import { RecentOrder } from "@/types";
import { Package, CheckCircle2, Truck, Cog, XCircle, RotateCcw, Filter, ExternalLink } from "lucide-react";

export default function OrdersPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  const [updating, setUpdating] = useState(false);

  const statuses = ["All", "Delivered", "Shipped", "Processing", "Cancelled", "Returned"];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchOrders({
        platform,
        status: statusFilter,
        search: searchQuery,
        limit: 50
      });
      setOrders(res.orders || []);
      setTotalCount(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [platform, statusFilter, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#f8fafc]">
      <Header
        platform={platform}
        onPlatformChange={setPlatform}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadOrders}
        isRefreshing={loading}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Orders Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fulfillment lifecycle, customer orders & multi-channel marketplace transactions
            </p>
          </div>
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
            Total Orders: <span className="text-blue-600">{totalCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === st
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Platform</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Courier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Value</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr
                    key={ord.order_number}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td
                      onClick={() => setSelectedOrder(ord)}
                      className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-600"
                    >
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {ord.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {ord.customer}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        ord.platform === "Amazon" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {ord.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ord.city}, {ord.state}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {ord.courier || "Delhivery"}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        disabled={updating}
                        className="text-[11px] font-semibold py-0.5 px-2 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {["Delivered", "Shipped", "Processing", "Cancelled", "Returned"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-right">
                      {ord.value}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  #
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedOrder.order_number}</h3>
                  <span className="text-[11px] text-slate-400">{selectedOrder.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-medium">CUSTOMER</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{selectedOrder.customer}</span>
                <span className="text-slate-500 text-[11px]">{selectedOrder.city}, {selectedOrder.state}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] block font-medium">FINANCIALS</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedOrder.value}</span>
                <span className="text-slate-500 text-[11px]">Platform: {selectedOrder.platform}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking Number:</span>
                <span className="font-mono font-medium text-slate-800">{selectedOrder.tracking_number || "TRK-" + selectedOrder.raw_order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Courier Partner:</span>
                <span className="font-medium text-slate-800">{selectedOrder.courier || "Delhivery"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-semibold text-blue-600">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
