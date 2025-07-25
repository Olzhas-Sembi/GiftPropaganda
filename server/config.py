from dotenv import load_dotenv
import os

load_dotenv()

# Настройки базы данных - для Render
# Временно жестко прописываем URL для Render
DATABASE_URL = "postgresql://giftpropaganda_db_user:cSLpUy9JBOc1KEzf7tBCEZtDxQU61KV5@dpg-d21dudp5pdvs73fqkaeg-a.oregon-postgres.render.com/giftpropaganda_db"

# Проверяем переменную окружения (если будет установлена в Render)
env_db_url = os.getenv("DATABASE_URL")
if env_db_url:
    DATABASE_URL = env_db_url
    print(f"Using DATABASE_URL from environment: {DATABASE_URL[:50]}...")
else:
    print(f"Using hardcoded DATABASE_URL for Render: {DATABASE_URL[:50]}...")

# Настройки Telegram Bot
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

# Настройки Redis (если используется)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Другие настройки
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Логирование для отладки
if __name__ == "__main__":
    print(f"DATABASE_URL: {DATABASE_URL}")
    print(f"TOKEN: {TOKEN}")
    print(f"WEBHOOK_URL: {WEBHOOK_URL}")
