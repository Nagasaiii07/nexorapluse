"""Initial NEXUS schema migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-05-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='Admin'),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Platforms
    op.create_table(
        'platforms',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('code', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('is_active', sa.Integer(), server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Orders
    op.create_table(
        'orders',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('order_number', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('customer_email', sa.String(), nullable=True),
        sa.Column('platform', sa.String(), nullable=False, index=True),
        sa.Column('order_status', sa.String(), nullable=False, index=True),
        sa.Column('order_date', sa.DateTime(), nullable=False, index=True),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('items_count', sa.Integer(), server_default='1'),
        sa.Column('state', sa.String(), nullable=False, index=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('pincode', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Order Items
    op.create_table(
        'order_items',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('order_id', sa.String(), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sku', sa.String(), nullable=True),
        sa.Column('product_name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('quantity', sa.Integer(), server_default='1'),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.Column('total_price', sa.Float(), nullable=False)
    )

    # Shipments
    op.create_table(
        'shipments',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('tracking_number', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('order_id', sa.String(), sa.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False),
        sa.Column('courier', sa.String(), nullable=False),
        sa.Column('shipment_status', sa.String(), nullable=False, index=True),
        sa.Column('origin_hub', sa.String(), nullable=True),
        sa.Column('destination_hub', sa.String(), nullable=True),
        sa.Column('dispatch_date', sa.DateTime(), nullable=True),
        sa.Column('estimated_delivery', sa.DateTime(), nullable=True),
        sa.Column('actual_delivery', sa.DateTime(), nullable=True),
        sa.Column('delivery_attempts', sa.Integer(), server_default='1'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now())
    )

    # Events Log
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('event_id', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False, index=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('duration_ms', sa.Float(), server_default='0.0'),
        sa.Column('source', sa.String(), server_default='SYSTEM'),
        sa.Column('payload_json', sa.Text(), nullable=True),
        sa.Column('result_json', sa.Text(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), index=True)
    )

def downgrade() -> None:
    op.drop_table('events')
    op.drop_table('shipments')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('platforms')
    op.drop_table('users')

