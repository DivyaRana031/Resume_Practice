def split_into_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Split text into overlapping chunks for better context in RAG.

    Args:
        text: Cleaned text to split
        chunk_size: Max characters per chunk
        chunk_overlap: Overlap between consecutive chunks (for context continuity)

    Returns:
        List of text chunks
    """
    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        # If not at the end of text, try to break at a sentence/paragraph boundary
        if end < len(text):
            # Look for paragraph break first
            paragraph_break = text.rfind("\n\n", start, end)
            if paragraph_break > start + chunk_size // 2:
                end = paragraph_break

            # Otherwise try sentence break (. ! ?)
            else:
                for sep in [". ", "? ", "! ", "\n"]:
                    sentence_break = text.rfind(sep, start, end)
                    if sentence_break > start + chunk_size // 2:
                        end = sentence_break + len(sep)
                        break

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move forward with overlap
        start = end - chunk_overlap if end < len(text) else end

    return chunks
