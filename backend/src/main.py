import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables before importing modules that read them at import time.
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)

from src.routes.pdf import router as pdf_router
# from src.routes.query import router as query_router

app = FastAPI()

# --- CORS Setup ---
frontend_url = os.getenv("FRONTEND_URL", "")
logger.info(f"[CORS] FRONTEND_URL env var = '{frontend_url}'")

# Hardcode both prod + local origins — FRONTEND_URL is optional bonus
allowed_origins = [
    "http://localhost:5173",
    "https://resume-practice-one.vercel.app",
]
if frontend_url:
    for origin in frontend_url.split(","):
        o = origin.strip()
        if o and o not in allowed_origins:
            allowed_origins.append(o)

logger.info(f"[CORS] Final allowed_origins = {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    origin = request.headers.get("origin", "<no-origin>")
    logger.info(f"[REQUEST] {request.method} {request.url.path} | Origin: {origin}")
    response = await call_next(request)
    logger.info(f"[RESPONSE] status={response.status_code}")
    return response


app.include_router(pdf_router)
# app.include_router(query_router)
