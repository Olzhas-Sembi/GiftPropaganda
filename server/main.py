from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from server.models import Base
from server.parsers.telegram import  fetch_telegram_channels
from server.api.news import router as news_router
import requests
import asyncio
import time
import logging
from server.config import DATABASE_URL, TOKEN, WEBHOOK_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Добавляем CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gift-propaganda.vercel.app",
        "https://giftpropaganda.onrender.com"  # Обновлен на реальный домен
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Настройка базы данных с повторными попытками
def init_db():
    max_retries = 10
    retry_delay = 5  # 5 секунд между попытками
    for i in range(max_retries):
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))  # Проверка подключения
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            Base.metadata.create_all(bind=engine)
            logger.info("База данных инициализирована успешно")
            return engine, SessionLocal
        except OperationalError as e:
            logger.warning(f"Попытка {i+1}/{max_retries} подключения к базе: {e}")
            if i < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise Exception("Не удалось подключиться к базе данных после нескольких попыток")

def setup_webhook():
    """Настройка вебхука для Telegram"""
    url = f"https://api.telegram.org/bot{TOKEN}/setWebhook"
    data = {"url": WEBHOOK_URL}
    response = requests.post(url, data=data)
    if response.status_code == 200:
        logger.info("Webhook установлен успешно")
    else:
        logger.error(f"Ошибка установки вебхука: {response.text}")

@app.on_event("startup")
async def startup_event():
    """Событие при запуске приложения"""
    engine, SessionLocal = init_db()
    app.state.engine = engine
    app.state.SessionLocal = SessionLocal  # Сохраняем SessionLocal
    setup_webhook()
    loop = asyncio.get_running_loop()
    loop.create_task(periodic_fetch())

async def periodic_fetch():
    """Периодическое обновление новостей из Telegram-каналов"""
    while True:
        session = app.state.SessionLocal()  # Создаём новую сессию
        try:
            await fetch_telegram_channels(session)
            logger.info("Периодическое обновление завершено")
        except Exception as e:
            logger.error(f"Ошибка при периодическом обновлении: {e}")
        finally:
            session.close()  # Закрываем сессию
        await asyncio.sleep(1800)  # 30 минут

@app.on_event("shutdown")
async def shutdown_event():
    """Событие при остановке приложения"""
    if hasattr(app.state, 'engine'):
        app.state.engine.dispose()  # Корректно закрываем engine
        logger.info("База данных закрыта успешно")


app.include_router(news_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)