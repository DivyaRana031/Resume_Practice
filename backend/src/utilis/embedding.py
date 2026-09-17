from src.services.ingest import embeddings


def get_embedding(text: str) -> list[float]:
    """
    Embed a single text string.
    Used for: user queries at search time.
    """
    return embeddings.embed_query(text)


def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed multiple text strings in a batch.
    Used for: embedding document chunks during ingestion.
    """
    return embeddings.embed_documents(texts)