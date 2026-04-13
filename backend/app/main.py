from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import days, workouts, auth, bodyweight

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(days.router, prefix="/days", tags=["days"])
app.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
app.include_router(bodyweight.router, prefix="/bodyweight", tags=["bodyweight"])

@app.get("/")
def root():
    return {"message": "FitTrack API is running"}