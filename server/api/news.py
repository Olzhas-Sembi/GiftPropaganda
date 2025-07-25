from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import server.main as main_module  # Импортируем модуль, а не SessionLocal напрямую
from server.db import NewsItem

router = APIRouter()

# Pydantic модели для API
class NewsItemResponse(BaseModel):
    id: int
    title: str
    content: str
    link: str
    publish_date: datetime
    category: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    reading_time: Optional[int] = None
    views_count: int = 0
    author: Optional[str] = None
    subtitle: Optional[str] = None

    class Config:
        from_attributes = True

class NewsResponse(BaseModel):
    status: str
    data: List[NewsItemResponse]
    message: str
    total: Optional[int] = None
    page: Optional[int] = None
    limit: Optional[int] = None

# Dependency для получения сессии БД
def get_db():
    if main_module.SessionLocal is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    db = main_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/news/", response_model=NewsResponse)
async def get_news(
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    limit: int = Query(50, ge=1, le=100, description="Количество новостей"),
    offset: int = Query(0, ge=0, description="Смещение"),
    db: Session = Depends(get_db)
):
    """
    Получить список новостей с возможностью фильтрации
    """
    try:
        query = db.query(NewsItem)

        if category and category != "all":
            query = query.filter(NewsItem.category == category)

        # Получаем общее количество
        total = query.count()

        # Применяем сортировку, лимит и смещение
        news_items = query.order_by(desc(NewsItem.publish_date)).offset(offset).limit(limit).all()

        # Увеличиваем счетчик просмотров для возвращаемых новостей
        for item in news_items:
            item.views_count += 1
        db.commit()

        return NewsResponse(
            status="success",
            data=news_items,
            message="Новости успешно получены",
            total=total,
            page=offset // limit + 1,
            limit=limit
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении новостей: {str(e)}")

@router.get("/news/{news_id}", response_model=NewsItemResponse)
async def get_news_by_id(
    news_id: int,
    db: Session = Depends(get_db)
):
    """
    Получить конкретную новость по ID
    """
    news_item = db.query(NewsItem).filter(NewsItem.id == news_id).first()

    if not news_item:
        raise HTTPException(status_code=404, detail="Новость не найдена")

    # Увеличиваем счетчик просмотров
    news_item.views_count += 1
    db.commit()

    return news_item

@router.get("/news/categories/")
async def get_categories(db: Session = Depends(get_db)):
    """
    Получить список всех доступных категорий
    """
    try:
        categories = db.query(NewsItem.category).distinct().all()
        category_list = [cat[0] for cat in categories]

        return {
            "status": "success",
            "data": category_list,
            "message": "Категории успешно получены"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении категорий: {str(e)}")

@router.get("/stats/")
async def get_stats(db: Session = Depends(get_db)):
    """
    Получить статистику по новостям
    """
    try:
        total_news = db.query(NewsItem).count()
        total_views = db.query(NewsItem.views_count).scalar() or 0

        # Статистика по категориям
        categories_stats = db.query(
            NewsItem.category,
            db.func.count(NewsItem.id).label('count')
        ).group_by(NewsItem.category).all()

        return {
            "status": "success",
            "data": {
                "total_news": total_news,
                "total_views": total_views,
                "categories": [{"category": cat, "count": count} for cat, count in categories_stats]
            },
            "message": "Статистика успешно получена"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")
