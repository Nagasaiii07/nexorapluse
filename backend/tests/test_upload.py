"""
Tests for Data Upload & Ingestion Validation (CSV, JSON, Wrapped JSON, Aliases, JSONL).
"""
import sys
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi.testclient import TestClient
from main import app

def run_upload_tests():
    client = TestClient(app)

    # 1. Standard CSV
    csv_path = BASE_DIR.parent / "sample_datasets" / "nexus_orders_sample.csv"
    with open(csv_path, "rb") as f:
        r1 = client.post("/api/data/upload", files={"file": ("nexus_orders_sample.csv", f, "text/csv")})
        assert r1.status_code == 200, f"CSV failed: {r1.json()}"
        print("PASS 1: Standard CSV Upload -> 200 OK")

    # 2. Standard JSON Sample
    json_path = BASE_DIR.parent / "sample_datasets" / "nexus_shipments_sample.json"
    with open(json_path, "rb") as f:
        r2 = client.post("/api/data/upload", files={"file": ("nexus_shipments_sample.json", f, "application/json")})
        assert r2.status_code == 200, f"Standard JSON failed: {r2.json()}"
        print("PASS 2: Standard JSON Sample -> 200 OK")

    # 3. Wrapped JSON with 'shipments' wrapper
    p3 = json.dumps({
        "shipments": [
            {"order_id": "NX9301", "customer": "Rohan Deshmukh", "platform": "Amazon", "status": "Delivered", "amount": 3499.0, "state": "Maharashtra"}
        ]
    }).encode("utf-8")
    r3 = client.post("/api/data/upload", files={"file": ("shipments.json", p3, "application/json")})
    assert r3.status_code == 200, f"Wrapped JSON failed: {r3.json()}"
    print("PASS 3: Wrapped JSON (shipments key) -> 200 OK")

    # 4. JSON with camelCase & Currency String
    p4 = json.dumps([
        {"orderId": "NX9302", "customerName": "Kavya", "marketplace": "Flipkart", "order_status": "Shipped", "totalAmount": "₹2,199.00", "region": "Kerala"}
    ]).encode("utf-8")
    r4 = client.post("/api/data/upload", files={"file": ("orders_camel.json", p4, "application/json")})
    assert r4.status_code == 200, f"CamelCase JSON failed: {r4.json()}"
    print("PASS 4: CamelCase & Currency String JSON -> 200 OK")

    # 5. Nested JSON (data.orders)
    p5 = json.dumps({
        "data": {
            "orders": [
                {"id": "NX9303", "customer": {"name": "Aditya"}, "platform": "Amazon", "payment": {"amount": 4500.0}, "shipping_address": {"state": "West Bengal"}}
            ]
        }
    }).encode("utf-8")
    r5 = client.post("/api/data/upload", files={"file": ("nested.json", p5, "application/json")})
    assert r5.status_code == 200, f"Nested JSON failed: {r5.json()}"
    print("PASS 5: Nested JSON (data.orders) -> 200 OK")

    # 6. JSON Lines (JSONL)
    p6 = '{"order_number": "NX9304", "customer_name": "Deepak", "platform": "Amazon", "total_amount": 1200, "state": "Delhi"}\n{"order_number": "NX9305", "customer_name": "Pooja", "platform": "Flipkart", "total_amount": 1800, "state": "Karnataka"}'.encode("utf-8")
    r6 = client.post("/api/data/upload", files={"file": ("orders.jsonl", p6, "application/json")})
    assert r6.status_code == 200, f"JSONL failed: {r6.json()}"
    print("PASS 6: Newline-delimited JSON (JSONL) -> 200 OK")

    print("\nALL 6 UPLOAD VALIDATION TESTS PASSED 100%!")

if __name__ == "__main__":
    run_upload_tests()
