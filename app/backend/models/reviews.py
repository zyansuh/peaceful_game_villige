from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Reviews(Base):
    __tablename__ = "reviews"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    teacher_id = Column(String, nullable=False)
    teacher_name = Column(String, nullable=True)
    class_name = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    nickname = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)