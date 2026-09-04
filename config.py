import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Telegram Bot Token
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

# Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Pinecone API Key (optional for now)
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")

# Validation - ensure critical keys are present
if not TELEGRAM_TOKEN:
    raise ValueError("❌ TELEGRAM_TOKEN is missing in .env file!")

if not GROQ_API_KEY:
    raise ValueError("❌ GROQ_API_KEY is missing in .env file!")

print("✅ Configuration loaded successfully!")
