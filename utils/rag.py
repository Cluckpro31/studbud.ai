import os

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DB_FOLDER = os.path.join(BASE_DIR, "database")


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


db = Chroma(
    persist_directory=DB_FOLDER,
    embedding_function=embeddings
)


def search_ncert(question):

    results = db.similarity_search_with_relevance_scores(
        question,
        k=3
    )


    print("\n" + "=" * 60)
    print("QUESTION:", question)
    print("=" * 60)


    docs = []


    for i, (doc, score) in enumerate(results, start=1):

        print(f"\nResult {i}")
        print(f"Score: {score}")
        print("-" * 60)
        print(doc.page_content[:600])
        print("-" * 60)


        if score > 0.1:
            docs.append(doc)


    print(f"\nTotal Docs Returned: {len(docs)}")
    print("=" * 60)


    return docs