from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
import logging

from server.db import get_db, NewsItem, NewsSource, recreate_engine, recreate_models
from server.models import NewsResponse, NewsItemResponse, MediaItem

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

        # Принудительно обновляем метаданные и модели
        recreate_engine()
        NewsItem, NewsSource = recreate_models()

        # Базовый запрос
        query = db.query(NewsItem)

        # Фильтр по категории
        if category and category != "all":
            query = query.filter(NewsItem.category == category)

        # Сортировка по дате публикации
        query = query.order_by(desc(NewsItem.publish_date))

        # Пагинация
        total = query.count()
        news_items = query.offset(offset).limit(limit).all()

        logger.info(f"Найдено {len(news_items)} новостей из {total} общих")

        # Соберем source_id для всех новостей
        source_ids = [item.source_id for item in news_items if item.source_id is not None]
        sources = {}
        if source_ids:
            sources_list = db.query(NewsSource).filter(NewsSource.id.in_(source_ids)).all()
            sources = {source.id: source for source in sources_list}

        # Преобразование в response модель
        news_data = []
        for item in news_items:
            try:
                # Получаем медиа из JSON поля
                media_list = []
                if item.media:
                    try:
                        media_list = [MediaItem(**media) for media in item.media]
                    except Exception as e:
                        logger.warning(f"Error parsing media for {item.id}: {e}")

                # Получаем источник
                source = sources.get(item.source_id)
                source_name = source.name if source else None
                source_url = source.url if source else None

                news_data.append(NewsItemResponse(
                    id=item.id,
                    title=item.title or "",
                    content=item.content or "",  # Plain text
                    content_html=item.content_html or "",  # HTML контент
                    link=item.link or "",
                    publish_date=item.publish_date.isoformat() if item.publish_date else datetime.now().isoformat(),
                    category=item.category or "general",
                    media=media_list,
                    reading_time=item.reading_time,
                    views_count=item.views_count or 0,
                    author=item.author,
                    source_name=source_name,
                    source_url=source_url,
                    source=source  # <-- добавлено, чтобы поле source было заполнено
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

        # Получаем источник
        source = db.query(NewsSource).get(news_item.source_id) if news_item.source_id else None

        # Получаем медиа
        media_list = []
        if news_item.media:
            try:
                media_list = [MediaItem(**media) for media in news_item.media]
            except Exception as e:
                logger.warning(f"Error parsing media for {news_item.id}: {e}")

        # Увеличиваем счетчик просмотров
        if news_item.views_count is None:
            news_item.views_count = 0
        news_item.views_count += 1
        db.commit()

        return NewsItemResponse(
            id=news_item.id,
            title=news_item.title or "",
            content=news_item.content or "",
            content_html=news_item.content_html or "",
            link=news_item.link or "",
            publish_date=news_item.publish_date.isoformat() if news_item.publish_date else datetime.now().isoformat(),
            category=news_item.category or "general",
            media=media_list,
            reading_time=news_item.reading_time,
            views_count=news_item.views_count,
            author=news_item.author,
            source_name=source.name if source else None,
            source_url=source.url if source else None
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