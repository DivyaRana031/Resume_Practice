import io

from fastapi import UploadFile
from PyPDF2 import PdfReader

from src.services.text_cleaner import clean_text
from src.services.chunking import split_into_chunks
from src.services.ingest import store_chunks


def extract_text(pdf_bytes: bytes) -> str:
    """Step 1: Extract raw text from PDF bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    raw_text = ""
    for page in reader.pages:
        raw_text += page.extract_text() or ""
    return raw_text


async def ingest_document(file: UploadFile) -> dict:
    """
    Full ingestion pipeline — one call does everything:
    PDF → Extract → Clean → Chunk → Embed & Store
    """
    pdf_bytes = await file.read()

    # Step 1: Extract
    raw_text = extract_text(pdf_bytes)
    print(f"[Pipeline] Extracted {len(raw_text)} chars from {file.filename}")

    # Step 2: Clean
    cleaned_text = clean_text(raw_text)
    print(f"[Pipeline] Cleaned text: {len(cleaned_text)} chars")

    # Step 3: Chunk
    chunks = split_into_chunks(cleaned_text)
    print(f"[Pipeline] Split into {len(chunks)} chunks")


    # Step 5: Store in Pinecone
    documents = _chunks_to_documents(chunks)
    store_chunks(documents)
    print(f"[Pipeline] Stored {len(documents)} chunks in Pinecone")

    return {
        "filename": file.filename,
        "pages": len(PdfReader(io.BytesIO(pdf_bytes)).pages),
        "raw_length": len(raw_text),
        "cleaned_length": len(cleaned_text),
        "chunks": len(chunks),
        "stored": len(documents),
    }


def _chunks_to_documents(chunks: list[str]):
    """Convert plain text chunks to LangChain Document objects."""
    from langchain_core.documents import Document
    return [
        Document(page_content=chunk, metadata={"chunk_index": i})
        for i, chunk in enumerate(chunks)
    ]