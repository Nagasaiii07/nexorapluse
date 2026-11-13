"""
NEXUS Logistics Intelligence — Core Configuration & Constants
"""
import os
import sys
from pathlib import Path
from enum import Enum

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Application Metadata
APP_NAME = "NEXUS Logistics Intelligence"
APP_CODE = "NEXUS"
APP_VERSION = "2.4.1"
API_PREFIX = "/api"

# Database Configuration
IS_VERCEL = bool(os.getenv("VERCEL"))
DEFAULT_SQLITE_PATH = Path("/tmp/nexus.db") if IS_VERCEL else BASE_DIR / "nexus.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")
DB_PATH = DEFAULT_SQLITE_PATH

# Security & CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
API_KEY = os.getenv("API_KEY", "nexus-secret-key-prod-2026")

# Theme Palette (Matches the Reference Image Design System)
THEME_PALETTE = {
    "navy_sidebar": "#0d1527",
    "navy_sidebar_border": "#1e293b",
    "nav_active_bg": "#2563eb",
    "workspace_bg": "#f8fafc",
    "card_bg": "#ffffff",
    "card_border": "#e2e8f0",
    "text_primary": "#0f172a",
    "text_secondary": "#64748b",
    "text_muted": "#94a3b8",
    "primary_blue": "#2563eb",
    "cyan_accent": "#06b6d4",
    "success_green": "#16a34a",
    "warning_orange": "#ea580c",
    "danger_red": "#dc2626",
    "purple_accent": "#8b5cf6"
}

# Event Types Definition
class EventType(str, Enum):
    FILTER_CHANGED = "FILTER_CHANGED"
    PLATFORM_FILTERED = "PLATFORM_FILTERED"
    DATE_RANGE_CHANGED = "DATE_RANGE_CHANGED"
    SEARCH_QUERY = "SEARCH_QUERY"
    STATE_SELECTED = "STATE_SELECTED"
    SHIPMENT_STATUS_UPDATED = "SHIPMENT_STATUS_UPDATED"
    ORDER_CREATED = "ORDER_CREATED"
    CSV_DATASET_UPLOADED = "CSV_DATASET_UPLOADED"
    JSON_DATASET_UPLOADED = "JSON_DATASET_UPLOADED"
    DATA_CLEANED = "DATA_CLEANED"
    OUTLIERS_REMOVED = "OUTLIERS_REMOVED"
    SYSTEM_REFRESH = "SYSTEM_REFRESH"
    REPORT_GENERATED = "REPORT_GENERATED"
    ALERT_TRIGGERED = "ALERT_TRIGGERED"

# Event Statuses
class EventStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    WARNING = "WARNING"

# Platforms
PLATFORMS = ["Amazon", "Flipkart"]

# Order Statuses
ORDER_STATUSES = ["Delivered", "Shipped", "Processing", "Cancelled", "Returned"]

# Shipment Statuses
SHIPMENT_STATUSES = ["Created", "Processing", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Returned", "Delayed"]
