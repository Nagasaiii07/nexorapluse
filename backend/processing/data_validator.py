"""
NEXUS Data Validator.
Enforces schema validation, column type enforcement, and anomaly screening
for logistics and orders datasets.
"""
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

@dataclass
class ValidationReport:
    is_valid: bool = True
    row_count: int = 0
    column_count: int = 0
    missing_value_count: int = 0
    duplicate_rows_count: int = 0
    columns: List[str] = field(default_factory=list)
    numeric_columns: List[str] = field(default_factory=list)
    categorical_columns: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "row_count": self.row_count,
            "column_count": self.column_count,
            "missing_value_count": self.missing_value_count,
            "duplicate_rows_count": self.duplicate_rows_count,
            "columns": self.columns,
            "numeric_columns": self.numeric_columns,
            "categorical_columns": self.categorical_columns,
            "errors": self.errors,
            "warnings": self.warnings
        }


class DataValidator:
    """Validates tabular logistics records (dict records or DataFrames)."""

    REQUIRED_ORDER_COLUMNS = ["order_number", "customer_name", "platform", "total_amount", "state"]

    @classmethod
    def validate_records(cls, records: List[Dict[str, Any]]) -> ValidationReport:
        report = ValidationReport()
        report.row_count = len(records)
        if not records:
            report.is_valid = False
            report.errors.append("Dataset is completely empty.")
            return report

        first = records[0]
        report.columns = list(first.keys())
        report.column_count = len(report.columns)

        # Check required columns
        for req in cls.REQUIRED_ORDER_COLUMNS:
            if req not in first:
                # Check case-insensitive match
                matches = [c for c in report.columns if c.lower() == req.lower()]
                if not matches:
                    report.is_valid = False
                    report.errors.append(f"Missing mandatory column: '{req}'")

        # Inspect data types and missing values
        seen_order_ids = set()
        missing_count = 0
        duplicate_count = 0

        for r in records:
            ord_id = r.get("order_number") or r.get("Order ID") or r.get("id")
            if ord_id:
                if ord_id in seen_order_ids:
                    duplicate_count += 1
                seen_order_ids.add(ord_id)

            for col, val in r.items():
                if val is None or val == "" or str(val).strip().lower() in ("nan", "null", "none"):
                    missing_count += 1

        report.missing_value_count = missing_count
        report.duplicate_rows_count = duplicate_count

        if duplicate_count > 0:
            report.warnings.append(f"Found {duplicate_count} duplicate order records.")
        if missing_count > 0:
            report.warnings.append(f"Found {missing_count} missing attribute cells.")

        # Identify numeric vs categorical
        for col in report.columns:
            sample_val = first.get(col)
            if isinstance(sample_val, (int, float)) and not isinstance(sample_val, bool):
                report.numeric_columns.append(col)
            else:
                try:
                    float(sample_val)
                    report.numeric_columns.append(col)
                except (ValueError, TypeError):
                    report.categorical_columns.append(col)

        return report
