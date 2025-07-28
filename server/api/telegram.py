from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from server.models import TelegramPostsResponse, TelegramPostResponse, TelegramChannelInfo
from server.services.telegram_api_service import telegram_api_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/telegram/channel/{channel_username}", response_model=TelegramPostsResponse)
async def get_telegram_posts(
    channel_username: str,
    limit: int = Query(default=20, ge=1, le=100, description="Количество постов для получения"),
    include_media: bool = Query(default=True, description="Включать ли информацию о медиафайлах")
):
    """
    Получение постов из Telegram канала через Telegram API
    """
    try:
        logger.info(f"Запрос постов из канала: {channel_username}, лимит: {limit}")
        
        # Получаем информацию о канале
        channel_info = await telegram_api_service.get_channel_info(channel_username)
        
        # Получаем посты
        posts_data = await telegram_api_service.fetch_posts(channel_username, limit)
        
        # Преобразуем данные в формат ответа
        posts = []
        for post_data in posts_data:
            # Преобразуем медиафайлы
            media_list = []
            if include_media and post_data.get("media"):
                for media_info in post_data["media"]:
                    media_list.append(media_info)
            
            post = TelegramPostResponse(
                id=post_data["id"],
                text=post_data["text"],
                title=post_data.get("title"),
                subtitle=post_data.get("subtitle"),
                content=post_data["content"],
                date=post_data.get("date"),
                views=post_data.get("views", 0),
                forwards=post_data.get("forwards", 0),
                replies=post_data.get("replies", 0),
                link=post_data["link"],
                media=media_list,
                has_media=post_data.get("has_media", False),
                source_channel=channel_username
            )
            posts.append(post)
        
        # Формируем информацию о канале
        channel_response = None
        if channel_info:
            channel_response = TelegramChannelInfo(
                id=channel_info["id"],
                title=channel_info["title"],
                username=channel_info.get("username"),
                participants_count=channel_info.get("participants_count"),
                description=channel_info.get("description")
            )
        
        response = TelegramPostsResponse(
            posts=posts,
            channel_info=channel_response,
            total=len(posts),
            limit=limit
        )
        
        logger.info(f"Успешно получено {len(posts)} постов из канала {channel_username}")
        return response
        
    except Exception as e:
        logger.error(f"Ошибка получения постов из канала {channel_username}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка получения постов из канала {channel_username}: {str(e)}"
        )

@router.get("/telegram/channel/{channel_username}/info", response_model=TelegramChannelInfo)
async def get_telegram_channel_info(channel_username: str):
    """
    Получение информации о Telegram канале
    """
    try:
        logger.info(f"Запрос информации о канале: {channel_username}")
        
        channel_info = await telegram_api_service.get_channel_info(channel_username)
        
        if not channel_info:
            raise HTTPException(
                status_code=404,
                detail=f"Канал {channel_username} не найден или недоступен"
            )
        
        response = TelegramChannelInfo(
            id=channel_info["id"],
            title=channel_info["title"],
            username=channel_info.get("username"),
            participants_count=channel_info.get("participants_count"),
            description=channel_info.get("description")
        )
        
        logger.info(f"Успешно получена информация о канале {channel_username}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения информации о канале {channel_username}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка получения информации о канале {channel_username}: {str(e)}"
        )

@router.get("/telegram/channels")
async def get_available_channels():
    """
    Получение списка доступных каналов (захардкоженный список)
    """
    channels = [
        {
            "username": "giftnews",
            "title": "Gift News",
            "description": "Новости о подарках и акциях"
        },
        {
            "username": "meduzanews",
            "title": "Медуза",
            "description": "Новости и аналитика"
        },
        {
            "username": "tass_agency",
            "title": "ТАСС",
            "description": "Информационное агентство России"
        }
    ]
    
    return {
        "channels": channels,
        "total": len(channels)
    }

@router.get("/telegram/health")
async def telegram_health_check():
    """
    Проверка состояния Telegram API сервиса
    """
    try:
        # Пытаемся инициализировать клиент
        is_initialized = await telegram_api_service.initialize_client()
        
        return {
            "status": "healthy" if is_initialized else "unhealthy",
            "service": "telegram_api",
            "initialized": is_initialized
        }
        
    except Exception as e:
        logger.error(f"Ошибка проверки состояния Telegram API: {e}")
        return {
            "status": "unhealthy",
            "service": "telegram_api",
            "error": str(e)
        } 