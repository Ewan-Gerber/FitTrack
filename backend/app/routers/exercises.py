from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.CustomExerciseOut])
def get_custom_exercises(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.CustomExercise).filter(
        models.CustomExercise.user_id == current_user.id
    ).all()

@router.post("/", response_model=schemas.CustomExerciseOut)
def add_custom_exercise(
    exercise: schemas.CustomExerciseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.CustomExercise).filter(
        models.CustomExercise.name == exercise.name,
        models.CustomExercise.muscle_group == exercise.muscle_group,
        models.CustomExercise.user_id == current_user.id
    ).first()
    if existing:
        return existing
    new_ex = models.CustomExercise(
        name=exercise.name,
        muscle_group=exercise.muscle_group,
        user_id=current_user.id
    )
    db.add(new_ex)
    db.commit()
    db.refresh(new_ex)
    return new_ex

@router.delete("/{exercise_id}")
def delete_custom_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    exercise = db.query(models.CustomExercise).filter(
        models.CustomExercise.id == exercise_id,
        models.CustomExercise.user_id == current_user.id
    ).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    db.delete(exercise)
    db.commit()
    return {"message": "Deleted"}