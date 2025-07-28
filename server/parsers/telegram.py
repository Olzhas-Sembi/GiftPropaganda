import asyncio
from typing import List, Dict
from datetime import datetime
from server.parsers.telegram_news_service import telegram_news_service
from server.models import NewsItem, Source
from sqlalchemy.orm import Session

async def fetch_telegram_channels(session: Session):
    try:
        # Получаем все новости
        news = await telegram_news_service.get_all_news(category='all', limit=50)

        # Кэш для источников, чтобы не создавать дубликаты
        sources_cache = {}

        for item in news:
            # Создаем или находим источник
            source_name = item.get('source', 'Unknown')
            source_url = item.get('link', '')
            category = item.get('category', 'general')

            # Проверяем, есть ли источник в кэше
            source_key = f"{source_name}_{source_url}"
            if source_key not in sources_cache:
                # Ищем существующий источник
                existing_source = session.query(Source).filter(
                    Source.name == source_name,
                    Source.url == source_url
                ).first()

                if existing_source:
                    sources_cache[source_key] = existing_source.id
                else:
                    # Создаем новый источник
                    new_source = Source(
                        type="telegram",
                        url=source_url,
                        name=source_name,
                        category=category,
                        enabled=1
                    )
                    session.add(new_source)
                    session.flush()  # Получаем ID
                    sources_cache[source_key] = new_source.id

            source_id = sources_cache[source_key]

            # Проверяем, существует ли уже такая новость
            existing_news = session.query(NewsItem).filter(
                NewsItem.title == item['title'],
                NewsItem.source_id == source_id
            ).first()

            if not existing_news:
                # Парсим дату
                try:
                    if isinstance(item['date'], str):
                        publish_date = datetime.fromisoformat(item['date'].replace('Z', '+00:00'))
                    else:
                        publish_date = item['date']
                except (ValueError, TypeError):
                    publish_date = datetime.now()

                # Извлекаем медиа данные
                media = item.get('media')
                media_type = None
                media_url = None
                media_thumbnail = None
                media_width = None
                media_height = None

                if media:
                    media_type = media.get('type')
                    media_url = media.get('url')
                    media_thumbnail = media.get('thumbnail')
                    media_width = media.get('width')
                    media_height = media.get('height')

                # Создаем новость с медиа данными
                db_item = NewsItem(
                    source_id=source_id,
                    title=item['title'],
                    content=item['text'],
                    link=item['link'],
                    publish_date=publish_date,
                    category=item['category'],
                    # Добавляем медиа поля
                    media_type=media_type,
                    media_url=media_url,
                    media_thumbnail=media_thumbnail,
                    media_width=media_width,
                    media_height=media_height
                )
                session.add(db_item)

        session.commit()
        print(f"Добавлено новостей в базу")

    except Exception as e:
        print(f"Ошибка при загрузке каналов: {e}")
        session.rollback()
        raise e
