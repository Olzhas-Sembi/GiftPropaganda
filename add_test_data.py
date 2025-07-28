#!/usr/bin/env python3
"""
Скрипт для добавления тестовых новостей с изображениями
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from server.db import SessionLocal, NewsItem, NewsSource
from datetime import datetime
import json

def add_test_news_with_images():
    """Добавляет тестовые новости с изображениями"""
    db = SessionLocal()

    try:
        # Создаем тестовый источник
        test_source = db.query(NewsSource).filter(NewsSource.name == "CoinDesk").first()
        if not test_source:
            test_source = NewsSource(
                name="CoinDesk",
                url="https://www.coindesk.com",
                source_type="rss",
                category="crypto",
                is_active=True
            )
            db.add(test_source)
            db.flush()

        # Тестовые новости с изображениями
        test_news = [
            {
                "title": "A Japanese AI Firm Plans to Buy 3,000 Bitcoin Over Next 12 Months",
                "content": "A Japanese artificial intelligence company has announced plans to purchase 3,000 Bitcoin over the next 12 months as part of its treasury management strategy.",
                "content_html": "A Japanese artificial intelligence company has announced plans to purchase 3,000 Bitcoin over the next 12 months as part of its treasury management strategy.",
                "link": "https://www.coindesk.com/business/2025/07/26/a-japanese-ai-firm-plans-to-buy-3-000-bitcoin-over-next-12-months",
                "category": "crypto",
                "image_url": "https://cdn.sanity.io/images/s3y3vcno/production/2297ea2e470af647418127b13e7a3275fed8827a-1920x1200.jpg?auto=format&w=1920&h=1080&crop=focalpoint&fit=clip",
                "video_url": None,
                "reading_time": 1,
                "views_count": 0,
                "author": "CoinDesk"
            },
            {
                "title": "🎁 Бесплатные NFT подарки - Новый дроп!",
                "content": "Получите бесплатные NFT подарки в новом дропе. Ограниченное количество, успейте забрать!",
                "content_html": "Получите бесплатные NFT подарки в новом дропе. Ограниченное количество, успейте забрать!",
                "link": "https://t.me/giftnews/123",
                "category": "gifts",
                "image_url": "https://picsum.photos/800/400?random=1",
                "video_url": None,
                "reading_time": 2,
                "views_count": 15,
                "author": "GiftNews"
            },
            {
                "title": "🚀 Новые технологии в крипто мире",
                "content": "Обзор последних технологических достижений в криптовалютной индустрии.",
                "content_html": "Обзор последних технологических достижений в криптовалютной индустрии.",
                "link": "https://t.me/technews/456",
                "category": "tech",
                "image_url": "https://picsum.photos/800/400?random=2",
                "video_url": None,
                "reading_time": 3,
                "views_count": 8,
                "author": "TechNews"
            },
            {
                "title": "🎮 Игровые новости - Новый релиз",
                "content": "Анонс новой игры с интеграцией блокчейн технологий.",
                "content_html": "Анонс новой игры с интеграцией блокчейн технологий.",
                "link": "https://t.me/gamingnews/789",
                "category": "gaming",
                "image_url": "https://picsum.photos/800/400?random=3",
                "video_url": None,
                "reading_time": 2,
                "views_count": 25,
                "author": "GamingNews"
            },
            {
                "title": "💎 Новости сообщества - Встреча разработчиков",
                "content": "Анонс встречи разработчиков в вашем городе.",
                "content_html": "Анонс встречи разработчиков в вашем городе.",
                "link": "https://t.me/community/101",
                "category": "community",
                "image_url": "https://picsum.photos/800/400?random=4",
                "video_url": None,
                "reading_time": 1,
                "views_count": 12,
                "author": "Community"
            }
        ]

        # Добавляем тестовые новости
        for i, news_data in enumerate(test_news):
            # Проверяем, существует ли уже такая новость
            existing = db.query(NewsItem).filter(
                NewsItem.title == news_data["title"],
                NewsItem.source_id == test_source.id
            ).first()

            if not existing:
                news_item = NewsItem(
                    source_id=test_source.id,
                    title=news_data["title"],
                    content=news_data["content"],
                    content_html=news_data["content_html"],
                    link=news_data["link"],
                    publish_date=datetime.now(),
                    category=news_data["category"],
                    image_url=news_data["image_url"],
                    video_url=news_data["video_url"],
                    reading_time=news_data["reading_time"],
                    views_count=news_data["views_count"],
                    author=news_data["author"]
                )
                db.add(news_item)
                print(f"Добавлена тестовая новость: {news_data['title']}")
            else:
                print(f"Новость уже существует: {news_data['title']}")

        db.commit()
        print("Тестовые новости с изображениями успешно добавлены!")

    except Exception as e:
        print(f"Ошибка при добавлении тестовых новостей: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_news_with_images() 