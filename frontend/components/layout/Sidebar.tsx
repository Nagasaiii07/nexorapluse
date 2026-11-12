"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Truck,
  TrendingUp,
  Globe,
  Layers,
  Activity,
  Database,
  FileText,
  Settings,
  ChevronDown
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Shipments", href: "/shipments", icon: Truck },
  { name: "Revenue & Profit", href: "/revenue", icon: TrendingUp },
  { name: "Geographic Analytics", href: "/geography", icon: Globe },
  { name: "Platform Analytics", href: "/platforms", icon: Layers },
  { name: "Live Events", href: "/events", icon: Activity },
  { name: "Data Management", href: "/data", icon: Database },
  { name: "Reports & Exports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1527] border-r border-[#1e293b] flex flex-col justify-between shrink-0 min-h-screen text-slate-300 select-none">
      {/* Top Brand Section */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#1e293b]/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl tracking-wider">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-lg tracking-widest leading-none">
              NEXUS
            </span>
            <span className="text-[11px] font-medium text-slate-400 tracking-wider mt-0.5">
              Logistics Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#2563eb] text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-4 border-t border-[#1e293b]/60 space-y-4">
        {/* Connection Status Pill */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Connected</span>
            <span className="text-[10px] text-slate-500">Last updated Today, 04:32 PM</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-400/30">
              RD
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Raghav Dev</span>
              <span className="text-[11px] text-slate-400">Admin</span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
