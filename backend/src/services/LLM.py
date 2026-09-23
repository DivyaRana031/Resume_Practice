from functools import lru_cache
import json
import re

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

TOPICS_PROMPT = ChatPromptTemplate.from_template(
    """
You are an expert interview coach and English speaking practice assistant.

Your task is to deeply understand the candidate's resume/document and generate
interesting, thought-provoking speaking topics based ONLY on information
explicitly present in the document.

IMPORTANT:
- Do NOT invent technologies, responsibilities, achievements, projects, or experiences.
- Do NOT assume things that are not explicitly mentioned.
- Every topic must have a clear connection to something present in the resume.
- Topics should feel like realistic interview or professional speaking questions,
  not generic questions.
- The user should need to THINK before answering.
- Avoid questions that can be answered with a simple "yes/no" or one short sentence.
- Encourage the user to explain, compare, justify, analyze, or reflect on something.
- Topics should help the user practice both English communication and explaining
  their own resume confidently.

TOPIC QUALITY:

Each topic should usually combine 2-3 of these elements:

1. Explanation
   Ask the user to explain something they actually worked on.

2. Reasoning
   Ask WHY they chose an approach, technology, architecture, or solution.

3. Problem solving
   Ask about a challenge, limitation, trade-off, or problem related to their work.

4. Comparison
   Ask them to compare their chosen approach with a reasonable alternative,
   but only when the resume provides enough context.

5. Reflection
   Ask what they would improve, change, or do differently today.

6. Real-world scenario
   Put their resume experience into a realistic professional situation and
   ask how they would respond.

7. Communication
   Require the user to explain a technical concept in a way that another person
   could understand.

The topic should be substantial enough to make the user speak for roughly
1-2 minutes.

Do NOT make the topic unnecessarily long.
Aim for approximately 20-40 words for the main topic.

The follow-up question should naturally continue the same discussion and push
the user slightly deeper.

DIFFICULTY:

Easy:
- Mainly explanation and familiarity.
- Suitable for warming up.

Medium:
- Requires reasoning, examples, or explaining decisions.
- Should make the user think before answering.

Hard:
- Requires deeper reasoning, trade-offs, problem solving, comparison,
  or reflection.
- Should feel similar to a challenging interview discussion.

Generate a balanced mixture of difficulties.

CATEGORIES:
Project | Skill | Experience | Education | Other

OUTPUT:

Return ONLY valid JSON.

Use exactly this structure:

{{
    "topics": [
        {{
            "title": "...",
            "category": "Project|Skill|Experience|Education|Other",
            "difficulty": "Easy|Medium|Hard",
            "description": "...",
            "followUpQuestions": [
                "...",
                "..."
            ]
        }}
    ]
}}

RULES FOR EACH FIELD:

title:
- Short and engaging.
- Should describe the actual discussion topic.
- Avoid generic titles like "Tell me about your project".

description:
- The main speaking prompt.
- Approximately 20-40 words.
- Must require explanation, reasoning, analysis, or reflection.
- Must be directly connected to the resume.

followUpQuestions:
- Generate 2 follow-up questions.
- Each should explore the same topic from a deeper angle.
- Questions should encourage the user to continue speaking.
- Avoid repeating the main question.

Generate 8 topics total:
- 2 Easy
- 4 Medium
- 2 Hard

Make the topics meaningfully different from each other.
Do not generate multiple questions that test exactly the same information.

Document:

{document}
"""
)
@lru_cache(maxsize=1)
def get_topics_llm() -> ChatGroq:
    """Use a bounded client so topic generation fits the Groq output quota."""
    return ChatGroq(
        model="qwen/qwen3.8-27b",
        temperature=0,
        max_tokens=1000,
        model_kwargs={"response_format": {"type": "json_object"}},
        api_key=os.getenv("GROQ_API_KEY"),
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


def generate_topics(document: str) -> list[dict]:
    """Generate and validate document-grounded topics in one LLM call."""
    response = get_topics_llm().invoke(
        TOPICS_PROMPT.format(document=document)
    )
    content = response.content.strip()
    content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content).strip()

    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("The LLM returned invalid topic JSON") from exc

    topics = payload.get("topics") if isinstance(payload, dict) else None
    # if not isinstance(topics, list) or not 30 <= len(topics) <= 50:
    #     raise ValueError("The LLM must return between 30 and 50 topics")

    required_fields = {"title", "category", "difficulty", "description", "followUpQuestions"}
    validated_topics = []
    for topic in topics:
        if not isinstance(topic, dict) or not required_fields.issubset(topic):
            raise ValueError("The LLM returned a topic with missing fields")
        if not isinstance(topic["followUpQuestions"], list):
            raise ValueError("Topic followUpQuestions must be a list")
        validated_topics.append({
            "title": str(topic["title"]),
            "category": str(topic["category"]),
            "difficulty": str(topic["difficulty"]),
            "description": str(topic["description"]),
            "followUpQuestions": [str(question) for question in topic["followUpQuestions"]],
        })

    return validated_topics