
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.pdf import router as pdf_router
from src.routes.query import router as query_router

load_dotenv()

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router)
app.include_router(query_router)

