"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RecentOrder } from "@/types";

interface TableProps {
  orders: RecentOrder[];
  onOrderClick?: (order: RecentOrder) => void;
}

const statusBadgeClasses: Record<string, string> = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200/80",
  Processing: "bg-amber-50 text-amber-700 border-amber-200/80",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200/80",
  Returned: "bg-purple-50 text-purple-700 border-purple-200/80",
};

export default function RecentOrdersTable({ orders, onOrderClick }: TableProps) {
  const displayOrders = orders && orders.length > 0 ? orders.slice(0, 5) : [
    { id: "ORD-NX8426", order_number: "#NX8426", raw_order_number: "NX8426", date: "04 May, 4:21 PM", customer: "Priya Sharma", platform: "Amazon" as const, status: "Delivered" as const, value: "₹2,499", raw_value: 2499, state: "Maharashtra", city: "Mumbai" },
    { id: "ORD-NX8425", order_number: "#NX8425", raw_order_number: "NX8425", date: "04 May, 4:18 PM", customer: "Rahul Mehta", platform: "Flipkart" as const, status: "Shipped" as const, value: "₹1,799", raw_value: 1799, state: "Karnataka", city: "Bengaluru" },
    { id: "ORD-NX8424", order_number: "#NX8424", raw_order_number: "NX8424", date: "04 May, 4:15 PM", customer: "Sneha Reddy", platform: "Amazon" as const, status: "Processing" as const, value: "₹3,299", raw_value: 3299, state: "Telangana", city: "Hyderabad" },
    { id: "ORD-NX8423", order_number: "#NX8423", raw_order_number: "NX8423", date: "04 May, 4:12 PM", customer: "Arjun Kumar", platform: "Flipkart" as const, status: "Delivered" as const, value: "₹1,199", raw_value: 1199, state: "Tamil Nadu", city: "Chennai" },
    { id: "ORD-NX8422", order_number: "#NX8422", raw_order_number: "NX8422", date: "04 May, 4:10 PM", customer: "Divya Patel", platform: "Amazon" as const, status: "Returned" as const, value: "₹2,299", raw_value: 2299, state: "Gujarat", city: "Ahmedabad" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      {/* Title + View All */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">Recent Orders</h3>
        <Link
          href="/orders"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 font-semibold border-b border-slate-100">
              <th className="pb-2.5 font-medium">Order ID</th>
              <th className="pb-2.5 font-medium">Date</th>
              <th className="pb-2.5 font-medium">Customer</th>
              <th className="pb-2.5 font-medium">Platform</th>
              <th className="pb-2.5 font-medium">Status</th>
              <th className="pb-2.5 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayOrders.map((ord) => {
              const badgeClass = statusBadgeClasses[ord.status] || "bg-slate-100 text-slate-700";

              return (
                <tr
                  key={ord.order_number}
                  onClick={() => onOrderClick && onOrderClick(ord)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 font-semibold text-slate-900 group-hover:text-blue-600">
                    {ord.order_number}
                  </td>
                  <td className="py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {ord.date}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800">
                    {ord.customer}
                  </td>
                  <td className="py-2.5 text-slate-600 font-medium">
                    {ord.platform}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-slate-900 text-right">
                    {ord.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
