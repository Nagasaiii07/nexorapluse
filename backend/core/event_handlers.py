"""
NEXUS Event Handlers.
Binds user actions, filter transitions, uploads, and status changes
to state recalculation and database updates.
"""
from typing import Dict, Any
from datetime import datetime

from core.config import EventType
from core.event_manager import Event, EventManager, event_bus
from processing.logistics_engine import LogisticsEngine
from database.session import DatabaseConnection

def register_all_handlers(bus: EventManager) -> None:
    """Registers domain handlers to central event bus."""

    def on_filter_changed(event: Event) -> Dict[str, Any]:
        """Handles platform, date-range, and query filter changes."""
        payload = event.payload
        platform = payload.get("platform", "All Platforms")
        date_range = payload.get("date_range", "Last 30 Days")
        state = payload.get("state")
        search = payload.get("search")

        kpis = LogisticsEngine.get_executive_kpis(
            platform=platform,
            date_range=date_range,
            state=state,
            search=search
        )
        status_overview = LogisticsEngine.get_order_status_overview(
            platform=platform,
            date_range=date_range,
            state=state
        )
        top_states = LogisticsEngine.get_top_states(
            platform=platform,
            date_range=date_range
        )
        recent_orders = LogisticsEngine.get_recent_orders(
            platform=platform,
            search=search,
            limit=5
        )

        return {
            "applied_filters": {
                "platform": platform,
                "date_range": date_range,
                "state": state,
                "search": search
            },
            "kpis": kpis,
            "status_overview": status_overview,
            "top_states": top_states,
            "recent_orders": recent_orders,
            "timestamp": datetime.utcnow().isoformat()
        }

    def on_shipment_status_updated(event: Event) -> Dict[str, Any]:
        """Transitions shipment status and synchronizes linked order."""
        payload = event.payload
        tracking_number = payload.get("tracking_number")
        new_status = payload.get("status", "Delivered")

        if not tracking_number:
            raise ValueError("Missing tracking_number in payload.")

        # Update shipment in DB
        now_iso = datetime.utcnow().isoformat()
        sql_shipment = """
        UPDATE shipments
        SET shipment_status = ?,
            actual_delivery = CASE WHEN ? = 'Delivered' THEN ? ELSE actual_delivery END,
            updated_at = ?
        WHERE tracking_number = ?;
        """
        DatabaseConnection.execute_non_query(
            sql_shipment,
            (new_status, new_status, now_iso, now_iso, tracking_number)
        )

        # Update corresponding order status
        sql_order = """
        UPDATE orders
        SET order_status = ?, updated_at = ?
        WHERE id = (SELECT order_id FROM shipments WHERE tracking_number = ?);
        """
        DatabaseConnection.execute_non_query(
            sql_order,
            (new_status, now_iso, tracking_number)
        )

        # Recalculate KPIs
        kpis = LogisticsEngine.get_executive_kpis()
        status_overview = LogisticsEngine.get_order_status_overview()

        return {
            "tracking_number": tracking_number,
            "new_status": new_status,
            "updated_at": now_iso,
            "delivery_success_rate": kpis["delivery_success_rate"]["value"],
            "kpis": kpis,
            "status_overview": status_overview
        }

    def on_system_refresh(event: Event) -> Dict[str, Any]:
        """Refreshes all cache and returns latest metrics."""
        kpis = LogisticsEngine.get_executive_kpis()
        return {
            "refreshed_at": datetime.utcnow().isoformat(),
            "kpis": kpis
        }

    # Subscribe handlers
    bus.subscribe(EventType.FILTER_CHANGED.value, on_filter_changed)
    bus.subscribe(EventType.PLATFORM_FILTERED.value, on_filter_changed)
    bus.subscribe(EventType.DATE_RANGE_CHANGED.value, on_filter_changed)
    bus.subscribe(EventType.SEARCH_QUERY.value, on_filter_changed)
    bus.subscribe(EventType.STATE_SELECTED.value, on_filter_changed)
    bus.subscribe(EventType.SHIPMENT_STATUS_UPDATED.value, on_shipment_status_updated)
    bus.subscribe(EventType.SYSTEM_REFRESH.value, on_system_refresh)

# Initialize subscriptions
register_all_handlers(event_bus)
