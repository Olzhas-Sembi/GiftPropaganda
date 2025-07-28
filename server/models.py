from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class NewsItemResponse(BaseModel):
    id: int
    title: str
    content: str
    link: str
    publish_date: str
    category: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    reading_time: Optional[int] = None
    views_count: Optional[int] = 0
    author: Optional[str] = None
    subtitle: Optional[str] = None
    # Новые поля для расширенной поддержки медиа
    media: Optional[Dict[str, Any]] = None
    media_urls: Optional[List[str]] = None
    has_media: Optional[bool] = False
    forwards: Optional[int] = 0
    replies: Optional[int] = 0
    channel: Optional[str] = None

    class Config:
        from_attributes = True

class NewsResponse(BaseModel):
    data: List[NewsItemResponse]
    total: int
    page: int
    pages: int

class CategoryResponse(BaseModel):
    categories: List[str]

class StatsResponse(BaseModel):
    total_news: int
    categories: dict
    last_updated: str

# Новые модели для Telegram API
class TelegramMediaInfo(BaseModel):
    type: str  # photo, video, audio, document
    mime_type: Optional[str] = None
    size: Optional[int] = None
    duration: Optional[int] = None
    filename: Optional[str] = None
    caption: Optional[str] = None
    url: Optional[str] = None

class TelegramPostResponse(BaseModel):
    id: int
    text: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: str
    date: Optional[str] = None
    views: Optional[int] = 0
    forwards: Optional[int] = 0
    replies: Optional[int] = 0
    link: str
    media: List[TelegramMediaInfo] = []
    has_media: bool = False
    source_channel: Optional[str] = None

class TelegramChannelInfo(BaseModel):
    id: int
    title: str
    username: Optional[str] = None
    participants_count: Optional[int] = None
    description: Optional[str] = None

class TelegramPostsResponse(BaseModel):
    posts: List[TelegramPostResponse]
    channel_info: Optional[TelegramChannelInfo] = None
    total: int
    limit: int
