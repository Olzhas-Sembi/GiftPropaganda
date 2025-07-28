from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import datetime
import logging
import json

from ..db import get_db, NewsItem
from ..models import NewsResponse, NewsItemResponse

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/news/", response_model=NewsResponse)
async def get_news(
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    limit: int = Query(50, description="Количество новостей", le=100),
    offset: int = Query(0, description="Смещение для пагинации"),
    db: Session = Depends(get_db)
):
    """Получить список новостей с фильтрацией"""
    try:
        logger.info(f"Запрос новостей: category={category}, limit={limit}, offset={offset}")

        # Базовый запрос
        query = db.query(NewsItem)
        
        # Добавляем логирование для отладки
        logger.info(f"Выполняем запрос к базе данных...")
        
        # Проверяем общее количество записей
        total_count = db.query(NewsItem).count()
        logger.info(f"Общее количество новостей в базе: {total_count}")

        # Фильтр по категории
        if category and category != "all":
            query = query.filter(NewsItem.category == category)
            logger.info(f"Применен фильтр по категории: {category}")

        # Сортировка по дате публикации
        query = query.order_by(desc(NewsItem.publish_date))

        # Пагинация
        total = query.count()
        logger.info(f"Количество новостей после фильтрации: {total}")
        
        news_items = query.offset(offset).limit(limit).all()
        logger.info(f"Получено новостей после пагинации: {len(news_items)}")

        logger.info(f"Найдено {len(news_items)} новостей из {total} общих")

        # Преобразование в response модель
        news_data = []
        for item in news_items:
            try:
                # Обрабатываем медиа данные
                media = None
                media_urls = None
                if hasattr(item, 'media') and item.media:
                    try:
                        if isinstance(item.media, str):
                            media = json.loads(item.media)
                        else:
                            media = item.media
                    except:
                        media = None
                
                if hasattr(item, 'media_urls') and item.media_urls:
                    try:
                        if isinstance(item.media_urls, str):
                            media_urls = json.loads(item.media_urls)
                        else:
                            media_urls = item.media_urls
                    except:
                        media_urls = None
                
                news_data.append(NewsItemResponse(
                    id=item.id,
                    title=item.title or "",
                    content=item.content or "",
                    link=item.link or "",
                    publish_date=item.publish_date.isoformat() if item.publish_date else datetime.now().isoformat(),
                    category=item.category or "general",
                    image_url=item.image_url,
                    video_url=item.video_url,
                    reading_time=item.reading_time,
                    views_count=item.views_count or 0,
                    author=item.author,
                    subtitle=item.subtitle,
                    # Новые поля медиа
                    media=media,
                    media_urls=media_urls,
                    has_media=getattr(item, 'has_media', False),
                    forwards=getattr(item, 'forwards', 0),
                    replies=getattr(item, 'replies', 0),
                    channel=getattr(item, 'channel', None)
                ))
            except Exception as e:
                logger.warning(f"Ошибка при обработке новости {item.id}: {e}")
                continue

        return NewsResponse(
            data=news_data,
            total=total,
            page=offset // limit + 1,
            pages=(total + limit - 1) // limit
        )

    except Exception as e:
        logger.error(f"Ошибка при получении новостей: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении новостей: {str(e)}")

@router.get("/news/{news_id}", response_model=NewsItemResponse)
async def get_news_item(
    news_id: int,
    db: Session = Depends(get_db)
):
    """Получить конкретную новость по ID"""
    try:
        news_item = db.query(NewsItem).filter(NewsItem.id == news_id).first()

        if not news_item:
            raise HTTPException(status_code=404, detail="Новость не найдена")

        # Увеличиваем счетчик просмотров
        if news_item.views_count is None:
            news_item.views_count = 0
        news_item.views_count += 1
        db.commit()

        return NewsItemResponse(
            id=news_item.id,
            title=news_item.title or "",
            content=news_item.content or "",
            link=news_item.link or "",
            publish_date=news_item.publish_date.isoformat() if news_item.publish_date else datetime.now().isoformat(),
            category=news_item.category or "general",
            image_url=news_item.image_url,
            video_url=news_item.video_url,
            reading_time=news_item.reading_time,
            views_count=news_item.views_count,
            author=news_item.author,
            subtitle=news_item.subtitle
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении новости {news_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении новости: {str(e)}")

@router.get("/categories/")
async def get_categories(db: Session = Depends(get_db)):
    """Получить список доступных категорий"""
    try:
        categories = db.query(NewsItem.category).distinct().all()
        return {"categories": [cat[0] for cat in categories if cat[0]]}
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении категорий")

@router.get("/stats/")
async def get_stats(db: Session = Depends(get_db)):
    """Получить статистику новостей"""
    try:
        total_news = db.query(NewsItem).count()

        # Статистика по категориям
        categories_stats = {}
        categories = db.query(NewsItem.category).distinct().all()

        for cat in categories:
            if cat[0]:
                count = db.query(NewsItem).filter(NewsItem.category == cat[0]).count()
                categories_stats[cat[0]] = count

        return {
            "total_news": total_news,
            "categories": categories_stats,
            "last_updated": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Ошибка при получении статистики: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при получении статистики")
