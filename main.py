import sys
import traceback
try:
    from handlers.telegram_bot import run_bot
    if __name__ == "__main__":
        print("Initializing Agentic AI Bot...")
        run_bot()
except Exception as e:
    print("CRITICAL ERROR FOUND:")
    traceback.print_exc()
