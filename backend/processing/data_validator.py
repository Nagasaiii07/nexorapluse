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

    # Canonical alias mapping for robust real-world logistics/order datasets
    FIELD_ALIASES = {
        "order_number": [
            "order_number", "ordernumber", "order_id", "orderid", "order no",
            "order_no", "order", "orderno", "id", "tracking_number", "tracking_id",
            "waybill", "invoice_no", "invoice_number"
        ],
        "customer_name": [
            "customer_name", "customername", "customer", "customer_full_name",
            "client_name", "client", "buyer_name", "buyer", "recipient_name",
            "recipient", "name"
        ],
        "platform": [
            "platform", "marketplace", "channel", "source", "store", "vendor",
            "sales_channel", "courier"
        ],
        "total_amount": [
            "total_amount", "totalamount", "amount", "total", "price", "total_price",
            "order_total", "ordertotal", "order_amount", "value", "order_value", "cost"
        ],
        "state": [
            "state", "region", "shipping_state", "destination_state", "delivery_state",
            "province", "location_state", "destination"
        ],
        "order_status": [
            "order_status", "status", "shipment_status", "delivery_status", "state_status"
        ],
        "city": [
            "city", "destination_city", "delivery_city", "shipping_city", "town"
        ],
        "order_date": [
            "order_date", "date", "created_at", "timestamp", "order_time", "dispatch_date"
        ]
    }

    @classmethod
    def get_field_value(cls, record: Dict[str, Any], field: str, default: Any = None) -> Any:
        """Retrieves value from record matching canonical name or any alias."""
        if not isinstance(record, dict):
            return default
        # Direct key check
        if field in record and record[field] is not None:
            return record[field]
        # Check aliases
        aliases = cls.FIELD_ALIASES.get(field, [field])
        for k, v in record.items():
            if v is None:
                continue
            k_clean = k.strip().lower().replace("-", "_").replace(" ", "_")
            k_condensed = k_clean.replace("_", "")
            for alias in aliases:
                if k_clean == alias or k_condensed == alias.replace("_", ""):
                    return v
        # Check nested structures (e.g. customer.name, shipping.state)
        if field == "customer_name":
            cust = record.get("customer") or record.get("recipient")
            if isinstance(cust, dict):
                return cust.get("name") or cust.get("full_name") or default
        elif field == "state":
            loc = record.get("shipping_address") or record.get("location") or record.get("address")
            if isinstance(loc, dict):
                return loc.get("state") or loc.get("province") or default
        elif field == "total_amount":
            pay = record.get("payment") or record.get("pricing") or record.get("financials")
            if isinstance(pay, dict):
                return pay.get("amount") or pay.get("total") or default
        return default

    @classmethod
    def validate_records(cls, records: List[Dict[str, Any]]) -> ValidationReport:
        report = ValidationReport()
        report.row_count = len(records)
        if not records:
            report.is_valid = False
            report.errors.append("Dataset is completely empty.")
            return report

        # Collect columns across records
        all_columns = []
        seen_cols = set()
        for r in records[:50]:
            if isinstance(r, dict):
                for k in r.keys():
                    if k not in seen_cols:
                        seen_cols.add(k)
                        all_columns.append(k)

        report.columns = all_columns
        report.column_count = len(report.columns)

        if not report.columns:
            report.is_valid = False
            report.errors.append("No record attributes found in dataset.")
            return report

        first = records[0] if isinstance(records[0], dict) else {}

        # Check required columns using alias matching
        for req in cls.REQUIRED_ORDER_COLUMNS:
            aliases = cls.FIELD_ALIASES.get(req, [req])
            # Check if any alias matches any available column
            matched = False
            for col in report.columns:
                c_clean = col.strip().lower().replace("-", "_").replace(" ", "_")
                c_condensed = c_clean.replace("_", "")
                if any(c_clean == a or c_condensed == a.replace("_", "") for a in aliases):
                    matched = True
                    break
            # Also check if get_field_value can resolve it from the first record
            if not matched and cls.get_field_value(first, req) is not None:
                matched = True

            if not matched:
                report.is_valid = False
                report.errors.append(f"Missing mandatory column: '{req}'")

        # Inspect data types and missing values
        seen_order_ids = set()
        missing_count = 0
        duplicate_count = 0

        for r in records:
            if not isinstance(r, dict):
                continue
            ord_id = cls.get_field_value(r, "order_number")
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
