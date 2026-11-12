"""
Seed Data Generator for NEXUS Logistics Intelligence.
Populates realistic orders, shipments, items, and event telemetry that match
the exact KPIs and visual reference specification.
"""
import uuid
import random
from datetime import datetime, timedelta
from database.session import DatabaseConnection

INDIAN_STATES = [
    ("Maharashtra", 0.142, 210000.0, "Mumbai"),
    ("Karnataka", 0.121, 180000.0, "Bengaluru"),
    ("Tamil Nadu", 0.108, 160000.0, "Chennai"),
    ("Gujarat", 0.087, 130000.0, "Ahmedabad"),
    ("Uttar Pradesh", 0.081, 120000.0, "Lucknow"),
    ("Delhi", 0.075, 110000.0, "New Delhi"),
    ("Telangana", 0.068, 100000.0, "Hyderabad"),
    ("West Bengal", 0.062, 92000.0, "Kolkata"),
    ("Rajasthan", 0.054, 80000.0, "Jaipur"),
    ("Kerala", 0.048, 71000.0, "Kochi"),
    ("Haryana", 0.042, 62000.0, "Gurugram"),
    ("Madhya Pradesh", 0.038, 56000.0, "Bhopal"),
    ("Punjab", 0.032, 47000.0, "Chandigarh"),
    ("Andhra Pradesh", 0.025, 37000.0, "Visakhapatnam"),
    ("Bihar", 0.017, 25000.0, "Patna")
]

COURIERS = ["Delhivery", "BlueDart", "Ekart", "Amazon Logistics", "Shadowfax"]

SAMPLE_NAMES = [
    "Priya Sharma", "Rahul Mehta", "Sneha Reddy", "Arjun Kumar", "Divya Patel",
    "Amitabh Das", "Ananya Iyer", "Vikram Singh", "Pooja Hegde", "Rohan Joshi",
    "Deepak Verma", "Neha Kapoor", "Siddharth Rao", "Kavita Nair", "Rajesh Gupta"
]

def seed_database(force: bool = False):
    """Populates initial database state matching reference image exactly."""
    DatabaseConnection.init_db()

    # Check if already seeded
    existing_orders = DatabaseConnection.execute_query("SELECT COUNT(*) as cnt FROM orders;")
    if existing_orders and existing_orders[0]["cnt"] == 8426 and not force:
        return

    print("[NEXUS Seed] Seeding calibrated dataset (8,426 orders)...")

    # Clear existing
    DatabaseConnection.execute_non_query("DELETE FROM order_items;")
    DatabaseConnection.execute_non_query("DELETE FROM shipments;")
    DatabaseConnection.execute_non_query("DELETE FROM orders;")
    DatabaseConnection.execute_non_query("DELETE FROM events;")
    DatabaseConnection.execute_non_query("DELETE FROM platforms;")
    DatabaseConnection.execute_non_query("DELETE FROM users;")

    # 1. Users
    DatabaseConnection.execute_non_query(
        """INSERT OR REPLACE INTO users (id, email, name, role, avatar)
           VALUES ('USR-001', 'raghav.dev@nexus.logistics', 'Raghav Dev', 'Admin', 'RD');"""
    )

    # 2. Platforms
    platforms_data = [
        ("PLT-AMZ", "amazon", "Amazon India", "ShoppingCart", 1),
        ("PLT-FLP", "flipkart", "Flipkart", "ShoppingBag", 1)
    ]
    DatabaseConnection.execute_many(
        "INSERT OR REPLACE INTO platforms (id, code, name, icon, is_active) VALUES (?, ?, ?, ?, ?);",
        platforms_data
    )

    # 3. Exact 5 Featured Orders from Reference Image
    exact_featured = [
        ("NX8426", "Priya Sharma", "Amazon", "Delivered", "04 May, 4:21 PM", 2499.0, "Maharashtra", "Mumbai"),
        ("NX8425", "Rahul Mehta", "Flipkart", "Shipped", "04 May, 4:18 PM", 1799.0, "Karnataka", "Bengaluru"),
        ("NX8424", "Sneha Reddy", "Amazon", "Processing", "04 May, 4:15 PM", 3299.0, "Telangana", "Hyderabad"),
        ("NX8423", "Arjun Kumar", "Flipkart", "Delivered", "04 May, 4:12 PM", 1199.0, "Tamil Nadu", "Chennai"),
        ("NX8422", "Divya Patel", "Amazon", "Returned", "04 May, 4:10 PM", 2299.0, "Gujarat", "Ahmedabad")
    ]

    # Reference date for all sample orders: May 08, 2026
    anchor_time = datetime(2026, 5, 8, 16, 21, 0)
    base_time = anchor_time
    orders_to_insert = []
    items_to_insert = []
    shipments_to_insert = []

    for i, (ord_num, name, plat, status, date_str, val, state, city) in enumerate(exact_featured):
        order_id = f"ORD-{ord_num}"
        ord_date = base_time - timedelta(minutes=i * 3)
        orders_to_insert.append((
            order_id, ord_num, name, f"{name.lower().replace(' ', '.')}@example.com",
            plat, status, ord_date.isoformat(), val, 1, state, city, "400001"
        ))

        items_to_insert.append((
            f"ITM-{ord_num}-1", order_id, f"SKU-{ord_num}", "Smart Logistics Unit", "Electronics", 1, val, val
        ))

        shipments_to_insert.append((
            f"SHP-{ord_num}", f"TRK-{ord_num}", order_id, random.choice(COURIERS),
            status if status != "Processing" else "Processing",
            "BOM-Hub-1", f"{state[:3].upper()}-Hub",
            (ord_date - timedelta(hours=4)).isoformat(),
            (ord_date + timedelta(days=2)).isoformat(),
            ord_date.isoformat() if status == "Delivered" else None,
            1
        ))

    # Exact status targets summing to exactly 8,426 (featured already has 2 Delivered, 1 Shipped, 1 Processing, 1 Returned):
    # Total = 8,426
    # Delivered: 7,621 (7,619 remaining)
    # Shipped: 171 (170 remaining)
    # Processing: 59 in active status + 65 in queue = 124 (123 remaining)
    # Cancelled: 327 (327 remaining)
    # Returned: 248 (247 remaining)
    # Total remaining: 7619 + 170 + 123 + 327 + 247 = 8421
    # Exact calibrated counts summing to 8,426 total orders:
    # Delivered: 7,621 (7,619 generated + 2 featured)
    # Shipped: 171 (170 generated + 1 featured)
    # Processing: 59 (58 generated + 1 featured; KPI displays 423 pipeline total)
    # Cancelled: 327 (327 generated)
    # Returned: 248 (247 generated + 1 featured)
    # Total = 8,426
    status_counts = [
        ("Delivered", 7619),
        ("Shipped", 170),
        ("Processing", 58),
        ("Cancelled", 327),
        ("Returned", 247)
    ]

    state_weights = [st[1] for st in INDIAN_STATES]
    state_names = [st[0] for st in INDIAN_STATES]
    state_cities = {st[0]: st[3] for st in INDIAN_STATES}

    # Total remaining revenue to reach ~14,80,000 (after 11,095 from featured)
    # Avg per remaining order ~ 174.5
    order_idx = 8421
    rng = random.Random(42)

    for st_name, count in status_counts:
        for _ in range(count):
            ord_num = f"NX{order_idx:04d}"
            order_id = f"ORD-{ord_num}"
            plat = "Amazon" if rng.random() < 0.54 else "Flipkart"
            cust_name = rng.choice(SAMPLE_NAMES)
            chosen_state = rng.choices(state_names, weights=state_weights, k=1)[0]
            city = state_cities[chosen_state]

            # Scale state amounts proportionally
            base_amt = 174.5 * (1.2 if chosen_state in ("Maharashtra", "Karnataka") else 0.9)
            val = round(max(49.0, rng.gauss(base_amt, 45.0)), 2)
            days_ago = rng.uniform(0.02, 25.0)
            ord_date = anchor_time - timedelta(days=days_ago)

            orders_to_insert.append((
                order_id, ord_num, cust_name, f"user{order_idx}@nexusmail.in",
                plat, st_name, ord_date.isoformat(), val, 1, chosen_state, city, "560001"
            ))

            items_to_insert.append((
                f"ITM-{ord_num}-1", order_id, f"SKU-{order_idx % 100}",
                "Logistics Package", "Retail", 1, val, val
            ))

            shipments_to_insert.append((
                f"SHP-{ord_num}", f"TRK-{ord_num}", order_id, rng.choice(COURIERS),
                st_name if st_name != "Processing" else "Processing",
                "BLR-Central-Hub", f"{chosen_state[:3].upper()}-Regional",
                (ord_date - timedelta(hours=6)).isoformat(),
                (ord_date + timedelta(days=3)).isoformat(),
                (ord_date + timedelta(days=2)).isoformat() if st_name == "Delivered" else None,
                1 if st_name != "Returned" else 2
            ))
            order_idx -= 1

    insert_order_sql = """
    INSERT INTO orders (id, order_number, customer_name, customer_email, platform,
                        order_status, order_date, total_amount, items_count, state, city, pincode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """
    insert_item_sql = """
    INSERT INTO order_items (id, order_id, sku, product_name, category, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """
    insert_shipment_sql = """
    INSERT INTO shipments (id, tracking_number, order_id, courier, shipment_status, origin_hub,
                           destination_hub, dispatch_date, estimated_delivery, actual_delivery, delivery_attempts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """

    DatabaseConnection.execute_many(insert_order_sql, orders_to_insert)
    DatabaseConnection.execute_many(insert_item_sql, items_to_insert)
    DatabaseConnection.execute_many(insert_shipment_sql, shipments_to_insert)

    # Seed Initial Event Logs
    initial_events = [
        ("EVT-1001", "Telemetry Stream Synchronized", "SYSTEM_REFRESH", "SUCCESS", 14.2, "SYSTEM", '{"records": 8426}', '{"status": "READY"}'),
        ("EVT-1002", "Amazon SP-API Batch Ingested", "CSV_DATASET_UPLOADED", "SUCCESS", 42.8, "API", '{"batch": "AMZ-2026-05"}', '{"imported": 4550}'),
        ("EVT-1003", "Flipkart Logistics Sync", "CSV_DATASET_UPLOADED", "SUCCESS", 38.1, "API", '{"batch": "FLP-2026-05"}', '{"imported": 3876}'),
        ("EVT-1004", "Shipment Status Transition #NX8426 -> Delivered", "SHIPMENT_STATUS_UPDATED", "SUCCESS", 8.4, "COURIER", '{"tracking": "TRK-NX8426"}', '{"status": "Delivered"}'),
        ("EVT-1005", "Automated Outlier Scan Completed", "DATA_CLEANED", "SUCCESS", 22.1, "WORKER", '{"strategy": "IQR"}', '{"anomalies_flagged": 12}')
    ]
    DatabaseConnection.execute_many(
        """INSERT INTO events (event_id, name, event_type, status, duration_ms, source, payload_json, result_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);""",
        initial_events
    )

    print(f"[NEXUS Seed] Seeded exactly {len(orders_to_insert)} orders (matches reference 8,426)!")
