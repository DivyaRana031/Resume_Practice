from src.services.text_cleaner import clean_text

from src.services.LLM import generate_topics
from src.pipeline.extract_pdf_text import extract_pdf_text
from src.pipeline.extract_ocr_text import extract_ocr_text
from src.pipeline.remove_duplicate_lines import remove_duplicate_lines


def extract_text(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF.
    OCR is used only when normal extraction is insufficient.
    Failure of OCR should not break normal PDF extraction.
    """

    pdf_text = ""

    # -------------------------
    # 1. Normal PDF extraction
    # -------------------------
    try:
        pdf_text = extract_pdf_text(pdf_bytes)

        print(
            f"[PDF] Extracted {len(pdf_text)} characters"
        )

    except Exception as e:
        print(f"[PDF] Extraction failed: {e}")

    # -------------------------
    # 2. Decide whether OCR is needed
    # -------------------------
    if len(pdf_text.strip()) >= 100:
        print("[OCR] Skipping OCR - enough text extracted")

        return remove_duplicate_lines(pdf_text)

    # -------------------------
    # 3. OCR fallback
    # -------------------------
    print("[OCR] Normal text insufficient. Trying OCR...")

    ocr_text = ""

    try:
        ocr_text = extract_ocr_text(pdf_bytes)

        print(
            f"[OCR] Extracted {len(ocr_text)} characters"
        )

    except Exception as e:
        print(f"[OCR] Extraction failed: {e}")

    # -------------------------
    # 4. Choose whatever worked
    # -------------------------
    if pdf_text.strip() and ocr_text.strip():

        combined_text = f"""
{pdf_text}

{ocr_text}
""".strip()

        return remove_duplicate_lines(combined_text)

    if pdf_text.strip():
        print("[Pipeline] Using PDF text")
        return remove_duplicate_lines(pdf_text)

    if ocr_text.strip():
        print("[Pipeline] Using OCR text")
        return remove_duplicate_lines(ocr_text)

    # -------------------------
    # 5. Both failed
    # -------------------------
    raise ValueError(
        "Could not extract any text from the PDF."
    )