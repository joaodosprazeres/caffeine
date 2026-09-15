from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.api.routers import auth, cafes, opinioes, ranking, usuarios
from src.core.config import get_settings

app = FastAPI(title="Caffeine API", version="1.0.0")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

uploads_path = Path(settings.uploads_dir)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/api/media", StaticFiles(directory=uploads_path), name="media")

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(opinioes.router)
api_router.include_router(cafes.router)
api_router.include_router(ranking.router)
api_router.include_router(usuarios.router)

app.include_router(api_router)
