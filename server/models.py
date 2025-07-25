from pydantic import BaseModel
from typing import List, Optional
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
