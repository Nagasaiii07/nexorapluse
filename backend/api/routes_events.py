"""
NEXUS Event Monitoring API Routes.
"""
from fastapi import APIRouter, Query
from typing import Optional, Dict, Any

from core.event_manager import event_bus
from core.config import EventType

router = APIRouter(prefix="/events", tags=["Live Events"])

@router.get("")
def get_event_logs(
    event_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200)
):
    """Retrieves chronological audit events from the central event bus."""
    events = event_bus.get_history(limit=limit, event_type=event_type, status=status)
    return {
        "status": "success",
        "count": len(events),
        "events": events
    }

@router.get("/metrics")
def get_event_metrics():
    """Event throughput, success rates, and average dispatch duration."""
    metrics = event_bus.get_metrics()
    return {"status": "success", "metrics": metrics}

@router.post("/dispatch")
def dispatch_event(payload: Dict[str, Any]):
    """Dispatches a custom or interactive event onto the bus."""
    event_type = payload.get("event_type", EventType.FILTER_CHANGED.value)
    name = payload.get("name")
    event_payload = payload.get("payload", {})
    source = payload.get("source", "FRONTEND_CLIENT")

    event = event_bus.dispatch(
        event_type=event_type,
        name=name,
        payload=event_payload,
        source=source
    )

    return {
        "status": "success",
        "event": event.to_dict()
    }
