import requests

url = "http://127.0.0.1:11434/api/chat"

payload = {
    "model": "gemma3:1b",
    "messages": [
        {
            "role": "user",
            "content": "Why is the sky blue?"
        }
    ],
    "stream": False
}

print("Sending request...")

response = requests.post(url, json=payload, timeout=120)

print(response.status_code)
print(response.text)