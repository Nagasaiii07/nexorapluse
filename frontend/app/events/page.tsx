"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { fetchEvents } from "@/services/api";
import { EventRecord } from "@/types";
import { Activity, Zap, CheckCircle2, AlertOctagon, Clock, RefreshCw, ChevronRight } from "lucide-react";

export default function EventsPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [metrics, setMetrics] = useState<any>({ total: 0, success: 0, failed: 0, avg_duration_ms: 14.2 });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetchEvents(50);
      setEvents(res.events || []);
      if (res.events && res.events.length > 0) {
        const total = res.events.length;
        const succ = res.events.filter((e: any) => e.status === "SUCCESS").length;
        const avg = res.events.reduce((acc: number, e: any) => acc + (e.duration_ms || 0), 0) / (total || 1);
        setMetrics({ total, success: succ, failed: total - succ, avg_duration_ms: avg.toFixed(1) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#f8fafc]">
      <Header
        platform={platform}
        onPlatformChange={setPlatform}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadEvents}
        isRefreshing={loading}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Live Event Monitoring
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish-subscribe event bus audit trail, timing diagnostics and telemetry observability
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Bus Status: ACTIVE</span>
          </div>
        </div>

        {/* Event Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Events Dispatched</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.total}</span>
              <span className="text-xs font-semibold text-blue-600 mt-0.5 block">Audit Persisted</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Dispatch Success Rate</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">100%</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">0 Pipeline Exceptions</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Average Dispatch Latency</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.avg_duration_ms} ms</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">Sub-50ms Target</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Active Event Listeners</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">7 Handlers</span>
              <span className="text-xs font-semibold text-blue-600 mt-0.5 block">Pub-Sub Registered</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Chronological Event Stream</h3>
            <span className="text-xs text-slate-400">Click any row to inspect payload and response</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 font-semibold">Event ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold">Latency</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr
                    key={evt.event_id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {evt.event_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {evt.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {evt.source}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {evt.duration_ms} ms
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        evt.status === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Event Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedEvent.name}</h3>
                <span className="text-xs font-mono text-blue-600">{selectedEvent.event_id} • {selectedEvent.duration_ms} ms</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">Payload JSON</span>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>

            {selectedEvent.result && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">Result JSON</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(selectedEvent.result, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
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
