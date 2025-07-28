#!/usr/bin/env python3
"""
Скрипт для проверки данных в базе данных
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from server.db import SessionLocal, NewsItem, NewsSource

def check_db_data():
    """Проверяет данные в базе данных"""
    db = SessionLocal()

    try:
        # Проверяем источники
        sources = db.query(NewsSource).all()
        print(f"Источники в базе данных: {len(sources)}")
        for source in sources:
            print(f"  - {source.name} (ID: {source.id})")

        # Проверяем новости
        news_items = db.query(NewsItem).all()
        print(f"\nНовости в базе данных: {len(news_items)}")
        for item in news_items:
            print(f"  - ID: {item.id}, Title: {item.title[:50]}...")
            print(f"    Category: {item.category}, Image: {item.image_url is not None}")

        # Проверяем конкретную новость
        if news_items:
            item = news_items[0]
            print(f"\nДетали первой новости:")
            print(f"  ID: {item.id}")
            print(f"  Title: {item.title}")
            print(f"  Category: {item.category}")
            print(f"  Image URL: {item.image_url}")
            print(f"  Video URL: {item.video_url}")
            print(f"  Author: {item.author}")
            print(f"  Reading Time: {item.reading_time}")
            print(f"  Views Count: {item.views_count}")

    except Exception as e:
        print(f"Ошибка при проверке данных: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db_data() 