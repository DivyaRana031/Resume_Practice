from fastapi import APIRouter
from pydantic import BaseModel

from src.pipeline.user_query import process_user_query

router = APIRouter(prefix="/api", tags=["query"])


class QueryRequest(BaseModel):
    query: str
    top_k: int = 3


@router.post("/query")
def handle_query(request: QueryRequest):
    result = process_user_query(request.query, top_k=request.top_k)
    return result
