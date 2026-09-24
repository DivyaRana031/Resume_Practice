import io

from PyPDF2 import PdfReader

def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Step 1: Extract raw text from PDF bytes."""
    """
    Run PyPDF2 and OCR independently in parallel.
    """

    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        text.append(page_text)

    return "\n".join(text)