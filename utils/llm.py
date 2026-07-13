import ollama
from utils.rag import search_ncert

MODEL = "gemma3:4b"


def ask_ai(question):

    original_question = question.strip()
    question = original_question.lower()


    # ---------------- Greetings ---------------- #

    greetings = {
        "hi",
        "hello",
        "hey",
        "heyy",
        "heyyyy",
        "heyyyyy",
        "good morning",
        "good afternoon",
        "good evening",
        "how are you",
        "how are you?",
        "how are youuu",
        "how are youuuu"
    }

    if question in greetings:
        return (
            "🌸 Hello! I'm Nova, your offline NCERT study assistant.\n\n"
            "I'm doing great! 😊\n\n"
            "Ask me anything from your NCERT books!"
        )


    # ---------------- Thanks ---------------- #

    thanks = {
        "thanks",
        "thank you",
        "ty",
        "thx"
    }

    if question in thanks:
        return (
            "😊 You're welcome!\n\n"
            "Happy studying! 🌸"
        )


    # ---------------- Goodbye ---------------- #

    bye = {
        "bye",
        "goodbye",
        "see you",
        "see ya"
    }

    if question in bye:
        return (
            "👋 Goodbye!\n\n"
            "Best of luck with your studies. 🌸"
        )


    # ---------------- Search NCERT ---------------- #

    docs = search_ncert(original_question)

    print("Docs found:", len(docs))


    if not docs:
        return (
            "📚 I couldn't find anything relevant in the available NCERT books.\n\n"
            "Try asking questions like:\n"
            "• What is photosynthesis?\n"
            "• Explain Newton's three laws.\n"
            "• Derivation of drift velocity.\n"
            "• What is respiration?"
        )


    # Combine retrieved paragraphs

    context = "\n\n".join(
        doc.page_content for doc in docs
    )


    prompt = f"""
You are Nova, an experienced NCERT teacher.

Answer ONLY from the NCERT information provided.

==========================
NCERT INFORMATION
==========================
{context}

==========================
QUESTION
==========================
{original_question}

Instructions:

- Read the information carefully.
- Answer exactly what the student asked.
- Give a detailed answer.
- Use headings.
- Use bullet points.
- If the student asks for a definition, start with the definition.
- If the student asks to explain a concept, explain step-by-step.
- If the student asks for derivation, show every mathematical step.
- If the student asks for laws, number each law separately.
- Never answer in one short paragraph.
- Do NOT mention this information source.
- Teach like a school teacher.

If the answer is not available, reply:

"I couldn't find the complete answer in the available NCERT books."

Finish with:

🌸 Would you like a quiz on this?
"""


    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )


    return response["message"]["content"], context