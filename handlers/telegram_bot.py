import os
from groq import Groq
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters
import config

# Initialize Groq Client
client = Groq(api_key=config.GROQ_API_KEY)

# Load System Instructions
try:
    with open("system_instructions.txt", "r", encoding="utf-8") as f:
        system_prompt = f.read()
except Exception:
    system_prompt = "You are a helpful AI assistant."

# Global dictionary to store chat history for each user
user_memory = {}

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    chat_id = update.effective_chat.id

    # 1. Agar naya user hai, toh uski history create karo aur System Prompt daalo
    if chat_id not in user_memory:
        user_memory[chat_id] = [{"role": "system", "content": system_prompt}]

    # 2. User ka naya message history mein add karo
    user_memory[chat_id].append({"role": "user", "content": user_message})

    # 3. Token limit bachane ke liye sirf last 10 messages yaad rakho
    if len(user_memory[chat_id]) > 11:
        user_memory[chat_id] = [user_memory[chat_id][0]] + user_memory[chat_id][-10:]

    try:
        # 4. Ab pura memory array API ko bhejo
        chat_completion = client.chat.completions.create(
            messages=user_memory[chat_id],
            model="llama-3.1-8b-instant",
        )
        
        reply_text = chat_completion.choices[0].message.content
        
        # 5. AI ka reply bhi history mein save karo
        user_memory[chat_id].append({"role": "assistant", "content": reply_text})

        await update.message.reply_text(reply_text)
        
    except Exception as e:
        await update.message.reply_text(f"Oops! Koi error aaya: {e}")

def run_bot():
    app = ApplicationBuilder().token(config.TELEGRAM_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    print("Groq LLaMA Bot is running successfully with MEMORY...")
    app.run_polling()
