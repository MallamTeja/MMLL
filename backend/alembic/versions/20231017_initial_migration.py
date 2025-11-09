"""Initial migration

Revision ID: 20231017_initial
Revises: 
Create Date: 2023-10-17 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20231017_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types first
    user_role = sa.Enum('admin', 'engineer', 'operator', 'viewer', name='userrole')
    user_role.create(op.get_bind(), checkfirst=True)
    
    maintenance_status = sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled', name='maintenancestatus')
    maintenance_status.create(op.get_bind(), checkfirst=True)
    
    maintenance_type = sa.Enum('preventive', 'corrective', 'predictive', 'scheduled', 'emergency', name='maintenancetype')
    maintenance_type.create(op.get_bind(), checkfirst=True)
    
    # Create tables
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True, index=True),
        sa.Column('username', sa.String(length=100), nullable=False, unique=True, index=True),
        sa.Column('full_name', sa.String(length=200), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'engineer', 'operator', 'viewer', name='userrole'), nullable=False, server_default='viewer'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'machines',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('name', sa.String(length=200), nullable=False, unique=True, index=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='operational'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('manufacturer', sa.String(length=200), nullable=True),
        sa.Column('model', sa.String(length=100), nullable=True),
        sa.Column('serial_number', sa.String(length=100), nullable=True, unique=True),
        sa.Column('installation_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_maintenance_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_maintenance_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('operating_hours', sa.Float(), nullable=False, server_default='0'),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'sensor_data',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('machine_id', sa.Integer(), nullable=False, index=True),
        sa.Column('sensor_type', sa.String(length=100), nullable=False, index=True),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False, index=True, server_default=sa.text('now()')),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['machine_id'], ['machines.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'maintenance_schedule',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('machine_id', sa.Integer(), nullable=False, index=True),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled', name='maintenancestatus'), nullable=False, server_default='scheduled'),
        sa.Column('maintenance_type', sa.Enum('preventive', 'corrective', 'predictive', 'scheduled', 'emergency', name='maintenancetype'), nullable=False, server_default='preventive'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['machine_id'], ['machines.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'maintenance_tasks',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('schedule_id', sa.Integer(), nullable=False, index=True),
        sa.Column('technician_id', sa.Integer(), nullable=True, index=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled', name='maintenancestatus'), nullable=False, server_default='scheduled'),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['schedule_id'], ['maintenance_schedule.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['technician_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('machine_id', sa.Integer(), nullable=False, index=True),
        sa.Column('sensor_data_id', sa.Integer(), nullable=True, index=True),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.Enum('low', 'medium', 'high', 'critical', name='alertseverity'), nullable=False, server_default='medium'),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.Integer(), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['machine_id'], ['machines.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['sensor_data_id'], ['sensor_data.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table(
        'predictions',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('machine_id', sa.Integer(), nullable=False, index=True),
        sa.Column('model_version', sa.String(length=100), nullable=False),
        sa.Column('prediction_type', sa.String(length=100), nullable=False),
        sa.Column('prediction_value', sa.Float(), nullable=True),
        sa.Column('prediction_confidence', sa.Float(), nullable=True),
        sa.Column('features', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['machine_id'], ['machines.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_sensor_data_machine_timestamp', 'sensor_data', ['machine_id', 'timestamp'])
    op.create_index('idx_sensor_data_sensor_type_timestamp', 'sensor_data', ['sensor_type', 'timestamp'])
    op.create_index('idx_alerts_machine_created', 'alerts', ['machine_id', 'created_at'])
    op.create_index('idx_alerts_severity_created', 'alerts', ['severity', 'created_at'])
    op.create_index('idx_predictions_machine_created', 'predictions', ['machine_id', 'created_at'])
    
    # Create admin user
    from app.core.security import get_password_hash
    from sqlalchemy.sql import table, column
    from sqlalchemy import String, Boolean, DateTime
    
    users = table(
        'users',
        column('email', String),
        column('username', String),
        column('full_name', String),
        column('hashed_password', String),
        column('role', String),
        column('is_active', Boolean),
        column('created_at', DateTime)
    )
    
    op.bulk_insert(
        users,
        [
            {
                'email': 'admin@example.com',
                'username': 'admin',
                'full_name': 'Administrator',
                'hashed_password': get_password_hash('admin123'),
                'role': 'admin',
                'is_active': True,
                'created_at': sa.func.now()
            }
        ]
    )

def downgrade():
    # Drop tables in reverse order of creation
    op.drop_table('predictions')
    op.drop_table('alerts')
    op.drop_table('maintenance_tasks')
    op.drop_table('maintenance_schedule')
    op.drop_table('sensor_data')
    op.drop_table('machines')
    op.drop_table('users')
    
    # Drop enum types
    sa.Enum(name='alertseverity').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='maintenancestatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='maintenancetype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
