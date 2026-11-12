"""
NEXUS Data Processor.
Provides functional data transformations, cleaning, missing-value imputation,
duplicate removal, and statistical summaries.
"""
import time
import math
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

@dataclass
class ProcessingResult:
    records: List[Dict[str, Any]]
    original_count: int = 0
    processed_count: int = 0
    removed_count: int = 0
    duration_ms: float = 0.0
    operation_name: str = ""
    summary_message: str = ""

class DataProcessor:
    """Encapsulates data cleaning and transformation routines."""

    @staticmethod
    def remove_duplicates(records: List[Dict[str, Any]], key_field: str = "order_number") -> ProcessingResult:
        start = time.perf_counter()
        orig = len(records)
        seen = set()
        cleaned = []
        for r in records:
            k = r.get(key_field)
            if k is not None and k in seen:
                continue
            if k is not None:
                seen.add(k)
            cleaned.append(r)

        elapsed = round((time.perf_counter() - start) * 1000.0, 2)
        proc = len(cleaned)
        return ProcessingResult(
            records=cleaned,
            original_count=orig,
            processed_count=proc,
            removed_count=orig - proc,
            duration_ms=elapsed,
            operation_name="remove_duplicates",
            summary_message=f"Removed {orig - proc} duplicate records."
        )

    @staticmethod
    def clean_missing_values(records: List[Dict[str, Any]], strategy: str = "drop", columns: Optional[List[str]] = None) -> ProcessingResult:
        start = time.perf_counter()
        orig = len(records)
        cleaned = []

        for r in records:
            has_missing = False
            for col in (columns or r.keys()):
                val = r.get(col)
                if val is None or val == "" or str(val).strip().lower() in ("nan", "null", "none"):
                    has_missing = True
                    break
            if strategy == "drop":
                if not has_missing:
                    cleaned.append(r)
            else:
                # Fill strategy
                copy_r = dict(r)
                for col in (columns or r.keys()):
                    val = copy_r.get(col)
                    if val is None or val == "" or str(val).strip().lower() in ("nan", "null", "none"):
                        copy_r[col] = "UNKNOWN" if isinstance(val, str) else 0.0
                cleaned.append(copy_r)

        elapsed = round((time.perf_counter() - start) * 1000.0, 2)
        proc = len(cleaned)
        return ProcessingResult(
            records=cleaned,
            original_count=orig,
            processed_count=proc,
            removed_count=orig - proc,
            duration_ms=elapsed,
            operation_name="clean_missing_values",
            summary_message=f"Applied strategy '{strategy}'. Output count: {proc}."
        )

    @staticmethod
    def compute_summary_statistics(values: List[float]) -> Dict[str, float]:
        """Calculates statistical summary for an array of numbers."""
        if not values:
            return {}
        n = len(values)
        s_val = sorted(values)
        mean_v = sum(values) / n
        variance = sum((x - mean_v) ** 2 for x in values) / n if n > 1 else 0.0
        std_v = math.sqrt(variance)

        q25 = s_val[int(0.25 * n)]
        median_v = s_val[int(0.50 * n)]
        q75 = s_val[int(0.75 * n)]

        return {
            "count": float(n),
            "mean": round(mean_v, 2),
            "std": round(std_v, 2),
            "min": round(s_val[0], 2),
            "q25": round(q25, 2),
            "median": round(median_v, 2),
            "q75": round(q75, 2),
            "max": round(s_val[-1], 2)
        }
