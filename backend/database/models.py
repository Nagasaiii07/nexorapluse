"""
SQLAlchemy ORM models & database entity definitions for NEXUS.
"""
from datetime import datetime
from database.session import Base, HAS_SQLALCHEMY

if HAS_SQLALCHEMY and Base:
    from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
    from sqlalchemy.orm import relationship

    class User(Base):
        __tablename__ = "users"
        id = Column(String, primary_key=True)
        email = Column(String, unique=True, nullable=False)
        name = Column(String, nullable=False)
        role = Column(String, default="Admin")
        avatar = Column(String, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow)

    class Platform(Base):
        __tablename__ = "platforms"
        id = Column(String, primary_key=True)
        code = Column(String, unique=True, nullable=False)
        name = Column(String, nullable=False)
        icon = Column(String, nullable=True)
        is_active = Column(Integer, default=1)
        created_at = Column(DateTime, default=datetime.utcnow)

    class Order(Base):
        __tablename__ = "orders"
        id = Column(String, primary_key=True)
        order_number = Column(String, unique=True, nullable=False, index=True)
        customer_name = Column(String, nullable=False)
        customer_email = Column(String, nullable=True)
        platform = Column(String, nullable=False, index=True)
        order_status = Column(String, nullable=False, index=True)
        order_date = Column(DateTime, nullable=False, index=True)
        total_amount = Column(Float, nullable=False)
        items_count = Column(Integer, default=1)
        state = Column(String, nullable=False, index=True)
        city = Column(String, nullable=True)
        pincode = Column(String, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
        shipment = relationship("Shipment", back_populates="order", uselist=False, cascade="all, delete-orphan")

    class OrderItem(Base):
        __tablename__ = "order_items"
        id = Column(String, primary_key=True)
        order_id = Column(String, ForeignKey("orders.id"), nullable=False)
        sku = Column(String, nullable=True)
        product_name = Column(String, nullable=False)
        category = Column(String, nullable=False)
        quantity = Column(Integer, default=1)
        unit_price = Column(Float, nullable=False)
        total_price = Column(Float, nullable=False)

        order = relationship("Order", back_populates="items")

    class Shipment(Base):
        __tablename__ = "shipments"
        id = Column(String, primary_key=True)
        tracking_number = Column(String, unique=True, nullable=False, index=True)
        order_id = Column(String, ForeignKey("orders.id"), nullable=False)
        courier = Column(String, nullable=False)
        shipment_status = Column(String, nullable=False, index=True)
        origin_hub = Column(String, nullable=True)
        destination_hub = Column(String, nullable=True)
        dispatch_date = Column(DateTime, nullable=True)
        estimated_delivery = Column(DateTime, nullable=True)
        actual_delivery = Column(DateTime, nullable=True)
        delivery_attempts = Column(Integer, default=1)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        order = relationship("Order", back_populates="shipment")

    class EventLog(Base):
        __tablename__ = "events"
        id = Column(Integer, primary_key=True, autoincrement=True)
        event_id = Column(String, unique=True, nullable=False)
        name = Column(String, nullable=False)
        event_type = Column(String, nullable=False, index=True)
        status = Column(String, nullable=False)
        duration_ms = Column(Float, default=0.0)
        source = Column(String, default="SYSTEM")
        payload_json = Column(Text, nullable=True)
        result_json = Column(Text, nullable=True)
        error = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow, index=True)

    class ImportJob(Base):
        __tablename__ = "import_jobs"
        id = Column(String, primary_key=True)
        filename = Column(String, nullable=False)
        file_size = Column(Integer, default=0)
        records_count = Column(Integer, default=0)
        success_count = Column(Integer, default=0)
        error_count = Column(Integer, default=0)
        status = Column(String, nullable=False)
        error_details = Column(Text, nullable=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        completed_at = Column(DateTime, nullable=True)
else:
    # Fallback placeholders when SQLAlchemy is not active
    User = None
    Platform = None
    Order = None
    OrderItem = None
    Shipment = None
    EventLog = None
    ImportJob = None
