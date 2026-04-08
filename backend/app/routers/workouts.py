from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.WorkoutOut)
def create_workout(
    workout: schemas.WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_workout = models.Workout(date=workout.date, split=workout.split, user_id=current_user.id)
    db.add(new_workout)
    db.flush()

    for ex in workout.exercises:
        new_ex = models.Exercise(name=ex.name, workout_id=new_workout.id)
        db.add(new_ex)
        db.flush()
        for s in ex.sets:
            new_set = models.Set(weight=s.weight, reps=s.reps, exercise_id=new_ex.id)
            db.add(new_set)

    db.commit()
    db.refresh(new_workout)
    return new_workout

@router.get("/", response_model=List[schemas.WorkoutOut])
def get_workouts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.date.desc()).all()

@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id,
        models.Workout.user_id == current_user.id
    ).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    db.delete(workout)
    db.commit()
    return {"message": "Deleted"}