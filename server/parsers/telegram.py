import asyncio
from typing import List, Dict
from server.parsers.telegram_news_service import telegram_news_service  # Импортируйте глобальный экземпляр

async def fetch_telegram_channels(session):
    try:
        # Получаем все новости
        news = await telegram_news_service.get_all_news(category='all', limit=50)
        for item in news:
            # Простая вставка в базу (адаптируйте под вашу модель)
            from server.models import NewsItem  # Предполагаем модель
            db_item = NewsItem(
                title=item['title'],
                content=item['text'],
                link=item['link'],
                publish_date=item['date'],
                category=item['category']
            )
            session.add(db_item)
        session.commit()
        print(f"Добавлено {len(news)} новостей в базу")
    except Exception as e:
        print(f"Ошибка при загрузке каналов: {e}")
        session.rollback()