"""
Tests for Central Event Bus & Dispatching Pipeline.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from core.event_manager import EventManager
from events.types import Event
from core.config import EventType, EventStatus

def test_event_dispatch_and_subscriber():
    bus = EventManager()
    received = []

    def sample_handler(evt: Event):
        received.append(evt.payload.get("key"))
        return {"handled": True}

    bus.subscribe(EventType.FILTER_CHANGED.value, sample_handler)
    event = bus.dispatch(
        event_type=EventType.FILTER_CHANGED.value,
        payload={"key": "test_filter"},
        source="TEST"
    )

    assert event.status == EventStatus.SUCCESS.value
    assert len(received) == 1
    assert received[0] == "test_filter"
    assert event.duration_ms >= 0.0
    assert event.result.get("handled") is True
