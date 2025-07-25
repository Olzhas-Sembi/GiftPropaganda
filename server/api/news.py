from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
from server.models import NewsItem
from server.db import SessionLocal  # Импортируем SessionLocal из db.py

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/news", tags=["news"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
async def get_news(category: str = "all", limit: int = 50, db: Session = Depends(get_db)):
    """Получить новости"""
    try:
        query = db.query(NewsItem)
        if category != "all":
            query = query.filter(NewsItem.category == category)
        news = query.order_by(NewsItem.publish_date.desc()).limit(limit).all()
        data = [
            {
                "id": item.id,
                "title": item.title,
                "content": item.content,
                "link": item.link,
                "publish_date": item.publish_date.isoformat() if item.publish_date else None,
                "category": item.category,
                # Добавляем медиа данные
                "media": {
                    "type": item.media_type,
                    "url": item.media_url,
                    "thumbnail": item.media_thumbnail,
                    "width": item.media_width,
                    "height": item.media_height
                } if item.media_type and item.media_url else None,
                # Добавляем информацию об источнике
                "source": {
                    "name": item.source.name if item.source else "Unknown",
                    "type": item.source.type if item.source else "unknown"
                } if item.source else None
            }
            for item in news
        ]
        return {
            "status": "success",
            "data": data,
            "message": "Новости успешно получены" if data else "Нет новостей"
        }
    except Exception as e:
        logger.error(f"Error getting news: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch news")

@router.get("/categories")
async def get_categories():
    """Получить категории новостей"""
    return {
        "status": "success",
        "categories": ["gifts", "crypto", "nft", "tech", "general"]
    }
