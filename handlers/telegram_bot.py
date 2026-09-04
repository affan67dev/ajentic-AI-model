import logging
import os
from groq import Groq
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters
import config

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize Groq Client
try:
    client = Groq(api_key=config.GROQ_API_KEY)
    logger.info("✅ Groq client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Groq client: {e}")
    client = None

# Load System Instructions
system_prompt = "You are a helpful AI assistant."
try:
    if os.path.exists("system_instructions.txt"):
        with open("system_instructions.txt", "r", encoding="utf-8") as f:
            system_prompt = f.read()
        logger.info("✅ System instructions loaded successfully")
    else:
        logger.warning("⚠️ system_instructions.txt not found, using default prompt")
except OSError as e:
    logger.warning(f"⚠️ Could not load system_instructions.txt: {e}")

# Global dictionary to store chat history for each user
user_memory = {}

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages from Telegram users"""
    if not client:
        await update.message.reply_text("❌ Bot is not properly configured. Please check API keys.")
        return
    
    user_message = update.message.text
    chat_id = update.effective_chat.id
    
    logger.info(f"📨 Message from chat_id {chat_id}: {user_message[:50]}...")

    # 1. Agar naya user hai, toh uski history create karo aur System Prompt daalo
    if chat_id not in user_memory:
        user_memory[chat_id] = [{"role": "system", "content": system_prompt}]
        logger.info(f"👤 New user initialized: {chat_id}")

    # 2. User ka naya message history mein add karo
    user_memory[chat_id].append({"role": "user", "content": user_message})

    # 3. Token limit bachane ke liye sirf last 10 messages yaad rakho
    if len(user_memory[chat_id]) > 11:
        user_memory[chat_id] = [user_memory[chat_id][0]] + user_memory[chat_id][-10:]

    try:
        # Show typing indicator
        await update.message.chat.send_action("typing")
        
        # 4. Ab pura memory array API ko bhejo
        chat_completion = client.chat.completions.create(
            messages=user_memory[chat_id],
            model="llama-3.1-8b-instant",
        )
        
        reply_text = chat_completion.choices[0].message.content
        
        # 5. AI ka reply bhi history mein save karo
        user_memory[chat_id].append({"role": "assistant", "content": reply_text})

        await update.message.reply_text(reply_text)
        logger.info(f"✅ Reply sent to chat_id {chat_id}")
        
    except Exception as e:
        logger.exception(f"❌ Failed to generate AI response for chat_id={chat_id}: {e}")
        await update.message.reply_text("Sorry, something went wrong. Please try again in a moment.")

def run_bot():
    """Start the Telegram bot"""
    try:
        logger.info("🤖 Starting Agentic AI Bot...")
        app = ApplicationBuilder().token(config.TELEGRAM_TOKEN).build()
        app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
        
        logger.info("✅ Bot is running! Polling for messages...")
        print("\n" + "="*50)
        print("🤖 Groq LLaMA Bot is running successfully with MEMORY...")
        print("📱 Waiting for Telegram messages...")
        print("="*50 + "\n")
        
        app.run_polling()
    except Exception as e:
        logger.error(f"❌ Failed to start bot: {e}")
        raise
