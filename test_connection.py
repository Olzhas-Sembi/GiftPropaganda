#!/usr/bin/env python3
"""
Скрипт для тестирования подключения к базе данных
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

# URL базы данных
DATABASE_URL = "postgresql://news_db_bnnu_user:QkbkVviv0rOOKW2LIXh2tkelyDICRLXv@dpg-d22i993e5dus739mr8n0-a.oregon-postgres.render.com/news_db_bnnu"

def test_connection():
    """Тестирует подключение к базе данных"""
    try:
        # Создаем новый движок
        engine = create_engine(
            DATABASE_URL,
            connect_args={"sslmode": "require"},
            echo=True  # Включаем логирование SQL
        )
        
        # Создаем сессию
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Выполняем простой запрос
            result = db.execute(text("SELECT COUNT(*) FROM news_items"))
            count = result.scalar()
            print(f"✅ Подключение успешно! Количество новостей: {count}")
            
            # Проверяем структуру таблицы
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'news_items' 
                AND column_name = 'content_html'
            """))
            
            if result.fetchone():
                print("✅ Колонка content_html существует")
                
                # Пробуем выполнить запрос с content_html
                result = db.execute(text("""
                    SELECT id, title, content_html 
                    FROM news_items 
                    LIMIT 1
                """))
                
                row = result.fetchone()
                if row:
                    print(f"✅ Запрос с content_html успешен: {row}")
                else:
                    print("ℹ️ Таблица пуста")
            else:
                print("❌ Колонка content_html НЕ существует")
                
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")

if __name__ == "__main__":
    test_connection() 