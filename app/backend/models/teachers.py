from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Teachers(Base):
    __tablename__ = "teachers"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    game_category = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    nickname = Column(String, nullable=False)
    intro = Column(String, nullable=True)
    detail_intro = Column(String, nullable=True)
    tier = Column(String, nullable=True)
    active_time = Column(String, nullable=True)
    personality = Column(String, nullable=True)
    teaching_style = Column(String, nullable=True)
    position = Column(String, nullable=True)
    message = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    max_students = Column(Integer, nullable=False)
    current_students = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)