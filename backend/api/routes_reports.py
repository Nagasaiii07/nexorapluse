"""
NEXUS Reports & Exports API Routes.
"""
from fastapi import APIRouter, Query, Response
from typing import Optional
import csv
import io
import json
from datetime import datetime

from processing.logistics_engine import LogisticsEngine
from database.session import DatabaseConnection
from core.event_manager import event_bus
from core.config import EventType

router = APIRouter(prefix="/reports", tags=["Reports"])

AVAILABLE_REPORTS = [
    {
        "id": "REP-001",
        "title": "Executive Performance Summary",
        "description": "Comprehensive GMV, profit margins, delivery success rate and state distribution.",
        "category": "Executive",
        "last_generated": "Today, 04:30 PM",
        "file_size": "2.4 MB"
    },
    {
        "id": "REP-002",
        "title": "Amazon vs Flipkart Marketplace Comparison",
        "description": "Cross-marketplace sales volume, fulfillment speed, commission rates, and returns.",
        "category": "Marketplace",
        "last_generated": "Today, 02:15 PM",
        "file_size": "1.8 MB"
    },
    {
        "id": "REP-003",
        "title": "Courier Partner Delivery SLA Audit",
        "description": "On-time delivery percentages, RTO return rates, and transit latencies across couriers.",
        "category": "Logistics",
        "last_generated": "Yesterday",
        "file_size": "3.1 MB"
    },
    {
        "id": "REP-004",
        "title": "Geographic State-Wise Fulfillment Matrix",
        "description": "State-level demand density, transit hubs, delivery bottlenecks, and logistics costs.",
        "category": "Geographic",
        "last_generated": "Yesterday",
        "file_size": "4.2 MB"
    }
]

@router.get("/list")
def list_reports():
    """Lists available pre-configured and scheduled analytics reports."""
    return {"status": "success", "reports": AVAILABLE_REPORTS}

@router.get("/export")
def export_dataset(
    format: str = Query("csv", pattern="^(csv|json)$"),
    platform: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(500, le=2000)
):
    """Generates an export of the filtered orders dataset as CSV or JSON."""
    orders = LogisticsEngine.get_recent_orders(platform=platform, status=status, limit=limit)

    event_bus.dispatch(
        event_type=EventType.REPORT_GENERATED.value,
        name=f"Orders Export ({format.upper()})",
        payload={"format": format, "records": len(orders), "platform": platform},
        source="REPORTS_MODULE"
    )

    if format == "json":
        json_str = json.dumps(orders, indent=2)
        return Response(
            content=json_str,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=nexus_orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
        )

    # CSV output
    output = io.StringIO()
    if orders:
        keys = orders[0].keys()
        writer = csv.DictWriter(output, fieldnames=keys)
        writer.writeheader()
        writer.writerows(orders)
    csv_content = output.getvalue()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=nexus_orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )
