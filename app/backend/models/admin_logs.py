from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Admin_logs(Base):
    __tablename__ = "admin_logs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_name = Column(String, nullable=False)
    target_class = Column(String, nullable=True)
    details = Column(String, nullable=True)
    admin_email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)