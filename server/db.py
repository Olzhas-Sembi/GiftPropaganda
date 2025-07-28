from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://news_db_bnnu_user:QkbkVviv0rOOKW2LIXh2tkelyDICRLXv@dpg-d22i993e5dus739mr8n0-a.oregon-postgres.render.com/news_db_bnnu")

# Создаем движок базы данных с SSL
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

class NewsSource(Base):
    """Модель источника новостей"""
    __tablename__ = "news_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    source_type = Column(String(50), nullable=False)  # 'telegram' или 'rss'
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NewsItem(Base):
    """Модель новости"""
    __tablename__ = "news_items"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, nullable=False)  # ID источника
    title = Column(String(1000), nullable=False)
    content = Column(Text, nullable=False)
    content_html = Column(Text, nullable=True)  # HTML контент с медиа
    link = Column(String(1000), nullable=False)
    publish_date = Column(DateTime, nullable=False)
    category = Column(String(100), nullable=False)
    media = Column(JSON, nullable=True)  # JSON поле для медиа

    # Новые поля для медиа
    image_url = Column(String(1000), nullable=True)
    video_url = Column(String(1000), nullable=True)
    reading_time = Column(Integer, nullable=True)  # в минутах
    views_count = Column(Integer, default=0)
    author = Column(String(200), nullable=True)
    subtitle = Column(String(500), nullable=True)
    
    # Дополнительные поля для расширенной поддержки медиа
    has_media = Column(Boolean, default=False)
    forwards = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    channel = Column(String(200), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Функция для получения сессии базы данных
def get_db() -> Session:
    """Получить сессию базы данных для FastAPI Depends"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Функция для создания таблиц
def create_tables():
    """Создать все таблицы в базе данных"""
    Base.metadata.create_all(bind=engine)

# Функция для получения сессии (синхронная версия)
def get_db_session():
    """Получить сессию базы данных (синхронная версия)"""
    return SessionLocal()
