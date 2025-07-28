#!/usr/bin/env python3
"""
Скрипт для авторизации в Telegram API через Telethon
Запустите этот скрипт один раз для создания сессии
"""

import asyncio
from telethon import TelegramClient
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ваши данные API
API_ID = 21149683
API_HASH = "badcd89f35d75a89745a786beaeb35e1"
SESSION_NAME = "gift_propaganda_session"

async def main():
    """Основная функция авторизации"""
    print("🔐 Начинаем авторизацию в Telegram API...")
    print(f"📱 API ID: {API_ID}")
    print(f"🔑 API Hash: {API_HASH[:10]}...")
    print()
    
    try:
        # Создаем клиент
        client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
        
        # Запускаем клиент (без запроса токена бота)
        await client.start(phone=lambda: input("Введите номер телефона: "))
        
        # Проверяем авторизацию
        if await client.is_user_authorized():
            print("✅ Успешно авторизованы!")
            
            # Получаем информацию о пользователе
            me = await client.get_me()
            print(f"👤 Авторизован как: {me.first_name} {me.last_name or ''}")
            print(f"📞 Телефон: {me.phone}")
            print(f"🆔 ID: {me.id}")
            
        else:
            print("❌ Не удалось авторизоваться")
            return
        
        # Тестируем подключение к каналу
        print("\n🧪 Тестируем подключение к каналу...")
        try:
            # Попробуем получить информацию о канале giftnews
            entity = await client.get_entity("giftnews")
            print(f"✅ Канал найден: {entity.title}")
            print(f"📊 Подписчиков: {getattr(entity, 'participants_count', 'Неизвестно')}")
            
            # Получим несколько последних постов
            print("\n📰 Получаем последние посты...")
            async for message in client.iter_messages("giftnews", limit=3):
                if message.text:
                    print(f"📝 Пост {message.id}: {message.text[:100]}...")
                if message.media:
                    print(f"📎 Пост {message.id}: содержит медиафайл")
                    
        except Exception as e:
            print(f"⚠️ Ошибка при тестировании канала: {e}")
        
        print(f"\n💾 Сессия сохранена в файл: {SESSION_NAME}.session")
        print("🎉 Авторизация завершена успешно!")
        print("\n📝 Теперь вы можете использовать Telegram API в вашем приложении")
        
    except Exception as e:
        print(f"❌ Ошибка авторизации: {e}")
        print("\n💡 Возможные причины:")
        print("   - Неверный API ID или API Hash")
        print("   - Проблемы с интернет-соединением")
        print("   - Блокировка Telegram в вашем регионе")
    
    finally:
        # Закрываем клиент
        if 'client' in locals():
            await client.disconnect()

if __name__ == "__main__":
    print("🚀 Запуск авторизации Telegram API")
    print("=" * 50)
    
    # Запускаем асинхронную функцию
    asyncio.run(main())
    
    print("\n" + "=" * 50)
    print("🏁 Скрипт завершен") 