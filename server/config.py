from dotenv import load_dotenv
import os

load_dotenv()

# Настройки базы данных - для Render
# Получаем DATABASE_URL из переменных окружения или используем дефолтную для Render
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://giftpropaganda_db_user:cSLpUy9JBOc1KEzf7tBCEZtDxQU61KV5@dpg-d21dudp5pdvs73fqkaeg-a.oregon-postgres.render.com/giftpropaganda_db")

# Если используется локальный Docker, заменяем на внешний URL
if "postgresql://user:password@db:" in DATABASE_URL:
    DATABASE_URL = "postgresql://giftpropaganda_db_user:cSLpUy9JBOc1KEzf7tBCEZtDxQU61KV5@dpg-d21dudp5pdvs73fqkaeg-a.oregon-postgres.render.com/giftpropaganda_db"
    print("Заменен Docker DATABASE_URL на Render PostgreSQL")

print(f"Using DATABASE_URL: {DATABASE_URL[:50]}...")

# Настройки Telegram Bot
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8429342375:AAFl55U3d2jiq3bm4UNTyDrbB0rztFTio2I")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://giftpropaganda.onrender.com")

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
