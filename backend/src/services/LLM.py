from functools import lru_cache

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

import os
from dotenv import load_dotenv


load_dotenv()


# --------------------------------------------------
# Get Groq LLM
# --------------------------------------------------

@lru_cache(maxsize=1)
def get_llm() -> ChatGroq:
    """
    Create and cache the Groq LLM instance.
    """

    return ChatGroq(
        model="qwen/qwen3.8-27b",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY"),
    )


# --------------------------------------------------
# Prompt
# --------------------------------------------------

PROMPT = ChatPromptTemplate.from_template(
    """
You are a medical information assistant.

Answer the user's question using the provided context.

Rules:
- Use the provided context as the primary source.
- Do not invent medical information that is not supported by the context.
- If the answer cannot be found in the context, clearly say that the information is not available in the provided documents.
- Give a clear and concise answer.
- This is general medical information, not a diagnosis or personalized medical advice.

Context:
{context}

User Question:
{query}

Answer:
"""
)


# --------------------------------------------------
# Generate Answer
# --------------------------------------------------

def generate_answer(
    query: str,
    context: str
) -> str:
    """
    Generate an answer using Groq LLM.

    Args:
        query: User's question.
        context: Relevant chunks retrieved from Pinecone.

    Returns:
        Generated answer as a string.
    """

    llm = get_llm()

    prompt = PROMPT.format(
        context=context,
        query=query
    )

    response = llm.invoke(prompt)

    return response.content