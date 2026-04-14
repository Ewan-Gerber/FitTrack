from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

# --- Set ---
class SetBase(BaseModel):
    weight: float
    reps: int

class SetCreate(SetBase):
    pass

class SetOut(SetBase):
    id: int
    class Config:
        from_attributes = True

# --- Exercise ---
class ExerciseBase(BaseModel):
    name: str

class ExerciseCreate(ExerciseBase):
    sets: List[SetCreate]

class ExerciseOut(ExerciseBase):
    id: int
    sets: List[SetOut]
    class Config:
        from_attributes = True

# --- Workout ---
class WorkoutCreate(BaseModel):
    date: date
    split: str
    exercises: List[ExerciseCreate]

class WorkoutOut(BaseModel):
    id: int
    date: date
    split: str
    exercises: List[ExerciseOut]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Day ---
class DayCreate(BaseModel):
    date: date
    steps: int

class DayOut(BaseModel):
    id: int
    date: date
    steps: int
    class Config:
        from_attributes = True

# --- Auth ---
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Body Weight ---
class BodyWeightCreate(BaseModel):
    date: date
    weight: float

class BodyWeightOut(BaseModel):
    id: int
    date: date
    weight: float
    class Config:
        from_attributes = True

# --- Custom Exercise ---
class CustomExerciseCreate(BaseModel):
    name: str
    muscle_group: str

class CustomExerciseOut(BaseModel):
    id: int
    name: str
    muscle_group: str
    class Config:
        from_attributes = True