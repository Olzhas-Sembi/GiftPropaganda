from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # "telegram" или "rss"
    url = Column(String(500))  # URL для RSS или username для Telegram
    name = Column(String(200), nullable=False)
    chat_id = Column(String(100), nullable=True)  # Для Telegram-каналов с ботом-админом
    category = Column(String(50), default="general")  # gifts, crypto, nft, tech, general
    enabled = Column(Integer, default=1)  # 1 = включен, 0 = отключен

    # Связь с новостями
    news_items = relationship("NewsItem", back_populates="source")


class NewsItem(Base):
    __tablename__ = "news_items"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)  # Разрешаем NULL
    title = Column(String(500), index=True)  # Увеличиваем размер для длинных заголовков
    content = Column(Text)  # Используем Text для длинного контента
    link = Column(String(500))  # Увеличиваем размер для длинных ссылок
    publish_date = Column(DateTime)
    category = Column(String(50))

    # Добавляем поля для медиа контента
    media_type = Column(String(20), nullable=True)  # 'photo', 'video', null
    media_url = Column(String(1000), nullable=True)  # URL медиа файла
    media_thumbnail = Column(String(1000), nullable=True)  # URL превью (для видео)
    media_width = Column(Integer, nullable=True)  # Ширина медиа
    media_height = Column(Integer, nullable=True)  # Высота медиа

    source = relationship("Source", back_populates="news_items")

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    keyword = Column(String(100), nullable=False)
    weight = Column(Integer, default=1)  # Вес ключевого слова для категоризации
