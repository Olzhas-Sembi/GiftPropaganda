#!/usr/bin/env python3
"""
Скрипт для тестирования API с принудительным обновлением метаданных
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# URL базы данных
DATABASE_URL = "postgresql://news_db_bnnu_user:QkbkVviv0rOOKW2LIXh2tkelyDICRLXv@dpg-d22i993e5dus739mr8n0-a.oregon-postgres.render.com/news_db_bnnu"

# Создаем новый движок
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    echo=True
)

# Создаем новую базу
Base = declarative_base()

class NewsItem(Base):
    __tablename__ = 'news_items'
    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey('news_sources.id'), nullable=False)
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

def test_api_query():
    """Тестирует запрос как в API"""
    try:
        # Принудительно обновляем метаданные
        Base.metadata.reflect(bind=engine)
        
        # Создаем сессию
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Выполняем запрос как в API
            query = db.query(NewsItem)
            total = query.count()
            news_items = query.order_by(NewsItem.publish_date.desc()).limit(10).all()
            
            print(f"✅ Запрос как в API успешен! Найдено записей: {len(news_items)} из {total}")
            
            if news_items:
                item = news_items[0]
                print(f"ID: {item.id}")
                print(f"Title: {item.title}")
                print(f"Content HTML: {item.content_html}")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Ошибка при тестировании API запроса: {e}")

if __name__ == "__main__":
    test_api_query() 