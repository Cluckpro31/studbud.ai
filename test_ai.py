from utils.llm import ask_ai

print("🌸 Nova is ready! (type 'exit' to quit)\n")

while True:

    question = input("You: ")

    if question.lower() == "exit":
        break

    print("\nNova 🌸:\n")
    print(ask_ai(question))
    print()