from dotenv import load_dotenv
import os

load_dotenv()

# Настройки базы данных - исправлено для соответствия docker-compose.yml
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/giftpropaganda")

# Настройки Telegram Bot
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")

# Настройки Redis (если используется)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Другие настройки
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
