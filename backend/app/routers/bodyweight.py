from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.BodyWeightOut)
def log_weight(
    entry: schemas.BodyWeightCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.BodyWeight).filter(
        models.BodyWeight.date == entry.date,
        models.BodyWeight.user_id == current_user.id
    ).first()
    if existing:
        existing.weight = entry.weight
        db.commit()
        db.refresh(existing)
        return existing
    new_entry = models.BodyWeight(date=entry.date, weight=entry.weight, user_id=current_user.id)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.get("/", response_model=List[schemas.BodyWeightOut])
def get_weights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.BodyWeight).filter(
        models.BodyWeight.user_id == current_user.id
    ).order_by(models.BodyWeight.date.desc()).all()