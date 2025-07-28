#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы Telegram API
"""

import asyncio
import json
import logging
from server.services.telegram_api_service import telegram_api_service

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_telegram_api():
    """Тестирование Telegram API"""
    print("🧪 Тестирование Telegram API...")
    print("=" * 50)
    
    try:
        # Тест 1: Инициализация клиента
        print("1️⃣ Тестируем инициализацию клиента...")
        is_initialized = await telegram_api_service.initialize_client()
        if is_initialized:
            print("✅ Клиент успешно инициализирован")
        else:
            print("❌ Ошибка инициализации клиента")
            return
        
        # Тест 2: Получение информации о канале
        print("\n2️⃣ Тестируем получение информации о канале...")
        channel_info = await telegram_api_service.get_channel_info("giftnews")
        if channel_info:
            print(f"✅ Информация о канале получена:")
            print(f"   Название: {channel_info['title']}")
            print(f"   Username: {channel_info.get('username')}")
            print(f"   Подписчиков: {channel_info.get('participants_count', 'Неизвестно')}")
        else:
            print("❌ Не удалось получить информацию о канале")
        
        # Тест 3: Получение постов
        print("\n3️⃣ Тестируем получение постов...")
        posts = await telegram_api_service.fetch_posts("giftnews", limit=5)
        if posts:
            print(f"✅ Получено {len(posts)} постов:")
            for i, post in enumerate(posts[:3], 1):
                print(f"   {i}. ID: {post['id']}")
                print(f"      Текст: {post['text'][:100]}...")
                print(f"      Медиа: {'Да' if post['has_media'] else 'Нет'}")
                print(f"      Просмотры: {post.get('views', 0)}")
                print()
        else:
            print("❌ Не удалось получить посты")
        
        # Тест 4: Проверка медиафайлов
        print("\n4️⃣ Анализируем медиафайлы...")
        media_posts = [post for post in posts if post.get('has_media')]
        if media_posts:
            print(f"✅ Найдено {len(media_posts)} постов с медиафайлами:")
            for post in media_posts[:2]:
                print(f"   Пост {post['id']}: {len(post.get('media', []))} медиафайлов")
                for media in post.get('media', []):
                    print(f"     - Тип: {media['type']}, MIME: {media.get('mime_type')}")
        else:
            print("ℹ️ Посты с медиафайлами не найдены")
        
        # Тест 5: Сохранение результатов в JSON
        print("\n5️⃣ Сохраняем результаты в файл...")
        test_results = {
            "channel_info": channel_info,
            "posts_count": len(posts),
            "posts_sample": posts[:3] if posts else [],
            "media_posts_count": len(media_posts)
        }
        
        with open("telegram_api_test_results.json", "w", encoding="utf-8") as f:
            json.dump(test_results, f, ensure_ascii=False, indent=2, default=str)
        
        print("✅ Результаты сохранены в telegram_api_test_results.json")
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        logger.error(f"Ошибка тестирования: {e}")
    
    finally:
        # Закрываем соединение
        await telegram_api_service.close()
        print("\n🔌 Соединение закрыто")

if __name__ == "__main__":
    print("🚀 Запуск тестирования Telegram API")
    print("=" * 50)
    
    # Запускаем тестирование
    asyncio.run(test_telegram_api())
    
    print("\n" + "=" * 50)
    print("🏁 Тестирование завершено") 