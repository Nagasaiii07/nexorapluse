"""API module initialization."""
from .routes_analytics import router as analytics_router
from .routes_orders import router as orders_router
from .routes_shipments import router as shipments_router
from .routes_events import router as events_router
from .routes_data import router as data_router
from .routes_reports import router as reports_router

__all__ = [
    "analytics_router",
    "orders_router",
    "shipments_router",
    "events_router",
    "data_router",
    "reports_router"
]
