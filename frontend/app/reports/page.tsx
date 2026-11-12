"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2 } from "lucide-react";

export default function ReportsPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const reports = [
    {
      id: "REP-001",
      title: "Executive Logistics & Financial Audit",
      description: "Complete summary of GMV, revenue, net profit margins, order status breakdown and SLA performance.",
      type: "Executive",
      size: "2.4 MB"
    },
    {
      id: "REP-002",
      title: "Marketplace Channel Comparison (Amazon vs Flipkart)",
      description: "Cross-marketplace sales share, unit economics, fulfillment times, and returns by territory.",
      type: "Marketplace",
      size: "1.8 MB"
    },
    {
      id: "REP-003",
      title: "Courier Partner Performance Matrix",
      description: "On-time delivery percentages, RTO return rates, and transit latencies across Delhivery, BlueDart, Ekart, Amazon.",
      type: "Logistics",
      size: "3.1 MB"
    },
    {
      id: "REP-004",
      title: "Territorial Demand & State Revenue Breakdown",
      description: "State-by-state fulfillment matrix, regional warehouse allocations, and delivery lead times.",
      type: "Geographic",
      size: "4.2 MB"
    }
  ];

  const handleExport = (format: "csv" | "json") => {
    setExporting(true);
    const url = `/api/reports/export?format=${format}&platform=${encodeURIComponent(platform === "All Platforms" ? "" : platform)}`;
    window.open(url, "_blank");
    setTimeout(() => setExporting(false), 1500);
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
        onRefresh={() => {}}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download business intelligence audits, data exports and operational reports
          </p>
        </div>

        {/* Quick Export Strip */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Export Current Filtered Dataset</h3>
              <span className="text-slate-400 text-xs">Filter: {platform} • {dateRange}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <FileCode className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Pre-Generated Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                    {rep.type}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">{rep.size}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{rep.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-[11px] text-slate-400 font-mono">ID: {rep.id}</span>
                <button
                  onClick={() => handleExport("csv")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
