from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.stats import VisitCounter
from app.models.review import Review
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/public", tags=["public"])

class ExperienceResponse(BaseModel):
    id: int
    reviewer_name: str
    rating: int
    comment: str

    class Config:
        from_attributes = True

@router.post("/visit")
def record_visit(db: Session = Depends(get_db)):
    """
    Incrementa el contador de visitas público.
    """
    counter = db.query(VisitCounter).first()
    if not counter:
        counter = VisitCounter(total_visits=1)
        db.add(counter)
    else:
        counter.total_visits += 1
    db.commit()
    return {"status": "ok", "total_visits": counter.total_visits}

@router.get("/experiences", response_model=List[ExperienceResponse])
def get_public_experiences(db: Session = Depends(get_db)):
    """
    Obtiene reseñas públicas de 4 o 5 estrellas que contengan un comentario.
    Limitado a 6 reseñas para la landing page.
    """
    reviews = (
        db.query(Review)
        .options(joinedload(Review.reviewer))
        .filter(Review.rating >= 4)
        .filter(Review.comment != None)
        .filter(Review.comment != "")
        .order_by(Review.created_at.desc())
        .limit(6)
        .all()
    )

    result = []
    for r in reviews:
        # Extraer solo el primer nombre para privacidad
        first_name = r.reviewer.name.split(" ")[0] if r.reviewer and r.reviewer.name else "Usuario"
        result.append({
            "id": r.id,
            "reviewer_name": first_name,
            "rating": r.rating,
            "comment": r.comment
        })
        
    return result
