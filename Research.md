                RAG
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
 Embedding Model        LLM
       │                   │
       ↓                   ↓
Text → Vector          Context + Question
                           ↓
                        Answer



                 Retrieved Evidence
                       ↓
                  ┌────┴────┐
                  ↓         ↓
             Clinician    Patient
                Mode        Mode
                  ↓         ↓
             Technical    Simple
              answer      answer


PDF ✅
 ↓
Text Extraction ✅
 ↓
Clean Text ✅
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Database
 ↓
User Question
 ↓
Question Embedding
 ↓
Similarity Search
 ↓
Relevant Chunks
 ↓
Prompt + Context
 ↓
LLM
 ↓
Answer



source venv/bin/activate && uvicorn src.main:app --reload --port 8000