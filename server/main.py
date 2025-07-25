import os
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import time
from server.db import Base, NewsItem, NewsSource
from server.parsers.telegram_news_service import TelegramNewsService
from server.config import TOKEN, WEBHOOK_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Глобальные переменные для БД
engine = None
SessionLocal = None

def init_db():
    """Инициализация базы данных с повторными попытками"""
    global engine, SessionLocal

    # Проверяем переменные окружения
    database_url = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/giftpropaganda')
    token = os.getenv('TOKEN')
    webhook_url = os.getenv('WEBHOOK_URL')

    # Обрезаем DATABASE_URL для логирования (убираем пароль)
    safe_db_url = database_url.replace('password', '***') if 'password' in database_url else database_url
    logger.info(f"DATABASE_URL: {safe_db_url}")
    logger.info(f"TOKEN: {'SET' if token else 'NOT SET'}")
    logger.info(f"WEBHOOK_URL: {webhook_url}")

    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        try:
            engine = create_engine(database_url)

            # Проверяем подключение
            with engine.connect() as connection:
                logger.info("Успешное подключение к базе данных")

            # Создаем таблицы
            Base.metadata.create_all(bind=engine)

            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

            logger.info("База данных инициализирована успешно")
            return engine, SessionLocal

        except Exception as e:
            logger.warning(f"Попытка {attempt}/{max_attempts} подключения к базе: {e}")
            if attempt < max_attempts:
                time.sleep(5)
            continue

    raise Exception("Не удалось подключиться к базе данных после нескольких попыток")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global engine, SessionLocal
    engine, SessionLocal = init_db()

    # Настройка webhook
    try:
        import requests
        webhook_response = requests.post(
            f"https://api.telegram.org/bot{TOKEN}/setWebhook",
            json={"url": f"{WEBHOOK_URL}/webhook"}
        )
        if webhook_response.status_code == 200:
            logger.info("Webhook установлен успешно")
        else:
            logger.warning(f"Ошибка установки webhook: {webhook_response.text}")
    except Exception as e:
        logger.error(f"Ошибка при установке webhook: {e}")

    # Запуск периодических задач
    news_service = TelegramNewsService()

    async def periodic_update():
        while True:
            try:
                await news_service.update_news_async()
                logger.info("Периодическое обновление завершено")
            except Exception as e:
                logger.error(f"Ошибка при обновлении новостей: {e}")
            await asyncio.sleep(3600)  # обновляем каждый час

    asyncio.create_task(periodic_update())

    yield

    # Shutdown
    logger.info("Приложение завершает работу")

# Создаем FastAPI приложение
app = FastAPI(
    title="Gift Propaganda News API",
    description="API для агрегации новостей Telegram",
    version="1.0.0",
    lifespan=lifespan
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Импортируем роутеры после создания app
from server.api.news import router as news_router

app.include_router(news_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Gift Propaganda News API", "status": "running"}

@app.get("/health")
async def health():
    try:
        # Проверяем подключение к БД
        with engine.connect() as connection:
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)