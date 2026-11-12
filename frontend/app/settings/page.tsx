"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { Settings, Shield, Database, Cloud, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Settings & Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Infrastructure integrations, database parameters, marketplace credentials & alert thresholds
            </p>
          </div>
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Settings Saved Successfully
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Database & Cloud Persistence */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Database & Storage Engine</h3>
                <span className="text-slate-400 text-xs">PostgreSQL (Neon / Supabase) & Local SQLite</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">DATABASE_URL Connection String</label>
                <input
                  type="text"
                  readOnly
                  value="postgresql://user:••••••••@ep-sample-pooler.neon.tech/nexus"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Configured via Vercel Environment Variables. Fallback to SQLite during local preview.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Connection Pool Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                  ACTIVE (Neon Tech Pooler)
                </span>
              </div>
            </div>
          </div>

          {/* Vercel & GitHub Deployment Info */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Deployment & CI/CD Pipeline</h3>
                <span className="text-slate-400 text-xs">Vercel Serverless & GitHub Actions</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Production Domain:</span>
                <span className="font-mono text-blue-600 font-semibold">nexus-logistics.vercel.app</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Python Serverless Runtime:</span>
                <span className="font-mono text-slate-800">Python 3.12+ (FastAPI)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700 font-medium">Frontend Framework:</span>
                <span className="font-mono text-slate-800">Next.js 15 (App Router)</span>
              </div>
            </div>
          </div>

          {/* Alert Threshold Rules */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Automated Alert Thresholds</h3>
                <span className="text-slate-400 text-xs">Event bus triggers for operational anomalies</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Cancellation Spike Alert:</span>
                <span className="font-bold text-slate-900">&gt; 5.0% Order Volume</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Transit Delay SLA Trigger:</span>
                <span className="font-bold text-slate-900">&gt; 3 Business Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Return Rate Anomaly:</span>
                <span className="font-bold text-slate-900">&gt; 4.0% In Category</span>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Authenticated User Session</h3>
                <span className="text-slate-400 text-xs">Role-based access control</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  RD
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Raghav Dev</span>
                  <span className="text-slate-500 text-[11px]">raghav.dev@nexus.logistics • Role: Principal Admin</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
