"""Core module initialization."""
from .config import (
    APP_NAME, APP_CODE, APP_VERSION, DATABASE_URL, THEME_PALETTE,
    EventType, EventStatus, PLATFORMS, ORDER_STATUSES, SHIPMENT_STATUSES
)

__all__ = [
    "APP_NAME", "APP_CODE", "APP_VERSION", "DATABASE_URL", "THEME_PALETTE",
    "EventType", "EventStatus", "PLATFORMS", "ORDER_STATUSES", "SHIPMENT_STATUSES"
]
