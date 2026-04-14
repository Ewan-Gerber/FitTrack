from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import days, workouts, auth, bodyweight, exercises
import os

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
app.include_router(exercises.router, prefix="/exercises", tags=["exercises"])

frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")

if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_path, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "FitTrack API is running"}