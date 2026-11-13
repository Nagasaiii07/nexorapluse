"""
NEXUS Data Management & Ingestion API Routes.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, Dict, Any
import csv
import io
import json
import uuid
from datetime import datetime

from processing.data_validator import DataValidator
from processing.data_processor import DataProcessor
from database.session import DatabaseConnection
from database.seed_data import seed_database
from core.event_manager import event_bus
from core.config import EventType

router = APIRouter(prefix="/data", tags=["Data Management"])

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_source: str = Form("UPLOAD")
):
    """
    Ingests CSV or JSON orders dataset, validates columns,
    stores records into the database, and fires event.
    """
    filename = file.filename or "dataset.csv"
    contents = await file.read()

    records = []
    lower_fn = filename.lower()
    if lower_fn.endswith(".csv"):
        text = contents.decode("utf-8", errors="replace")
        if text.startswith("\ufeff"):
            text = text[1:]
        reader = csv.DictReader(io.StringIO(text))
        records = [row for row in reader]
    elif lower_fn.endswith(".json") or lower_fn.endswith(".jsonl") or lower_fn.endswith(".ndjson"):
        text = contents.decode("utf-8", errors="replace").strip()
        if text.startswith("\ufeff"):
            text = text[1:]
        try:
            records = json.loads(text)
        except json.JSONDecodeError:
            # Fallback for newline-delimited JSON (JSONL)
            records = []
            for line in text.splitlines():
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
            if not records:
                raise HTTPException(status_code=400, detail="Invalid JSON format.")

        # Unpack wrapped dictionary structures if needed
        if isinstance(records, dict):
            for candidate in ("orders", "shipments", "data", "records", "items", "rows", "results", "payload"):
                val = records.get(candidate)
                if isinstance(val, list):
                    records = val
                    break
                elif isinstance(val, dict):
                    for sub_cand in ("orders", "shipments", "records", "items"):
                        if isinstance(val.get(sub_cand), list):
                            records = val[sub_cand]
                            break
                    if isinstance(records, list):
                        break
            if isinstance(records, dict):
                if all(isinstance(v, dict) for v in records.values()):
                    records = list(records.values())
                else:
                    records = [records]
    else:
        raise HTTPException(status_code=400, detail="Only CSV and JSON file formats are supported.")

    # Validate dataset
    validation = DataValidator.validate_records(records)
    if not validation.is_valid:
        raise HTTPException(
            status_code=422,
            detail={"message": "Dataset validation failed", "errors": validation.errors}
        )

    # Ingest records into database
    orders_to_insert = []
    now_iso = datetime.utcnow().isoformat()
    for idx, r in enumerate(records):
        ord_num = (
            DataValidator.get_field_value(r, "order_number") or
            f"NX{9000 + idx}"
        )
        ord_id = f"ORD-{ord_num}"
        name = (
            DataValidator.get_field_value(r, "customer_name") or
            "Anonymous Customer"
        )
        plat = (
            DataValidator.get_field_value(r, "platform") or
            "Amazon"
        )
        status = (
            DataValidator.get_field_value(r, "order_status") or
            "Processing"
        )
        raw_val = DataValidator.get_field_value(r, "total_amount")
        try:
            if isinstance(raw_val, (int, float)):
                val = float(raw_val)
            elif raw_val:
                s = str(raw_val).replace("₹", "").replace("$", "").replace(",", "").strip()
                val = float(s)
            else:
                val = 1500.0
        except (ValueError, TypeError):
            val = 1500.0

        state = (
            DataValidator.get_field_value(r, "state") or
            "Maharashtra"
        )
        city = (
            DataValidator.get_field_value(r, "city") or
            "Mumbai"
        )

        orders_to_insert.append((
            ord_id, str(ord_num), str(name), f"{str(name).lower().replace(' ', '.')}@example.com",
            str(plat), str(status), now_iso, val, 1, str(state), str(city), "400001"
        ))

    insert_sql = """
    INSERT OR REPLACE INTO orders (id, order_number, customer_name, customer_email, platform,
                        order_status, order_date, total_amount, items_count, state, city, pincode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    DatabaseConnection.execute_many(insert_sql, orders_to_insert)

    # Dispatch Event
    event_type = EventType.JSON_DATASET_UPLOADED.value if filename.lower().endswith(".json") else EventType.CSV_DATASET_UPLOADED.value
    event = event_bus.dispatch(
        event_type=event_type,
        name=f"Dataset Ingested: {filename}",
        payload={"filename": filename, "records_count": len(records), "source": dataset_source},
        source="DATA_INGESTION_MODULE"
    )

    return {
        "status": "success",
        "filename": filename,
        "records_imported": len(records),
        "validation_report": validation.to_dict(),
        "event_id": event.event_id
    }

@router.post("/reset-sample")
def reset_sample_data():
    """Restores default 8,426 reference orders database."""
    seed_database(force=True)
    event = event_bus.dispatch(
        event_type=EventType.SYSTEM_REFRESH.value,
        name="Reset Default Sample Dataset",
        payload={"action": "RESET_SAMPLE_DATABASE"},
        source="ADMIN_CONSOLE"
    )
    return {
        "status": "success",
        "message": "Sample dataset restored successfully.",
        "event_id": event.event_id
    }

@router.post("/clean")
def clean_dataset(payload: Dict[str, Any]):
    """Applies deduplication or missing value handling."""
    operation = payload.get("operation", "remove_duplicates")
    # Fetch all records
    rows = DatabaseConnection.execute_query("SELECT * FROM orders;")
    if operation == "remove_duplicates":
        res = DataProcessor.remove_duplicates(rows, key_field="order_number")
    else:
        res = DataProcessor.clean_missing_values(rows, strategy="drop")

    event = event_bus.dispatch(
        event_type=EventType.DATA_CLEANED.value,
        name=f"Data Cleaned ({operation})",
        payload={"operation": operation, "removed_count": res.removed_count},
        source="CLEANING_PIPELINE"
    )

    return {
        "status": "success",
        "operation": res.operation_name,
        "removed_records": res.removed_count,
        "remaining_records": res.processed_count,
        "duration_ms": res.duration_ms,
        "summary": res.summary_message,
        "event_id": event.event_id
    }

@router.get("/summary")
def get_dataset_summary():
    """Summary of database storage and tables."""
    orders_cnt = DatabaseConnection.execute_query("SELECT COUNT(*) as cnt FROM orders;")[0]["cnt"]
    shipments_cnt = DatabaseConnection.execute_query("SELECT COUNT(*) as cnt FROM shipments;")[0]["cnt"]
    events_cnt = DatabaseConnection.execute_query("SELECT COUNT(*) as cnt FROM events;")[0]["cnt"]

    return {
        "status": "success",
        "orders_count": orders_cnt,
        "shipments_count": shipments_cnt,
        "events_count": events_cnt,
        "database_type": "PostgreSQL (Production) / SQLite (Local)",
        "last_sync": datetime.utcnow().isoformat()
    }
