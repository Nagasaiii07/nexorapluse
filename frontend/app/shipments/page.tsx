"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { fetchShipments, updateShipmentStatus } from "@/services/api";
import { Truck, CheckCircle2, Clock, AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";

export default function ShipmentsPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await fetchShipments();
      setShipments(res.shipments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleStatusTransition = async (trackingNum: string, nextStatus: string) => {
    try {
      setUpdatingId(trackingNum);
      await updateShipmentStatus(trackingNum, nextStatus);
      await loadShipments();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
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
        onRefresh={loadShipments}
        isRefreshing={loading}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Shipment Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time courier fleet observability, transit milestones and delivery SLA monitoring
          </p>
        </div>

        {/* Courier SLA Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">On-Time Delivery Rate</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">94.6%</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↑ 1.4% vs SLA</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active In-Transit Fleet</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">171</span>
              <span className="text-xs font-semibold text-blue-600 mt-0.5 block">5 Partner Hubs</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Average Transit Time</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">2.2 Days</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↓ 0.3 Days Faster</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">RTO Return Rate</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">2.9%</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↓ 0.4% Improvement</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Active Logistics Pipeline</h3>
            <span className="text-xs text-slate-500">Live Telemetry Stream</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tracking #</th>
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Courier</th>
                  <th className="py-3 px-4 font-semibold">Origin Hub</th>
                  <th className="py-3 px-4 font-semibold">Destination</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Quick Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {shp.tracking_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      #{shp.order_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {shp.courier}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {shp.origin_hub || "BOM-Central-Hub"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {shp.state} ({shp.destination_hub || "DEL-Hub"})
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        shp.shipment_status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        shp.shipment_status === "Shipped" || shp.shipment_status === "In Transit" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        shp.shipment_status === "Processing" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {shp.shipment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {shp.shipment_status !== "Delivered" ? (
                        <button
                          onClick={() => handleStatusTransition(shp.tracking_number, "Delivered")}
                          disabled={updatingId === shp.tracking_number}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                        >
                          {updatingId === shp.tracking_number ? "Updating..." : "Mark Delivered"}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
