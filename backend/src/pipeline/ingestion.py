import io
import os

from fastapi import UploadFile
from PyPDF2 import PdfReader

# from concurrent.futures import ThreadPoolExecutor
# from src.pipeline.extract_pdf_text import extract_pdf_text
# from src.pipeline.extract_ocr_text import extract_ocr_text
# from src.pipeline.extract_text import remove_duplicate_lines


from src.pipeline.extract_text import extract_text



# import fitz
# import requests
# from PIL import Image
# # import pytesseract
# from PIL import Image

OCR_API_KEY = os.getenv("OCR_SPACE_API_KEY")


from src.services.text_cleaner import clean_text
# from src.services.chunking import split_into_chunks   # Not needed right now
# from src.services.ingest import store_chunks          # Pinecone — not needed right now
from src.services.LLM import generate_topics


# def extract_pdf_text(pdf_bytes: bytes) -> str:
#     """Step 1: Extract raw text from PDF bytes."""
#     """
#     Run PyPDF2 and OCR independently in parallel.
#     """

#     reader = PdfReader(io.BytesIO(pdf_bytes))
#     text = []

#     for page in reader.pages:
#         page_text = page.extract_text() or ""
#         text.append(page_text)

#     return "\n".join(text)




# def extract_ocr_text(pdf_bytes: bytes) -> str:
#     """Extract text from PDF pages using OCR.space."""

#     if not OCR_API_KEY:
#         raise RuntimeError("OCR_SPACE_API_KEY is not configured")

#     pdf = fitz.open(stream=pdf_bytes, filetype="pdf")

#     ocr_text = []

#     try:
#         for page_number, page in enumerate(pdf):

#             print(f"[OCR] Processing page {page_number + 1}")

#             # Render PDF page as PNG
#             pix = page.get_pixmap(
#                 dpi=200,
#                 alpha=False
#             )

#             image_bytes = pix.tobytes("png")

#             # Send image to OCR.space
#             response = requests.post(
#                 "https://api.ocr.space/parse/image",
#                 files={
#                     "file": (
#                         f"page_{page_number + 1}.png",
#                         image_bytes,
#                         "image/png"
#                     )
#                 },
#                 data={
#                     "apikey": OCR_API_KEY,
#                     "language": "eng",
#                     "isOverlayRequired": "false",
#                     "OCREngine": "2",
#                 },
#                 timeout=60,
#             )

#             print(
#                 f"[OCR] Page {page_number + 1} "
#                 f"status={response.status_code}"
#             )

#             # Don't hide OCR.space's actual error
#             if response.status_code != 200:
#                 print(
#                     f"[OCR] API error: {response.text}"
#                 )
#                 continue

#             result = response.json()

#             if result.get("IsErroredOnProcessing"):
#                 print(
#                     f"[OCR] Processing error: "
#                     f"{result.get('ErrorMessage')}"
#                 )
#                 continue

#             parsed_results = result.get("ParsedResults", [])

#             if not parsed_results:
#                 print(
#                     f"[OCR] No parsed result for "
#                     f"page {page_number + 1}"
#                 )
#                 continue

#             text = parsed_results[0].get(
#                 "ParsedText",
#                 ""
#             )

#             if text.strip():
#                 ocr_text.append(
#                     f"[OCR Page {page_number + 1}]\n{text}"
#                 )

#     finally:
#         pdf.close()

#     return "\n\n".join(ocr_text)


# def remove_duplicate_lines(text: str) -> str:
#     seen = set()
#     unique_lines = []

#     for line in text.splitlines():
#         line = line.strip()

#         if not line:
#             continue

#         normalized = line.lower()

#         if normalized not in seen:
#             seen.add(normalized)
#             unique_lines.append(line)

#     return "\n".join(unique_lines)



# def extract_text(pdf_bytes: bytes) -> str:
#     """
#     Run PyPDF2 and OCR independently in parallel.
#     """

#     with ThreadPoolExecutor(max_workers=2) as executor:

#         pdf_future = executor.submit(
#             extract_pdf_text,
#             pdf_bytes
#         )

#         ocr_future = executor.submit(
#             extract_ocr_text,
#             pdf_bytes
#         )

#         pdf_text = pdf_future.result()
#         ocr_text = ocr_future.result()

#     combined_text = f"""
# {pdf_text}

# {ocr_text}
# """.strip()
#     final_text = remove_duplicate_lines(combined_text)

#     return final_text



async def ingest_document(file: UploadFile) -> dict:
    """
    Simplified pipeline: PDF → Extract → Clean → LLM (topics only)
    Chunking and Pinecone storage are commented out — not needed right now.
    """
    pdf_bytes = await file.read()

    # Step 1: Extract
    raw_text = extract_text(pdf_bytes)
    print(f"[Pipeline] Extracted {len(raw_text)} chars from {file.filename}")

    # Step 2: Clean
    cleaned_text = clean_text(raw_text)
    print(f"[Pipeline] Cleaned text: {len(cleaned_text)} chars")
    if not cleaned_text:
        raise ValueError("The uploaded PDF contains no extractable text")

    # Step 3: Generate topics via LLM
    topics = generate_topics(cleaned_text)
    print(f"[Pipeline] Generated {len(topics)} speaking topics")

    # --- COMMENTED OUT: Chunking + Pinecone storage (not needed right now) ---
    # chunks = split_into_chunks(cleaned_text)
    # print(f"[Pipeline] Split into {len(chunks)} chunks")
    # documents = _chunks_to_documents(chunks)
    # store_chunks(documents)
    # print(f"[Pipeline] Stored {len(documents)} chunks in Pinecone")
    # -------------------------------------------------------------------------

    return {
        "filename": file.filename,
        "pages": len(PdfReader(io.BytesIO(pdf_bytes)).pages),
        "topics": topics,
    }


# --- COMMENTED OUT: Not needed without Pinecone ---
# def _chunks_to_documents(chunks: list[str]):
#     """Convert plain text chunks to LangChain Document objects."""
#     from langchain_core.documents import Document
#     return [
#         Document(page_content=chunk, metadata={"chunk_index": i})
#         for i, chunk in enumerate(chunks)
#     ]