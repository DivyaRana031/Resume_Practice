import re


def clean_text(raw_text: str) -> str:
    """
    Clean extracted PDF text:
    1. Normalize line endings (\r\n -> \n)
    2. Fix hyphenated line breaks (e.g., "knowl-\nedge" -> "knowledge")
    3. Remove non-printable / control characters
    4. Merge single line-wrapped newlines (\n) inside sentences into spaces
    5. Preserve real paragraph breaks (\n\n)
    6. Normalize multiple spaces
    """
    if not raw_text:
        return ""

    text = raw_text

    # 1. Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # 2. Fix hyphenated line breaks ("knowl-\nedge" -> "knowledge")
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)

    # 3. Remove control/non-printable chars (keep standard spaces and newlines)
    text = re.sub(r"[^\S\n]+", " ", text)

    # 4. Normalize paragraph breaks to double newlines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # 5. Split by paragraph breaks, then merge single line-wrapped newlines in each paragraph
    paragraphs = text.split("\n\n")
    cleaned_paragraphs = []

    for para in paragraphs:
        # Split paragraph into lines and strip whitespace from line edges
        lines = [line.strip() for line in para.split("\n") if line.strip()]
        # Join lines inside paragraph with spaces
        cleaned_para = " ".join(lines)
        if cleaned_para:
            cleaned_paragraphs.append(cleaned_para)

    # 6. Rejoin paragraphs with double newlines
    final_text = "\n\n".join(cleaned_paragraphs)

    # 7. Remove any remaining multiple spaces
    final_text = re.sub(r" {2,}", " ", final_text)

    return final_text.strip()

