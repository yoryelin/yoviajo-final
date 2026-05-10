from sqlalchemy import Column, Integer
from app.database import Base

class VisitCounter(Base):
    __tablename__ = "visit_counter"

    id = Column(Integer, primary_key=True, index=True)
    total_visits = Column(Integer, default=0)
