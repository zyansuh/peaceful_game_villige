from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Graduation_interviews(Base):
    __tablename__ = "graduation_interviews"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    teacher_id = Column(Integer, nullable=False)
    teacher_name = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    answer1 = Column(String, nullable=False)
    answer2 = Column(String, nullable=False)
    answer3 = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)