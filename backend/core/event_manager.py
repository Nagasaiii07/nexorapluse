"""
NEXUS Event Manager.
Central event bus implementing publish-subscribe dispatching, lifecycle timing,
database persistence, and event telemetry.
"""
import time
import json
from datetime import datetime
from typing import Callable, Dict, List, Any, Optional

from events.types import Event
from core.config import EventType, EventStatus
from database.session import DatabaseConnection


class EventManager:
    """Central Event Bus for NEXUS Logistics Intelligence."""

    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Event], Any]]] = {}
        self._history: List[Event] = []
        self._max_history: int = 500

    def subscribe(self, event_type: str, handler: Callable[[Event], Any]) -> None:
        """Register a callback handler for an event type."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        if handler not in self._subscribers[event_type]:
            self._subscribers[event_type].append(handler)

    def unsubscribe(self, event_type: str, handler: Callable[[Event], Any]) -> None:
        """Unregister a callback handler."""
        if event_type in self._subscribers and handler in self._subscribers[event_type]:
            self._subscribers[event_type].remove(handler)

    def dispatch(
        self,
        event_type: str,
        name: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        source: str = "UI"
    ) -> Event:
        """
        Executes event dispatch pipeline:
        1. Instantiates Event object
        2. Executes registered subscriber handlers
        3. Measures processing duration in milliseconds
        4. Persists to database events table
        5. Returns completed Event with results
        """
        event = Event(
            name=name or event_type,
            event_type=str(event_type),
            payload=payload or {},
            source=source
        )

        start_time = time.perf_counter()
        handlers = self._subscribers.get(event_type, [])
        combined_result: Dict[str, Any] = {}
        has_errors = False

        for handler in handlers:
            try:
                out = handler(event)
                if isinstance(out, dict):
                    combined_result.update(out)
                elif out is not None:
                    combined_result[handler.__name__] = out
            except Exception as ex:
                has_errors = True
                event.error = f"Error in handler '{handler.__name__}': {str(ex)}"
                break

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        event.duration_ms = round(elapsed_ms, 2)
        event.result = combined_result
        event.status = EventStatus.FAILED.value if has_errors else EventStatus.SUCCESS.value

        self._record_event(event)
        return event

    def _record_event(self, event: Event) -> None:
        """Buffers in memory and writes to the persistent events table."""
        self._history.insert(0, event)
        if len(self._history) > self._max_history:
            self._history.pop()

        try:
            sql = """
            INSERT INTO events (event_id, name, event_type, status, duration_ms, source, payload_json, result_json, error)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """
            DatabaseConnection.execute_non_query(
                sql,
                (
                    event.event_id,
                    event.name,
                    event.event_type,
                    event.status,
                    event.duration_ms,
                    event.source,
                    json.dumps(event.payload, default=str),
                    json.dumps(event.result, default=str),
                    event.error
                )
            )
        except Exception as e:
            print(f"[NEXUS EventBus Warning] Could not persist event {event.event_id}: {e}")

    def get_history(
        self,
        limit: int = 50,
        event_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves recent events from persistent database storage."""
        sql = "SELECT * FROM events"
        clauses = []
        params = []

        if event_type and event_type != "ALL":
            clauses.append("event_type = ?")
            params.append(event_type)
        if status and status != "ALL":
            clauses.append("status = ?")
            params.append(status)

        if clauses:
            sql += " WHERE " + " AND ".join(clauses)

        sql += " ORDER BY id DESC LIMIT ?"
        params.append(limit)

        try:
            rows = DatabaseConnection.execute_query(sql, tuple(params))
            for row in rows:
                if row.get("payload_json"):
                    try:
                        row["payload"] = json.loads(row["payload_json"])
                    except Exception:
                        row["payload"] = {}
                if row.get("result_json"):
                    try:
                        row["result"] = json.loads(row["result_json"])
                    except Exception:
                        row["result"] = {}
            return rows
        except Exception:
            return [e.to_dict() for e in self._history[:limit]]

    def get_metrics(self) -> Dict[str, Any]:
        """Calculates total, success, failure counts and average latency."""
        try:
            rows = DatabaseConnection.execute_query(
                """SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as success,
                    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
                    AVG(duration_ms) as avg_duration
                   FROM events;"""
            )
            if rows and rows[0]["total"]:
                r = rows[0]
                return {
                    "total": r["total"] or 0,
                    "success": r["success"] or 0,
                    "failed": r["failed"] or 0,
                    "avg_duration_ms": round(float(r["avg_duration"] or 0.0), 2)
                }
        except Exception:
            pass

        total = len(self._history)
        if total == 0:
            return {"total": 0, "success": 0, "failed": 0, "avg_duration_ms": 0.0}
        success = sum(1 for e in self._history if e.status == EventStatus.SUCCESS.value)
        failed = sum(1 for e in self._history if e.status == EventStatus.FAILED.value)
        avg_dur = sum(e.duration_ms for e in self._history) / total
        return {
            "total": total,
            "success": success,
            "failed": failed,
            "avg_duration_ms": round(avg_dur, 2)
        }


# Global Singleton Event Manager Instance
event_bus = EventManager()
