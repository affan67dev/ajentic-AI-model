import os
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🧠 OMNI BRAIN AI online hai! Message bhejo.")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🧠 OMNI BRAIN AI: Aapka message mil gaya hai.")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN environment variable missing")

app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
print("OMNI BRAIN AI Telegram bot started...")
app.run_polling()
