from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.pdf import router as pdf_router
from src.routes.query import router as query_router

app = FastAPI()

# Allow frontend (Vite dev server) to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/hello")
def hello():
    return {"message": "Hello from backend"}


# Include route files
app.include_router(pdf_router)
app.include_router(query_router)

