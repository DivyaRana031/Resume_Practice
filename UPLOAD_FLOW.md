# PDF Upload Flow

This document explains what happens when a user uploads a PDF in the current project.

## Main Request

The frontend sends the selected PDF to:

```http
POST http://localhost:8000/api/upload-pdf
Content-Type: multipart/form-data
```

The file is sent in a form field named `file`.

The endpoint is implemented in `backend/src/routes/pdf.py` and calls:

```python
await ingest_document(file)
```

## Backend Processing Pipeline

The upload is processed in `backend/src/pipeline/ingestion.py`.

```text
PDF upload
   |
   v
Read PDF bytes
   |
   v
Extract text with PyPDF2
   |
   v
Clean extracted text
   |
   +--> Generate speaking topics with the LLM
   |        |
   |        +--> Return topics in the upload response
   |
   v
Split cleaned text into chunks
   |
   v
Embed chunks with Hugging Face
   |
   v
Store chunks in Pinecone
```

## Step 1: Read the PDF

`ingest_document()` reads the uploaded file into memory:

```python
pdf_bytes = await file.read()
```

`PyPDF2.PdfReader` then extracts text from every page. If a PDF has no extractable text, the pipeline raises:

```text
The uploaded PDF contains no extractable text
```

Scanned PDFs that contain only images may need OCR before they can be processed.

## Step 2: Clean the Text

The extracted text is passed to `clean_text()` in `backend/src/services/text_cleaner.py`.

The cleaner:

- Normalizes line endings.
- Joins words split across lines.
- Removes control characters.
- Preserves paragraph breaks.
- Removes extra spaces.

The cleaned text is used for both topic generation and RAG chunking.

## Step 3: Generate Speaking Topics

The cleaned document is sent once to `generate_topics()` in `backend/src/services/LLM.py`.

The prompt instructs the LLM to:

- Use only information explicitly present in the uploaded document.
- Avoid inventing projects, skills, or achievements.
- Return between 30 and 50 topics.
- Return JSON with a title, category, difficulty, description, and follow-up questions.

The response is parsed and validated before it is stored. If the LLM returns invalid JSON or the wrong number of topics, the upload fails rather than storing invalid data.

The generated topics are returned directly in the upload response. They are not stored in a separate topic namespace. The frontend keeps the returned list in memory and selects a random topic locally.

## Step 4: Chunk and Store RAG Text

The cleaned text is divided into overlapping chunks by `split_into_chunks()` in `backend/src/services/chunking.py`.

Current chunk settings are:

```text
Chunk size: 1000 characters
Overlap: 200 characters
```

The chunks are converted into LangChain `Document` objects and stored through `store_chunks()` in `backend/src/services/ingest.py`.

This preserves the existing RAG flow. When a user later asks a question, the backend searches these stored chunks, builds context, and sends that context to the LLM for an answer.

## Upload Response

After successful processing, the upload endpoint returns information such as:

```json
{
  "message": "PDF processed successfully (3 pages)",
  "filename": "resume.pdf",
  "pages": 3,
  "raw_length": 8420,
  "cleaned_length": 7900,
  "chunks": 10,
  "stored": 10,
   "topics": [
      {
         "title": "Explain your project",
         "category": "Project",
         "difficulty": "Medium",
         "description": "Discuss the project described in the document.",
         "followUpQuestions": ["What was your role?"]
      }
   ]
}
```

## Frontend Requests After Upload

The frontend reads `topics` directly from the upload response, logs them in the browser console, and displays them in the practice panel.

## Random Topic Behavior

There is no backend random-topic endpoint. The frontend selects a random topic from its local `topics` array using `Math.random()`.

This does not call the LLM or Pinecone again.

## Required Environment Variables

The backend loads credentials from `backend/.env`:

```env
PINECONE_API_KEY=your_pinecone_key
HF_TOKEN=your_huggingface_token
GROQ_API_KEY=your_groq_key
```

The keys must be valid before uploading a PDF. Pinecone is used for vector storage, Hugging Face is used for embeddings, and Groq is used for topic generation and RAG answers.

## Running the Flow

Start the backend:

```bash
cd backend
source venv/bin/activate
python -m uvicorn src.main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Then select a PDF in the browser and click **Send PDF**.

## Common Errors

### Pinecone `401 Invalid API key`

The `PINECONE_API_KEY` in `backend/.env` is invalid, expired, or revoked. Replace it with a valid key and restart the backend.

### Groq `401 Invalid API key`

The `GROQ_API_KEY` is invalid, expired, or revoked. Replace it with a valid key and restart the backend.

### Groq `429 Request too large`

The topic response is larger than the account's output-token limit. Reduce the requested topic response size, use a model/plan with a higher limit, or generate fewer/shorter fields while preserving the document-grounding requirement.
