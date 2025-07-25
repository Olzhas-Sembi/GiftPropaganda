from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.config import DATABASE_URL
from server.models import Base

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создание таблиц (если нужно)
Base.metadata.create_all(bind=engine)

