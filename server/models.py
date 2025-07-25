from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
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
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)  # Внешний ключ теперь допускает NULL
    title = Column(String(200), index=True)
    content = Column(String)
    link = Column(String(255))
    publish_date = Column(DateTime)
    category = Column(String(50))
    source = relationship("Source", back_populates="news_items")

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    keyword = Column(String(100), nullable=False)
    weight = Column(Integer, default=1)  # Вес ключевого слова для категоризации
