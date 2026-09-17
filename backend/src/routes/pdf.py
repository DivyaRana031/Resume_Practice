from fastapi import APIRouter, File, UploadFile

# pyrefly: ignore [missing-import]
from src.pipeline.ingestion import ingest_document

router = APIRouter(prefix="/api", tags=["pdf"])


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    result = await ingest_document(file)
    return {"message": f"PDF processed successfully ({result['pages']} pages)", **result}
