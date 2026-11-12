"""
NEXUS Analytics API Routes.
"""
from fastapi import APIRouter, Query
from typing import Optional
from processing.logistics_engine import LogisticsEngine

router = APIRouter(tags=["Analytics"])

@router.get("/overview")
def get_executive_overview(
    platform: Optional[str] = Query(None, description="Amazon, Flipkart, or All Platforms"),
    date_range: Optional[str] = Query("Last 30 Days", description="Last 7 Days, Last 30 Days, Last 90 Days"),
    state: Optional[str] = Query(None, description="Optional Indian state filter"),
    search: Optional[str] = Query(None, description="Order, customer, or state search query")
):
    """
    Returns full master dataset for the Executive Overview dashboard
    matching the visual reference image.
    """
    kpis = LogisticsEngine.get_executive_kpis(platform, date_range, state, search)
    trend = LogisticsEngine.get_revenue_profit_trend(platform, date_range, "Daily")
    status_overview = LogisticsEngine.get_order_status_overview(platform, date_range, state)
    top_states = LogisticsEngine.get_top_states(platform, date_range)
    recent_orders = LogisticsEngine.get_recent_orders(platform, search, limit=5)

    return {
        "status": "success",
        "data_updated": "04:32 PM",
        "is_live": True,
        "kpis": kpis,
        "trend": trend,
        "status_overview": status_overview,
        "top_states": top_states,
        "recent_orders": recent_orders
    }

@router.get("/analytics/trend")
def get_trend_chart(
    platform: Optional[str] = None,
    date_range: Optional[str] = "Last 30 Days",
    interval: str = Query("Daily", pattern="^(Daily|Weekly|Monthly)$")
):
    """Time-series trend for revenue and profit curves."""
    points = LogisticsEngine.get_revenue_profit_trend(platform, date_range, interval)
    return {"status": "success", "interval": interval, "points": points}

@router.get("/analytics/platforms")
def get_platform_comparison(date_range: Optional[str] = "Last 30 Days"):
    """Side-by-side comparison between Amazon and Flipkart marketplaces."""
    amz_kpis = LogisticsEngine.get_executive_kpis(platform="Amazon", date_range=date_range)
    flp_kpis = LogisticsEngine.get_executive_kpis(platform="Flipkart", date_range=date_range)

    return {
        "status": "success",
        "amazon": {
            "name": "Amazon India",
            "gmv": amz_kpis["total_revenue"]["value"],
            "raw_gmv": amz_kpis["total_revenue"]["raw_value"],
            "orders": amz_kpis["total_orders"]["value"],
            "raw_orders": amz_kpis["total_orders"]["raw_value"],
            "aov": amz_kpis["average_order_value"]["value"],
            "success_rate": amz_kpis["delivery_success_rate"]["value"],
            "return_rate": "2.8%",
            "avg_fulfillment_days": "1.8 days",
            "market_share_pct": 54.2
        },
        "flipkart": {
            "name": "Flipkart",
            "gmv": flp_kpis["total_revenue"]["value"],
            "raw_gmv": flp_kpis["total_revenue"]["raw_value"],
            "orders": flp_kpis["total_orders"]["value"],
            "raw_orders": flp_kpis["total_orders"]["raw_value"],
            "aov": flp_kpis["average_order_value"]["value"],
            "success_rate": flp_kpis["delivery_success_rate"]["value"],
            "return_rate": "3.1%",
            "avg_fulfillment_days": "2.1 days",
            "market_share_pct": 45.8
        }
    }

@router.get("/analytics/geography")
def get_geographic_analytics(
    platform: Optional[str] = None,
    date_range: Optional[str] = "Last 30 Days"
):
    """State-by-state geographic breakdown across all regions of India."""
    top_states = LogisticsEngine.get_top_states(platform, date_range)
    return {
        "status": "success",
        "total_active_states": len(top_states),
        "states": top_states
    }
