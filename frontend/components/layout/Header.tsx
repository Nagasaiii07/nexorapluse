"use client";

import React, { useState } from "react";
import { Search, Calendar, Layers, RefreshCw, Bell, ChevronDown } from "lucide-react";

interface HeaderProps {
  platform: string;
  onPlatformChange: (p: string) => void;
  dateRange: string;
  onDateRangeChange: (d: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  platform,
  onPlatformChange,
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing = false
}: HeaderProps) {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const platforms = ["All Platforms", "Amazon", "Flipkart"];
  const dateRanges = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Search Bar */}
      <div className="relative w-80 md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search orders, shipments, or tracking IDs..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDateOpen(!dateOpen); setPlatformOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dateOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              {dateRanges.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    onDateRangeChange(d);
                    setDateOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    dateRange === d ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Platform Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setPlatformOpen(!platformOpen); setDateOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{platform}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {platformOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onPlatformChange(p);
                    setPlatformOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    platform === p ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>Refresh</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
