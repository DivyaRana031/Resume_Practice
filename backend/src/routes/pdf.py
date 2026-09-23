import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

# pyrefly: ignore [missing-import]
from src.pipeline.ingestion import ingest_document

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["pdf"])


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    logger.info(f"[upload-pdf] Received file: name={file.filename}, content_type={file.content_type}")
    try:
        result = await ingest_document(file)
        logger.info(f"[upload-pdf] Success: pages={result.get('pages')}")
        return {"message": f"PDF processed successfully ({result['pages']} pages)", **result}
    except Exception as e:
        logger.error(f"[upload-pdf] ERROR: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
