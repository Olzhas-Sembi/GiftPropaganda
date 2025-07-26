# server/db.py

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
import os

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://news_db_uqla_user:CsR935mNvZq5dXoFZfiQZMu9Z1lMiC4O@dpg-d22h9l7gi27c73evqun0-a.oregon-postgres.render.com/news_db_uqla")

# Создаем движок базы данных с SSL
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}  # ← ключевая строка
)

# Сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class NewsSource(Base):
    __tablename__ = 'news_sources'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True)
    url = Column(String(1000), nullable=False)
    source_type = Column(String(50), nullable=False)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsItem(Base):
    __tablename__ = 'news_items'
    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey('news_sources.id'), nullable=False)  # Жёсткая связь
    title = Column(String(1000), nullable=False)
    content = Column(Text, nullable=False)
    content_html = Column(Text, nullable=True)
    link = Column(String(1000), nullable=False)
    publish_date = Column(DateTime, nullable=False)
    category = Column(String(100), nullable=False)
    media = Column(JSON, nullable=True)
    image_url = Column(String(1000), nullable=True)
    video_url = Column(String(1000), nullable=True)
    reading_time = Column(Integer, nullable=True)
    views_count = Column(Integer, default=0)
    author = Column(String(200), nullable=True)
    subtitle = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    source = relationship("NewsSource")  # Для удобного доступа

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db_session():
    return SessionLocal()
