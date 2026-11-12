"""
Event Type Definitions and Schemas for NEXUS Event Bus.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

@dataclass
class Event:
    """Represents a discrete lifecycle event in the NEXUS Event Bus."""
    event_id: str = field(default_factory=lambda: f"EVT-{str(uuid.uuid4())[:8].upper()}")
    name: str = ""
    event_type: str = "FILTER_CHANGED"
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    payload: Dict[str, Any] = field(default_factory=dict)
    status: str = "PENDING"
    duration_ms: float = 0.0
    result: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    source: str = "SYSTEM"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "name": self.name,
            "event_type": self.event_type,
            "timestamp": self.timestamp,
            "payload": self.payload,
            "status": self.status,
            "duration_ms": self.duration_ms,
            "result": self.result,
            "error": self.error,
            "source": self.source
        }
