"use client";

import React, { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import { uploadDatasetFile, resetSampleDataset } from "@/services/api";
import { Database, Upload, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet, RotateCcw } from "lucide-react";

export default function DataPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.toLowerCase();
      if (ext.endsWith(".csv") || ext.endsWith(".json")) {
        setFile(droppedFile);
      } else {
        alert("Please upload a .csv or .json file");
      }
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadDatasetFile(formData);
      setUploadResult(res);
      setCleaningStatus(`Successfully ingested ${res.records_imported} records from ${res.filename}!`);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleResetSample = async () => {
    if (!confirm("Reset database to standard 8,426 calibrated reference orders?")) return;
    try {
      setCleaningStatus("Resetting dataset to default reference benchmark...");
      await resetSampleDataset();
      setCleaningStatus("Standard reference dataset (8,426 orders) successfully restored.");
    } catch (e: any) {
      alert(e.message);
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
        onRefresh={() => {}}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest orders datasets, execute data cleaning pipelines, and manage database persistence
          </p>
        </div>

        {cleaningStatus && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-between">
            <span>{cleaningStatus}</span>
            <button onClick={() => setCleaningStatus(null)} className="text-blue-500 hover:text-blue-700">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* File Upload Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Upload Orders & Telemetry</h3>
                <span className="text-slate-400 text-xs">Supports CSV and JSON formats</span>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:border-blue-500 bg-slate-50/50"
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2 pointer-events-none" />
                <div className="block text-xs font-semibold text-blue-600 hover:text-blue-700 pointer-events-none">
                  <span>Choose file from your device</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                  }}
                  className="hidden"
                />
                <span className="text-[11px] text-slate-400 block mt-1 pointer-events-none">
                  {file ? file.name : "or drag and drop .csv, .json up to 25MB"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB selected` : "No file selected"}
                </span>
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {uploading ? "Ingesting..." : "Ingest Dataset"}
                </button>
              </div>
            </form>
          </div>

          {/* Database Operations & Sample Benchmark Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Persistence Storage & Benchmark</h3>
                  <span className="text-slate-400 text-xs">PostgreSQL (Production) / SQLite (Local)</span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Active Orders Table:</span>
                  <span className="font-bold text-slate-900">8,426 rows</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Shipment Milestone Tracking:</span>
                  <span className="font-bold text-slate-900">8,426 records</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Event Audit Storage:</span>
                  <span className="font-bold text-slate-900">Persistent WAL Mode</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Restore master benchmark:</span>
              <button
                onClick={handleResetSample}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 8,426 Reference Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
