from utils.rag import search_ncert

docs = search_ncert("what is emf")

print(len(docs))

for d in docs:
    print("=" * 50)
    print(d.page_content[:800])