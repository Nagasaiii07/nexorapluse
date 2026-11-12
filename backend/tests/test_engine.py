"""
Tests for LogisticsEngine and Business Calculations.
"""
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from processing.logistics_engine import LogisticsEngine
from database.seed_data import seed_database

def test_engine_kpis():
    seed_database(force=False)
    kpis = LogisticsEngine.get_executive_kpis()
    assert kpis["total_orders"]["value"] == "8,426"
    assert kpis["delivered_orders"]["value"] == "7,621"
    assert kpis["cancelled_orders"]["value"] == "327"
    assert kpis["returned_orders"]["value"] == "248"
    assert kpis["delivery_success_rate"]["value"] == "92.8%"
    assert kpis["average_order_value"]["value"] == "₹1,752"

def test_top_states():
    seed_database(force=False)
    states = LogisticsEngine.get_top_states()
    assert len(states) >= 5
    assert states[0]["state"] == "Maharashtra"
    assert states[0]["revenueFormatted"] == "₹2.1L"
    assert states[1]["state"] == "Karnataka"

def test_status_overview():
    seed_database(force=False)
    overview = LogisticsEngine.get_order_status_overview()
    items = {item["name"]: item for item in overview["items"]}
    assert items["Delivered"]["count"] == 7621
    assert items["Delivered"]["percentage"] == 90.4
    assert items["Shipped"]["count"] == 171
