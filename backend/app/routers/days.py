from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.DayOut)
def upsert_day(
    day: schemas.DayCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.Day).filter(
        models.Day.date == day.date,
        models.Day.user_id == current_user.id
    ).first()
    if existing:
        existing.steps = day.steps
        db.commit()
        db.refresh(existing)
        return existing
    new_day = models.Day(date=day.date, steps=day.steps, user_id=current_user.id)
    db.add(new_day)
    db.commit()
    db.refresh(new_day)
    return new_day

@router.get("/", response_model=List[schemas.DayOut])
def get_days(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Day).filter(
        models.Day.user_id == current_user.id
    ).order_by(models.Day.date.desc()).all()