"""
NEXUS Orders Management API Routes.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any
from datetime import datetime

from processing.logistics_engine import LogisticsEngine
from database.session import DatabaseConnection
from core.event_manager import event_bus
from core.config import EventType

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("")
def list_orders(
    platform: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Lists orders with search, multi-attribute filtering, and pagination."""
    orders = LogisticsEngine.get_recent_orders(
        platform=platform,
        search=search,
        status=status,
        limit=limit,
        offset=offset
    )

    # Count total matching
    where_sql, params = LogisticsEngine._build_filter_clause(platform=platform, state=state, search=search)
    if status and status not in ("All", "ALL", ""):
        prefix = "WHERE" if not where_sql else "AND"
        where_sql += f" {prefix} order_status = ?"
        params.append(status)

    count_res = DatabaseConnection.execute_query(f"SELECT COUNT(*) as total FROM orders {where_sql};", tuple(params))
    total_count = count_res[0]["total"] if count_res else len(orders)

    return {
        "status": "success",
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "orders": orders
    }

@router.get("/{order_id}")
def get_order_details(order_id: str):
    """Retrieves full order profile including line items and shipment history."""
    clean_id = order_id.replace("#", "").strip()
    order_row = DatabaseConnection.execute_query(
        "SELECT * FROM orders WHERE id = ? OR order_number = ?;",
        (f"ORD-{clean_id}", clean_id)
    )
    if not order_row:
        raise HTTPException(status_code=404, detail="Order not found")

    order = dict(order_row[0])
    items = DatabaseConnection.execute_query("SELECT * FROM order_items WHERE order_id = ?;", (order["id"],))
    shipment = DatabaseConnection.execute_query("SELECT * FROM shipments WHERE order_id = ?;", (order["id"],))

    return {
        "status": "success",
        "order": order,
        "items": items,
        "shipment": shipment[0] if shipment else None
    }

@router.patch("/{order_id}/status")
def update_order_status(order_id: str, payload: Dict[str, Any]):
    """Transitions order status and triggers event pipeline."""
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status in payload")

    clean_id = order_id.replace("#", "").strip()
    target_id = f"ORD-{clean_id}"

    # Verify exists
    check = DatabaseConnection.execute_query("SELECT id, order_number FROM orders WHERE id = ? OR order_number = ?;", (target_id, clean_id))
    if not check:
        raise HTTPException(status_code=404, detail="Order not found")

    actual_id = check[0]["id"]
    ord_num = check[0]["order_number"]

    now_iso = datetime.utcnow().isoformat()
    DatabaseConnection.execute_non_query(
        "UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?;",
        (new_status, now_iso, actual_id)
    )
    DatabaseConnection.execute_non_query(
        "UPDATE shipments SET shipment_status = ?, updated_at = ? WHERE order_id = ?;",
        (new_status, now_iso, actual_id)
    )

    # Dispatch Event
    event = event_bus.dispatch(
        event_type=EventType.SHIPMENT_STATUS_UPDATED.value,
        name=f"Order #{ord_num} Status -> {new_status}",
        payload={"order_id": actual_id, "order_number": ord_num, "status": new_status},
        source="ORDER_MANAGEMENT_UI"
    )

    return {
        "status": "success",
        "order_id": actual_id,
        "order_number": ord_num,
        "new_status": new_status,
        "event_id": event.event_id,
        "event_status": event.status
    }
