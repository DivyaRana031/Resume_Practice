
import os

import pymupdf
import requests

OCR_API_KEY = os.getenv("OCR_SPACE_API_KEY")


def extract_ocr_text(pdf_bytes: bytes) -> str:
    """Extract text from PDF pages using OCR.space."""

    if not OCR_API_KEY:
        raise RuntimeError("OCR_SPACE_API_KEY is not configured")

    pdf = pymupdf.open(stream=pdf_bytes, filetype="pdf")

    ocr_text = []

    try:
        for page_number, page in enumerate(pdf):

            print(f"[OCR] Processing page {page_number + 1}")

            # Render PDF page as PNG
            pix = page.get_pixmap(
                dpi=200,
                alpha=False
            )

            image_bytes = pix.tobytes("png")

            # Send image to OCR.space
            response = requests.post(
                "https://api.ocr.space/parse/image",
                files={
                    "file": (
                        f"page_{page_number + 1}.png",
                        image_bytes,
                        "image/png"
                    )
                },
                data={
                    "apikey": OCR_API_KEY,
                    "language": "eng",
                    "isOverlayRequired": "false",
                    "OCREngine": "2",
                },
                timeout=60,
            )

            print(
                f"[OCR] Page {page_number + 1} "
                f"status={response.status_code}"
            )

            # Don't hide OCR.space's actual error
            if response.status_code != 200:
                print(
                    f"[OCR] API error: {response.text}"
                )
                continue

            result = response.json()

            if result.get("IsErroredOnProcessing"):
                print(
                    f"[OCR] Processing error: "
                    f"{result.get('ErrorMessage')}"
                )
                continue

            parsed_results = result.get("ParsedResults", [])

            if not parsed_results:
                print(
                    f"[OCR] No parsed result for "
                    f"page {page_number + 1}"
                )
                continue

            text = parsed_results[0].get(
                "ParsedText",
                ""
            )

            if text.strip():
                ocr_text.append(
                    f"[OCR Page {page_number + 1}]\n{text}"
                )

    finally:
        pdf.close()

    return "\n\n".join(ocr_text)