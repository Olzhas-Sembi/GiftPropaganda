#!/usr/bin/env python3
"""
Скрипт для быстрого старта Telegram API
Проверяет все компоненты и запускает приложение
"""

import os
import sys
import subprocess
import asyncio
import logging
from pathlib import Path

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Проверка установленных зависимостей"""
    print("🔍 Проверяем зависимости...")
    
    required_packages = [
        'telethon',
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - НЕ УСТАНОВЛЕН")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️ Отсутствуют пакеты: {', '.join(missing_packages)}")
        print("Установите их командой:")
        print("pip install -r requirements.txt")
        return False
    
    print("✅ Все зависимости установлены")
    return True

def check_session_file():
    """Проверка файла сессии Telegram"""
    session_file = Path("gift_propaganda_session.session")
    
    if session_file.exists():
        print("✅ Файл сессии Telegram найден")
        return True
    else:
        print("❌ Файл сессии Telegram НЕ НАЙДЕН")
        print("Запустите авторизацию:")
        print("python auth_telegram.py")
        return False

async def test_telegram_connection():
    """Тест подключения к Telegram API"""
    print("🧪 Тестируем подключение к Telegram API...")
    
    try:
        from server.services.telegram_api_service import telegram_api_service
        
        # Инициализируем клиент
        is_initialized = await telegram_api_service.initialize_client()
        
        if is_initialized:
            print("✅ Подключение к Telegram API успешно")
            
            # Тестируем получение информации о канале
            channel_info = await telegram_api_service.get_channel_info("giftnews")
            if channel_info:
                print(f"✅ Канал giftnews доступен: {channel_info['title']}")
            else:
                print("⚠️ Канал giftnews недоступен")
            
            # Закрываем соединение
            try:
                await telegram_api_service.close()
            except:
                pass
            return True
        else:
            print("❌ Ошибка подключения к Telegram API")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        # Пытаемся закрыть соединение в случае ошибки
        try:
            await telegram_api_service.close()
        except:
            pass
        return False

def start_application():
    """Запуск приложения"""
    print("🚀 Запускаем приложение...")
    
    try:
        # Запускаем FastAPI приложение
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "server.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8001",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Приложение остановлено")
    except Exception as e:
        print(f"❌ Ошибка запуска приложения: {e}")

async def main():
    """Основная функция"""
    print("🚀 Запуск Telegram API для Gift Propaganda")
    print("=" * 50)
    
    # Проверяем зависимости
    if not check_dependencies():
        return
    
    print()
    
    # Проверяем файл сессии
    if not check_session_file():
        return
    
    print()
    
    # Тестируем подключение к Telegram
    if not await test_telegram_connection():
        print("\n💡 Рекомендации:")
        print("1. Проверьте интернет-соединение")
        print("2. Убедитесь, что Telegram не заблокирован")
        print("3. Перезапустите авторизацию: python auth_telegram.py")
        return
    
    print()
    print("🎉 Все проверки пройдены успешно!")
    print()
    print("📡 Доступные endpoints:")
    print("   GET /api/telegram/channel/{channel} - посты из канала")
    print("   GET /api/telegram/channel/{channel}/info - информация о канале")
    print("   GET /api/telegram/channels - список каналов")
    print("   GET /api/telegram/health - состояние API")
    print()
    print("🌐 Приложение будет доступно по адресу: http://localhost:8001")
    print("📚 Документация API: http://localhost:8001/docs")
    print()
    
    # Спрашиваем пользователя о запуске
    response = input("Запустить приложение сейчас? (y/n): ").lower().strip()
    
    if response in ['y', 'yes', 'да', 'д']:
        start_application()
    else:
        print("Для запуска приложения используйте:")
        print("python -m server.main")
        print("или")
        print("uvicorn server.main:app --host 0.0.0.0 --port 8001 --reload")

if __name__ == "__main__":
    asyncio.run(main()) 