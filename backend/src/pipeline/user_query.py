from src.services.ingest import get_vectorstore
from src.services.LLM import generate_answer


def search_similar_chunks(
    query: str,
    top_k: int = 3
) -> list[dict]:
    """
    Search Pinecone for the most relevant chunks.
    """

    vs = get_vectorstore()

    results = vs.similarity_search_with_score(
        query,
        k=top_k
    )

    retrieved_chunks = []

    for doc, score in results:

        retrieved_chunks.append({
            "content": doc.page_content,
            "score": float(score),
            "metadata": doc.metadata
        })

    return retrieved_chunks


def build_context(
    chunks: list[dict]
) -> str:
    """
    Combine retrieved chunks into a single context.
    """

    return "\n\n---\n\n".join(
        chunk["content"]
        for chunk in chunks
    )


def process_user_query(
    query: str,
    top_k: int = 3
) -> dict:
    """
    Complete RAG query pipeline:

    User Query
        ↓
    Query Embedding
        ↓
    Pinecone Similarity Search
        ↓
    Relevant Chunks
        ↓
    Context
        ↓
    Groq LLM
        ↓
    Answer
    """

    # --------------------------------------------------
    # Validate query
    # --------------------------------------------------

    if not query or not query.strip():

        return {
            "query": query,
            "answer": "",
            "context": "",
            "retrieved_count": 0,
            "chunks": [],
            "error": "Query string cannot be empty"
        }


    # --------------------------------------------------
    # Step 1: Retrieve relevant chunks
    # --------------------------------------------------

    chunks = search_similar_chunks(
        query=query,
        top_k=top_k
    )

    print(
        f"[Query Pipeline] Retrieved "
        f"{len(chunks)} chunks"
    )


    # --------------------------------------------------
    # Step 2: Build context
    # --------------------------------------------------

    context = build_context(chunks)

    print(
        f"[Query Pipeline] Context created "
        f"({len(context)} characters)"
    )


    # --------------------------------------------------
    # Step 3: Generate answer using Groq
    # --------------------------------------------------

    answer = generate_answer(
        query=query,
        context=context
    )

    print(
        "[Query Pipeline] LLM generated answer"
    )


    # --------------------------------------------------
    # Step 4: Return result
    # --------------------------------------------------

    return {
        "query": query,
        "answer": answer,
        "context": context,
        "retrieved_count": len(chunks),
        "chunks": chunks
    }