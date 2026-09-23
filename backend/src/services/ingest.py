from dotenv import load_dotenv
import os

from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec


# --------------------------------------------------
# 1. Load environment variables
# --------------------------------------------------

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

INDEX_NAME = "medicine-rag"

# --------------------------------------------------
# 2. Hugging Face Embedding Model (Lazy Loaded)
# --------------------------------------------------

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/all-MiniLM-L6-v2",
            huggingfacehub_api_token=HF_TOKEN
        )
    return _embeddings


class EmbeddingProxy:
    def embed_query(self, text: str):
        return get_embeddings().embed_query(text)
    def embed_documents(self, texts: list[str]):
        return get_embeddings().embed_documents(texts)


embeddings = EmbeddingProxy()


# --------------------------------------------------
# 3. Vector Store Initialization (Lazy Loaded)
# --------------------------------------------------

_vectorstore = None
_index = None

def get_index():
    global _index
    if _index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Check if index exists, create if missing
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        if INDEX_NAME not in existing_indexes:
            print(f"[Pinecone] Index '{INDEX_NAME}' not found. Creating index...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=384,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        
        _index = pc.Index(INDEX_NAME)
    return _index


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = PineconeVectorStore(
            index=get_index(),
            embedding=get_embeddings()
        )
    return _vectorstore


# --------------------------------------------------
# 4. Add chunks
# --------------------------------------------------

def store_chunks(chunks):
    vs = get_vectorstore()
    vs.add_documents(chunks)
    print("Chunks successfully embedded and stored in Pinecone.")