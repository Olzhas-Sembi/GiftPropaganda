from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Убираем Base.metadata.create_all() отсюда, чтобы избежать циркулярного импорта

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@db:5432/giftpropaganda')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class NewsItem(Base):
    __tablename__ = "news_items"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, nullable=True)  # Делаем nullable=True
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    link = Column(String, nullable=False)
    publish_date = Column(DateTime, default=datetime.utcnow)
    category = Column(String, nullable=False)

    # Новые поля для медиа контента
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    reading_time = Column(Integer, nullable=True)  # время чтения в минутах
    views_count = Column(Integer, default=0)
    author = Column(String, nullable=True)
    subtitle = Column(Text, nullable=True)

class NewsSource(Base):
    __tablename__ = "news_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # 'telegram' или 'rss'
    is_active = Column(String, default='true')
