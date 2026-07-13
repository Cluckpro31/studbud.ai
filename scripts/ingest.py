import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PDF_FOLDER = os.path.join(BASE_DIR, "data", "pdfs")
DB_FOLDER = os.path.join(BASE_DIR, "database")

documents = []

print("📚 Reading PDFs...")

for file in os.listdir(PDF_FOLDER):

    if file.endswith(".pdf"):

        loader = PyPDFLoader(os.path.join(PDF_FOLDER, file))

        documents.extend(loader.load())

print(f"✅ Loaded {len(documents)} pages.")
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ".", " ", ""]
)

chunks = splitter.split_documents(documents)

print(f"✂ Created {len(chunks)} chunks.")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=DB_FOLDER
)

print("🎉 Database created successfully!")