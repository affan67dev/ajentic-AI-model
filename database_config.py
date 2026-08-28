from pinecone import Pinecone, ServerlessSpec
import config

def connect_pinecone():
    print("Connecting to Pinecone Database...")
    try:
        # Config file se tumhari Pinecone API key lega
        pc = Pinecone(api_key=config.PINECONE_API_KEY)
        index_name = "students-data"
        
        # Check karega ki index pehle se hai ya naya banana hai
        if index_name not in pc.list_indexes().names():
            print(f"Creating new RAG index: {index_name} (Free Tier)...")
            pc.create_index(
                name=index_name,
                dimension=384, # Text embeddings ke liye standard size
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        
        index = pc.Index(index_name)
        print("Pinecone Database Connected Successfully! 🚀")
        return index
        
    except Exception as e:
        print(f"Database Error Aaya: {e}")
        return None
