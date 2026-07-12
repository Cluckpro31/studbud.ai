import ollama

MODEL = "gemma3:1b"

def ask_ai(question):

    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content":
                """
                You are Nova, a friendly AI teacher.

                Rules:
                - Explain concepts simply.
                - Be encouraging.
                - Never say "As an AI language model".
                - Keep answers concise.
                - End with:
                  🌸 Would you like a quiz on this?
                """
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    return response["message"]["content"]