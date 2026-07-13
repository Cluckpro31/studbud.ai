import ollama

MODEL = "gemma3:1b"

def generate_flashcards(question, context):

    prompt = f"""
You are an NCERT teacher.

Using ONLY this context,

generate exactly 5 flashcards.

Format

Front:
...

Back:
...

Context:

{context}

Question:

{question}
"""

    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    return response["message"]["content"]