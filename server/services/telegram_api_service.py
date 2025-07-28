import os
import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument, MessageMediaWebPage
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import InputPeerChannel
import json

logger = logging.getLogger(__name__)

class TelegramAPIService:
    def __init__(self):
        self.api_id = 21149683
        self.api_hash = "badcd89f35d75a89745a786beaeb35e1"
        self.session_name = "gift_propaganda_session"
        self.client = None
        
    async def initialize_client(self):
        """Инициализация Telegram клиента"""
        try:
            self.client = TelegramClient(self.session_name, self.api_id, self.api_hash)
            
            # Запускаем клиент
            await self.client.start()
            
            # Проверяем авторизацию после запуска
            if not await self.client.is_user_authorized():
                logger.error("Клиент не авторизован. Запустите auth_telegram.py для авторизации")
                return False
            
            logger.info("Telegram клиент успешно инициализирован")
            return True
        except Exception as e:
            logger.error(f"Ошибка инициализации Telegram клиента: {e}")
            return False
    
    async def get_channel_info(self, channel_username: str) -> Optional[Dict[str, Any]]:
        """Получение информации о канале"""
        try:
            if not self.client:
                await self.initialize_client()
            
            entity = await self.client.get_entity(channel_username)
            return {
                "id": entity.id,
                "title": entity.title,
                "username": entity.username,
                "participants_count": getattr(entity, 'participants_count', None),
                "description": getattr(entity, 'about', None)
            }
        except Exception as e:
            logger.error(f"Ошибка получения информации о канале {channel_username}: {e}")
            return None
    
    async def fetch_posts(self, channel_username: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Получение постов из канала"""
        try:
            if not self.client:
                await self.initialize_client()
            
            posts = []
            async for message in self.client.iter_messages(channel_username, limit=limit):
                if not message.text and not message.media:
                    continue
                
                post_data = {
                    "id": message.id,
                    "text": message.text or "",
                    "date": message.date.isoformat() if message.date else None,
                    "views": getattr(message, 'views', 0),
                    "forwards": getattr(message, 'forwards', 0),
                    "replies": getattr(message, 'replies', 0),
                    "link": f"https://t.me/{channel_username}/{message.id}",
                    "media": [],
                    "has_media": False
                }
                
                # Обработка медиафайлов
                if message.media:
                    post_data["has_media"] = True
                    media_info = await self._process_media(message.media)
                    if media_info:
                        post_data["media"].append(media_info)
                
                # Извлечение текста и заголовка
                if message.text:
                    lines = message.text.split('\n')
                    post_data["title"] = lines[0][:100] if lines else "Без заголовка"
                    post_data["content"] = message.text
                    post_data["subtitle"] = lines[1][:200] if len(lines) > 1 else None
                
                posts.append(post_data)
            
            logger.info(f"Получено {len(posts)} постов из канала {channel_username}")
            return posts
            
        except Exception as e:
            logger.error(f"Ошибка получения постов из канала {channel_username}: {e}")
            return []
    
    async def _process_media(self, media) -> Optional[Dict[str, Any]]:
        """Обработка медиафайлов"""
        try:
            if isinstance(media, MessageMediaPhoto):
                return {
                    "type": "photo",
                    "mime_type": "image/jpeg",
                    "size": getattr(media.photo, 'size', 0),
                    "caption": getattr(media, 'caption', None)
                }
            elif isinstance(media, MessageMediaDocument):
                document = media.document
                mime_type = getattr(document, 'mime_type', 'application/octet-stream')
                
                if mime_type.startswith('video/'):
                    return {
                        "type": "video",
                        "mime_type": mime_type,
                        "size": getattr(document, 'size', 0),
                        "duration": getattr(document.attributes[0], 'duration', 0) if document.attributes else 0,
                        "caption": getattr(media, 'caption', None)
                    }
                elif mime_type.startswith('audio/'):
                    return {
                        "type": "audio",
                        "mime_type": mime_type,
                        "size": getattr(document, 'size', 0),
                        "duration": getattr(document.attributes[0], 'duration', 0) if document.attributes else 0,
                        "caption": getattr(media, 'caption', None)
                    }
                else:
                    return {
                        "type": "document",
                        "mime_type": mime_type,
                        "size": getattr(document, 'size', 0),
                        "filename": getattr(document.attributes[0], 'file_name', 'document') if document.attributes else 'document',
                        "caption": getattr(media, 'caption', None)
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Ошибка обработки медиафайла: {e}")
            return None
    
    async def download_media(self, message, media_index: int = 0) -> Optional[str]:
        """Скачивание медиафайла"""
        try:
            if not self.client:
                await self.initialize_client()
            
            if not message.media:
                return None
            
            # Создаем папку для медиафайлов
            media_dir = "media"
            os.makedirs(media_dir, exist_ok=True)
            
            # Скачиваем файл
            file_path = await self.client.download_media(
                message.media,
                file=f"{media_dir}/telegram_{message.chat_id}_{message.id}_{media_index}"
            )
            
            return file_path
            
        except Exception as e:
            logger.error(f"Ошибка скачивания медиафайла: {e}")
            return None
    
    async def get_media_url(self, message, media_index: int = 0) -> Optional[str]:
        """Получение URL медиафайла (если возможно)"""
        try:
            if not message.media:
                return None
            
            # Для некоторых типов медиа можно получить прямую ссылку
            if isinstance(message.media, MessageMediaPhoto):
                # Получаем информацию о фото
                photo = message.media.photo
                if hasattr(photo, 'id'):
                    # Формируем примерную ссылку (может не работать для всех случаев)
                    return f"https://t.me/{message.chat.username}/{message.id}#photo"
            
            return None
            
        except Exception as e:
            logger.error(f"Ошибка получения URL медиафайла: {e}")
            return None
    
    async def close(self):
        """Закрытие соединения"""
        if self.client:
            await self.client.disconnect()
            logger.info("Telegram клиент отключен")

# Создаем глобальный экземпляр сервиса
telegram_api_service = TelegramAPIService() 