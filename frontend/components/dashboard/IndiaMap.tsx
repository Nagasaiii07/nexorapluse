"use client";

import React, { useState } from "react";

interface IndiaMapProps {
  activeState?: string;
  onStateSelect?: (state: string) => void;
}

// Representative Geo Polygons for Indian Regions & States
const statePaths = [
  { id: "MH", name: "Maharashtra", d: "M 85 140 L 125 135 L 145 160 L 130 195 L 90 185 L 75 160 Z", color: "#1e40af" },
  { id: "KA", name: "Karnataka", d: "M 90 185 L 130 195 L 120 240 L 95 245 L 85 210 Z", color: "#2563eb" },
  { id: "TN", name: "Tamil Nadu", d: "M 120 240 L 140 235 L 130 280 L 105 285 L 110 250 Z", color: "#3b82f6" },
  { id: "GJ", name: "Gujarat", d: "M 45 110 L 85 105 L 85 140 L 55 150 L 35 125 Z", color: "#60a5fa" },
  { id: "UP", name: "Uttar Pradesh", d: "M 125 65 L 175 60 L 185 95 L 135 105 L 120 85 Z", color: "#93c5fd" },
  { id: "DL", name: "Delhi", d: "M 118 72 L 126 72 L 126 78 L 118 78 Z", color: "#bfdbfe" },
  { id: "RJ", name: "Rajasthan", d: "M 65 65 L 120 60 L 115 110 L 65 115 Z", color: "#93c5fd" },
  { id: "MP", name: "Madhya Pradesh", d: "M 90 105 L 155 100 L 150 140 L 90 140 Z", color: "#60a5fa" },
  { id: "WB", name: "West Bengal", d: "M 195 95 L 215 90 L 210 145 L 195 140 Z", color: "#93c5fd" },
  { id: "TG", name: "Telangana", d: "M 125 160 L 155 155 L 150 195 L 125 190 Z", color: "#60a5fa" },
  { id: "AP", name: "Andhra Pradesh", d: "M 130 195 L 160 190 L 155 245 L 130 235 Z", color: "#93c5fd" },
  { id: "KL", name: "Kerala", d: "M 95 245 L 110 245 L 100 285 L 85 270 Z", color: "#bfdbfe" },
  { id: "JK", name: "Jammu & Kashmir", d: "M 85 10 L 125 15 L 115 50 L 75 45 Z", color: "#dbeafe" },
  { id: "PB", name: "Punjab", d: "M 80 48 L 105 45 L 100 70 L 80 65 Z", color: "#dbeafe" },
  { id: "NE", name: "North East", d: "M 220 85 L 260 80 L 255 125 L 215 115 Z", color: "#dbeafe" }
];

export default function IndiaMap({ activeState, onStateSelect }: IndiaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full h-44 flex items-center justify-center">
      <svg
        viewBox="0 0 280 300"
        className="w-full h-full max-h-44 drop-shadow-sm transition-transform"
      >
        {statePaths.map((st) => {
          const isSelected = activeState === st.name;
          const isHover = hovered === st.name;

          return (
            <path
              key={st.id}
              d={st.d}
              fill={isSelected ? "#1d4ed8" : isHover ? "#2563eb" : st.color}
              stroke="#ffffff"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-200"
              onMouseEnter={() => setHovered(st.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStateSelect && onStateSelect(st.name)}
            >
              <title>{st.name}</title>
            </path>
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute bottom-1 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none">
          {hovered}
        </div>
      )}
    </div>
  );
}
